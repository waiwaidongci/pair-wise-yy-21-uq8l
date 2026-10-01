import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import { idempotencyRepository } from "../repositories/IdempotencyRepository";
import { reviewRecordRepository } from "../repositories/ReviewRecordRepository";
import { ticketEventRepository } from "../repositories/TicketEventRepository";
import { canTransition, type TicketStatus } from "../constants/TicketStatus";
import { isSparePartSettled } from "../constants/SparePartStatus";
import { roleCan, RESTORE_ALLOWED_ROLES, type Role } from "../constants/Role";
import { ERROR_CODES } from "../constants/errorCodes";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { appError } from "../utils/errors";
import { now } from "../database/store";
import type { RepairTicket } from "../models/RepairTicket";
import type { SparePartUsage } from "../models/SparePartUsage";

// 现场动作 -> 目标状态
const ACTION_TO_STATUS: Record<string, TicketStatus> = {
  dispatch: "ASSIGNED",
  arrive: "ARRIVED",
  start_repair: "REPAIRING",
  restore: "RESTORED",
  close: "CLOSED"
};

// 未结算备件的中文动作提示
const SETTLE_ACTION_TEXT: Record<string, string> = {
  PENDING: "审批",
  APPROVED: "领用",
  TAKEN: "归还或消耗"
};

export interface ChainUser {
  id: number;
  role: string;
}

export interface TransitionInput {
  requestId: string;
  siteSeq: number;
  operatorId: number;
  note?: string;
}

export interface TransitionResult {
  applied: boolean;
  replay?: boolean;
  reason?: string;
  ticket: RepairTicket;
  event?: unknown;
  review?: unknown;
  blockedParts?: Array<{ partCode: string; partName: string; quantity: number; status: string; settleAction: string }>;
}

function log(template: string, payload: Record<string, unknown>): void {
  console.info(JSON.stringify({ template, ...payload, at: now() }));
}

class RepairTicketService {
  list(): RepairTicket[] {
    return repairTicketRepository.findAll();
  }

  get(id: number): RepairTicket {
    const ticket = repairTicketRepository.findById(id);
    if (!ticket) {
      throw appError(404, ERROR_CODES.TICKET_NOT_FOUND, "TICKET_NOT_FOUND", { ticketId: id });
    }
    return ticket;
  }

  // 工单详情：含处置事件与备件
  detail(id: number): { ticket: RepairTicket; events: unknown[]; parts: SparePartUsage[]; reviews: unknown[] } {
    const ticket = this.get(id);
    return {
      ticket,
      events: ticketEventRepository.findByTicket(id),
      parts: sparePartUsageRepository.findByTicket(id),
      reviews: reviewRecordRepository.findByTicket(id)
    };
  }

