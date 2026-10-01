import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { ticketFlowEventRepository } from "../repositories/TicketFlowEventRepository";
import { faultReportRepository } from "../repositories/FaultReportRepository";
import { crewRepository } from "../repositories/CrewRepository";
import { auditLogService } from "./AuditLogService";
import { sparePartUsageService, type Actor } from "./SparePartUsageService";
import { BizError } from "../utils/BizError";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { FLOW_RULES, isFlowAction } from "../constants/FlowAction";
import { TICKET_STATUS_RANK } from "../constants/TicketStatus";
import { createRepairTicketFromPayload, createRepairTicketResponse } from "../constructors/RepairTicketDtoFactory";
import { createTicketFlowEventDto } from "../constructors/TicketFlowEventDtoFactory";
import type { RepairTicket } from "../models/RepairTicket";
import type { TicketFlowEvent } from "../models/TicketFlowEvent";
import type { TicketFlowPayload, RepairTicketCreatePayload } from "../types/RepairTicketPayload";
import type { TicketStatus } from "../constants/TicketStatus";
import type { FlowAction } from "../constants/FlowAction";

const T = LOG_TEMPLATES.RepairTicket;

export interface FlowResult {
  ticket: RepairTicket;
  event: TicketFlowEvent;
  deduplicated: boolean;
}

const rankOf = (status: TicketStatus): number => TICKET_STATUS_RANK[status];

const audit = (actor: Actor, action: string, targetId: string | number, detail: string, result: string) =>
  auditLogService.record({ actor: `${actor.role}#${actor.id}`, action, targetType: "RepairTicket", targetId, detail, result });

const validatePayload = (payload: TicketFlowPayload): TicketFlowPayload => {
  if (!payload || typeof payload.request_id !== "string" || payload.request_id.trim().length === 0) {
    throw new BizError("VALIDATION_FAILED", 400, { field: "request_id" });
  }
  if (!isFlowAction(payload.action)) {
    throw new BizError("VALIDATION_FAILED", 400, { field: "action" });
  }
  const sceneSeq = Number(payload.scene_seq);
  if (!Number.isInteger(sceneSeq) || sceneSeq < 1) {
    throw new BizError("VALIDATION_FAILED", 400, { field: "scene_seq" });
  }
  return { ...payload, scene_seq: sceneSeq, note: typeof payload.note === "string" ? payload.note : "" };
};

// 动作落审计时使用的日志模板。
const ACTION_TEMPLATE: Record<FlowAction, string> = {
  DISPATCH: T[1],
  ARRIVE: T[2],
  START_REPAIR: T[3],
  RESTORE: T[4],
  CLOSE: T[5]
};

export const repairTicketService = {
  list: (): RepairTicket[] => repairTicketRepository.findAll().map(createRepairTicketResponse),
  eventsOf: (ticketId: number): TicketFlowEvent[] => ticketFlowEventRepository.findByTicket(ticketId),

  // 报修生成工单：初始 WAIT_DISPATCH，等待派工。
  create: (payload: RepairTicketCreatePayload, actor: Actor): RepairTicket => {
    if (actor.role !== "dispatcher") {
      throw new BizError("RBAC_DENIED", 403, { need: ["dispatcher"], actual: actor.role });
    }
    if (!payload || !(payload.fault_report_id > 0) || !(payload.team_id > 0)) {
      throw new BizError("VALIDATION_FAILED", 400, { fields: ["fault_report_id", "team_id"] });
    }
    if (!faultReportRepository.findById(Number(payload.fault_report_id))) {
      throw new BizError("VALIDATION_FAILED", 400, { field: "fault_report_id", reason: "fault report not found" });
    }
    if (!crewRepository.findById(Number(payload.team_id))) {
      throw new BizError("VALIDATION_FAILED", 400, { field: "team_id", reason: "crew not found" });
    }
    const saved = repairTicketRepository.save(createRepairTicketFromPayload(payload, actor.id));
    audit(actor, T[0], saved.id, `报修#${payload.fault_report_id} 生成工单，待派工`, "APPLIED");
    return createRepairTicketResponse(saved);
  },

  // 处置链推进：到场、处理、复电、关闭统一入口。
  // - 同一 request_id 重复重试：沿用第一次结果（DUPLICATE）
  // - 晚到/并发上报：内容保留为复核记录（REVIEW_ONLY），状态不倒退
  // - 越权或非法流转：记录 REJECTED 后直接拒绝
  advance: (ticketId: number, rawPayload: TicketFlowPayload, actor: Actor): FlowResult => {
    const payload = validatePayload(rawPayload);
    const action = payload.action;

    // 1. 幂等恢复：该请求号已落库，直接返回第一次结果。
    const existing = ticketFlowEventRepository.findByRequestId(payload.request_id);
    if (existing) {
      const ticket = repairTicketRepository.findById(existing.ticket_id);
      if (!ticket) throw new BizError("TICKET_NOT_FOUND", 404, { ticket_id: existing.ticket_id });
      audit(actor, T[6], existing.ticket_id, `重复请求 ${payload.request_id}，沿用首次结果`, "DUPLICATE");
      return { ticket: createRepairTicketResponse(ticket), event: existing, deduplicated: true };
    }

    const ticket = repairTicketRepository.findById(ticketId);
    if (!ticket) throw new BizError("TICKET_NOT_FOUND", 404, { ticket_id: ticketId });

    const rule = FLOW_RULES[action];
    const record = (result: TicketFlowEvent["result"], toStatus: TicketStatus): TicketFlowEvent =>
      ticketFlowEventRepository.save(createTicketFlowEventDto({
        ticket_id: ticketId,
        request_id: payload.request_id,
        scene_seq: payload.scene_seq,
        action,
        actor_id: actor.id,
        actor_role: actor.role,
        note: payload.note ?? "",
        result,
        from_status: ticket.status,
        to_status: toStatus
      }));

    // 2. 越权直接拒绝（如班组成员确认复电），拒绝也留痕。
    if (!rule.roles.includes(actor.role)) {
      const event = record("REJECTED", ticket.status);
      audit(actor, T[8], ticketId, `${action} 越权：需要 ${rule.roles.join("/")}，实际 ${actor.role}`, "REJECTED");
      throw new BizError("RBAC_DENIED", 403, { need: rule.roles, actual: actor.role, event_id: event.id });
    }

    const curRank = rankOf(ticket.status);
    const fromRank = rankOf(rule.from);
    const toRank = rankOf(rule.to);

    // 3. 先落库的有效请求已经推进过状态：后到内容保留为复核记录，工单不变。
    if (curRank >= toRank) {
      const event = record("REVIEW_ONLY", ticket.status);
      audit(actor, T[7], ticketId, `${action} 晚到：当前 ${ticket.status}，内容保留为复核记录`, "REVIEW_ONLY");
      return { ticket: createRepairTicketResponse(ticket), event, deduplicated: false };
    }

    // 4. 状态未就绪（跳步），拒绝。
    if (curRank !== fromRank) {
      const event = record("REJECTED", ticket.status);
      audit(actor, T[8], ticketId, `${action} 非法流转：${ticket.status} 不允许进入 ${rule.to}`, "REJECTED");
      throw new BizError("TICKET_STATE_CONFLICT", 409, { current: ticket.status, expect: rule.from, event_id: event.id });
    }

    // 5. 关闭前备件对账：未归还/未消耗挡住关闭并列出原因。
    if (action === "CLOSE") {
      const report = sparePartUsageService.reconcile(ticketId);
      if (!report.settled) {
        const event = record("REJECTED", ticket.status);
        audit(actor, T[9], ticketId, `关闭被挡：${report.pending.length} 项备件未对账`, "REJECTED");
        throw new BizError("SPARE_PART_UNSETTLED", 409, { reasons: report.pending, event_id: event.id });
      }
    }

    // 6. 有效推进：状态秩单调上升，迟到更新永远无法盖掉更高状态。
    const patch: Partial<RepairTicket> = {};
    if (action === "DISPATCH") patch.assigned_at = new Date().toISOString();
    if (action === "RESTORE") patch.restored_at = new Date().toISOString();
    if (action === "CLOSE") patch.closed_at = new Date().toISOString();
    const updated = repairTicketRepository.advanceStatus(ticketId, rule.to, rankOf, patch);
    if (!updated || updated.status !== rule.to) {
      // 并发下状态已被其它请求推进：本次转为复核记录。
      const current = repairTicketRepository.findById(ticketId) ?? ticket;
      const event = record("REVIEW_ONLY", current.status);
      audit(actor, T[7], ticketId, `${action} 并发冲突：内容保留为复核记录`, "REVIEW_ONLY");
      return { ticket: createRepairTicketResponse(current), event, deduplicated: false };
    }

    const event = record("APPLIED", rule.to);
    syncLinkedEntities(updated, actor);
    audit(actor, ACTION_TEMPLATE[action], ticketId, `${ticket.status} -> ${rule.to}${payload.note ? `：${payload.note}` : ""}`, "APPLIED");
    return { ticket: createRepairTicketResponse(updated), event, deduplicated: false };
  },

  // 断网恢复：按原请求号查询第一次落库结果。
  recover: (requestId: string): FlowResult => {
    const event = ticketFlowEventRepository.findByRequestId(requestId);
    if (!event) throw new BizError("FLOW_REQUEST_NOT_FOUND", 404, { request_id: requestId });
    const ticket = repairTicketRepository.findById(event.ticket_id);
    if (!ticket) throw new BizError("TICKET_NOT_FOUND", 404, { ticket_id: event.ticket_id });
    return { ticket: createRepairTicketResponse(ticket), event, deduplicated: true };
  }
};

// 工单推进后同步故障报修状态与班组任务，让报修-工单-班组成为同一条链。
const syncLinkedEntities = (ticket: RepairTicket, _actor: Actor): void => {
  faultReportRepository.updateStatus(ticket.fault_report_id, ticket.status);
  if (ticket.status === "ASSIGNED") {
    crewRepository.assignTicket(ticket.team_id, ticket.id);
  }
  if (ticket.status === "CLOSED") {
    crewRepository.releaseTicket(ticket.team_id, ticket.id);
  }
};