  // 处置链推进：到场 / 处理 / 复电 / 关闭
  transition(ticketId: number, action: string, input: TransitionInput, user: ChainUser): TransitionResult {
    // 1. 幂等：按原请求号恢复，重试沿用第一次结果
    const existing = idempotencyRepository.findByRequestId(input.requestId);
    if (existing) {
      log(LOG_TEMPLATES.RepairTicket[8], { requestId: input.requestId, ticketId });
      return { ...(JSON.parse(existing.response) as TransitionResult), replay: true };
    }

    const ticket = this.get(ticketId);
    const targetStatus = ACTION_TO_STATUS[action];
    if (!targetStatus) {
      throw appError(400, ERROR_CODES.VALIDATION_FAILED, "VALIDATION_FAILED", { field: "action" });
    }

    // 2. RBAC：复电确认仅调度员，班组成员越权直接拒绝
    if (action === "restore") {
      if (!RESTORE_ALLOWED_ROLES.includes(user.role as Role)) {
        log(LOG_TEMPLATES.Auth[2], { ticketId, operatorId: user.id, role: user.role });
        throw appError(403, ERROR_CODES.RBAC_DENIED, "RBAC_DENIED", { role: user.role, action });
      }
    } else if (!roleCan(user.role, action)) {
      log(LOG_TEMPLATES.Auth[1], { ticketId, operatorId: user.id, role: user.role, action });
      throw appError(403, ERROR_CODES.RBAC_DENIED, "RBAC_DENIED", { role: user.role, action });
    }

    // 3. 现场序号过期：迟到的离线上报，留存复核
    if (input.siteSeq < ticket.site_seq) {
      const review = reviewRecordRepository.save({
        ticket_id: ticketId,
        request_id: input.requestId,
        site_seq: input.siteSeq,
        event_type: action,
        payload: JSON.stringify(input),
        reason: "STALE_SEQ",
        created_at: now()
      });
      log(LOG_TEMPLATES.Review[2], { ticketId, requestId: input.requestId, siteSeq: input.siteSeq, currentSeq: ticket.site_seq });
      return { applied: false, reason: "STALE_SEQ", ticket, review };
    }

    // 4. 状态倒退校验：先落库的有效请求改变工单，后到内容留存复核
    if (!canTransition(ticket.status, targetStatus)) {
      const review = reviewRecordRepository.save({
        ticket_id: ticketId,
        request_id: input.requestId,
        site_seq: input.siteSeq,
        event_type: action,
        payload: JSON.stringify(input),
        reason: "STATE_REGRESSION",
        created_at: now()
      });
      log(LOG_TEMPLATES.Review[1], { ticketId, requestId: input.requestId, current: ticket.status, target: targetStatus });
      return { applied: false, reason: "STATE_REGRESSION", ticket, review };
    }

    // 5. 关闭前对账：备件未归还/未消耗则挡住关闭并列出原因
    let blockedParts: TransitionResult["blockedParts"];
    if (action === "close") {
      const parts = sparePartUsageRepository.findByTicket(ticketId);
      const unsettled = parts.filter((p) => !isSparePartSettled(p.usage_status));
      if (unsettled.length > 0) {
        blockedParts = unsettled.map((p) => ({
          partCode: p.part_code,
          partName: p.part_name,
          quantity: p.quantity,
          status: p.usage_status,
          settleAction: SETTLE_ACTION_TEXT[p.usage_status] ?? "结算"
        }));
        log(LOG_TEMPLATES.SparePartUsage[5], { ticketId, blocked: blockedParts });
        throw appError(409, ERROR_CODES.PART_NOT_RETURNED, "PART_NOT_RETURNED", {
          partCode: blockedParts.map((b) => b.partCode).join(","),
          partName: blockedParts.map((b) => b.partName).join(","),
          settleAction: blockedParts.map((b) => b.settleAction).join("、"),
          count: blockedParts.reduce((s, b) => s + b.quantity, 0)
        });
      }
    }

    // 6. 落库：乐观锁 CAS，version 不匹配说明被并发请求改过
    const nextSeq = ticket.site_seq + 1;
    const patch: Partial<RepairTicket> = {
      status: targetStatus,
      site_seq: nextSeq,
      version: ticket.version + 1
    };
    if (action === "restore") patch.restored_at = now();

    const updated = repairTicketRepository.casUpdate(ticketId, ticket.version, patch);
    if (!updated) {
      // 并发写冲突：可重试错误，客户端按原请求号重试
      throw appError(409, ERROR_CODES.WRITE_FAILED_RETRYABLE, "WRITE_FAILED_RETRYABLE", { requestId: input.requestId });
    }

    // 7. 处置事件 + 幂等记录（与状态变更同生共死）
    const event = ticketEventRepository.save({
      ticket_id: ticketId,
      event_type: action,
      from_status: ticket.status,
      to_status: targetStatus,
      site_seq: nextSeq,
      request_id: input.requestId,
      operator_id: input.operatorId,
      operator_role: user.role,
      note: input.note ?? "",
      created_at: now()
    });

    const result: TransitionResult = { applied: true, ticket: updated, event, blockedParts };
    idempotencyRepository.save({
      request_id: input.requestId,
      target_type: "RepairTicket",
      target_id: ticketId,
      event_type: action,
      response: JSON.stringify(result),
      created_at: now()
    });

    const templateByAction: Record<string, string> = {
      dispatch: LOG_TEMPLATES.RepairTicket[1],
      arrive: LOG_TEMPLATES.RepairTicket[2],
      start_repair: LOG_TEMPLATES.RepairTicket[3],
      restore: LOG_TEMPLATES.RepairTicket[4],
      close: LOG_TEMPLATES.RepairTicket[5]
    };
    log(templateByAction[action] ?? "RepairTicket.transition", {
      ticketId,
      requestId: input.requestId,
      from: ticket.status,
      to: targetStatus,
      siteSeq: nextSeq,
      operatorId: input.operatorId,
      role: user.role
    });

    return result;
  }
}

export const repairTicketService = new RepairTicketService();
