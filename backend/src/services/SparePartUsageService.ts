import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { auditLogService } from "./AuditLogService";
import { BizError } from "../utils/BizError";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { SETTLED_USAGE_STATUS } from "../constants/SparePartUsageStatus";
import { createSparePartUsageFromPayload, createSparePartUsageResponse } from "../constructors/SparePartUsageDtoFactory";
import type { SparePartUsage } from "../models/SparePartUsage";
import type { SparePartUsageCreatePayload } from "../types/SparePartUsagePayload";
import type { Role } from "../constants/Role";

export interface Actor {
  id: number;
  role: Role;
}

export interface ReconcileReason {
  usage_id: number;
  part_code: string;
  part_name: string;
  quantity: number;
  usage_status: string;
  reason: string;
}

export interface ReconcileReport {
  ticket_id: string;
  settled: boolean;
  pending: ReconcileReason[];
}

const USAGE_STATUS_REASON: Record<string, string> = {
  REQUESTED: "备件申请未审批出库",
  ISSUED: "备件已出库未归还也未登记消耗"
};

// 备件操作角色：申请=班组长/调度员，审批出库/归还/消耗=仓管（调度员可代办）。
const APPLY_ROLES: readonly Role[] = ["crew_leader", "dispatcher"];
const WAREHOUSE_ROLES: readonly Role[] = ["warehouse", "dispatcher"];

const requireRole = (actor: Actor, roles: readonly Role[]) => {
  if (!roles.includes(actor.role)) {
    throw new BizError("RBAC_DENIED", 403, { need: roles, actual: actor.role });
  }
};

const requireRequestId = (requestId: unknown): string => {
  if (typeof requestId !== "string" || requestId.trim().length === 0) {
    throw new BizError("VALIDATION_FAILED", 400, { field: "request_id" });
  }
  return requestId;
};

const audit = (actor: Actor, action: string, targetId: string | number, detail: string, result: string) =>
  auditLogService.record({ actor: `${actor.role}#${actor.id}`, action, targetType: "SparePartUsage", targetId, detail, result });

export const sparePartUsageService = {
  list: (): SparePartUsage[] => sparePartUsageRepository.findAll().map(createSparePartUsageResponse),
  listByTicket: (ticketId: number): SparePartUsage[] =>
    sparePartUsageRepository.findByTicket(ticketId).map(createSparePartUsageResponse),

  // 申请备件：request_id 幂等，重复提交沿用第一次结果，避免同一工单重复领用。
  apply: (payload: SparePartUsageCreatePayload, actor: Actor): { usage: SparePartUsage; deduplicated: boolean } => {
    requireRole(actor, APPLY_ROLES);
    const requestId = requireRequestId(payload?.request_id);
    const existing = sparePartUsageRepository.findByRequestId(requestId);
    if (existing) {
      audit(actor, LOG_TEMPLATES.SparePartUsage[4], existing.id, `重复请求 ${requestId}，沿用首次结果`, "DUPLICATE");
      return { usage: createSparePartUsageResponse(existing), deduplicated: true };
    }
    if (!repairTicketRepository.findById(Number(payload?.ticket_id))) {
      throw new BizError("TICKET_NOT_FOUND", 404, { ticket_id: payload?.ticket_id });
    }
    if (!payload.part_code || !payload.part_name || !(payload.quantity > 0) || !payload.warehouse_name) {
      throw new BizError("VALIDATION_FAILED", 400, { fields: ["part_code", "part_name", "quantity", "warehouse_name"] });
    }
    const saved = sparePartUsageRepository.save(createSparePartUsageFromPayload({ ...payload, request_id: requestId }));
    audit(actor, LOG_TEMPLATES.SparePartUsage[0], saved.id, `申请 ${saved.part_name} x${saved.quantity}`, "APPLIED");
    return { usage: createSparePartUsageResponse(saved), deduplicated: false };
  },

  // 审批出库 / 归还 / 消耗共用入口：按 request_id 幂等，重复重试不重复消耗。
  transit: (id: number, action: "approve" | "consume" | "return", requestIdRaw: unknown, actor: Actor): { usage: SparePartUsage; deduplicated: boolean } => {
    requireRole(actor, WAREHOUSE_ROLES);
    const requestId = requireRequestId(requestIdRaw);
    const duplicated = sparePartUsageRepository.findByRequestId(requestId);
    if (duplicated) {
      audit(actor, LOG_TEMPLATES.SparePartUsage[4], duplicated.id, `重复请求 ${requestId}，沿用首次结果`, "DUPLICATE");
      return { usage: createSparePartUsageResponse(duplicated), deduplicated: true };
    }
    const current = sparePartUsageRepository.findById(id);
    if (!current) throw new BizError("SPARE_PART_NOT_FOUND", 404, { id });

    const transitions = {
      approve: { from: "REQUESTED", to: "ISSUED", template: LOG_TEMPLATES.SparePartUsage[1], text: "审批出库" },
      consume: { from: "ISSUED", to: "CONSUMED", template: LOG_TEMPLATES.SparePartUsage[2], text: "登记消耗" },
      return: { from: "ISSUED", to: "RETURNED", template: LOG_TEMPLATES.SparePartUsage[3], text: "归还入库" }
    } as const;
    const rule = transitions[action];
    if (current.usage_status !== rule.from) {
      throw new BizError("SPARE_PART_STATE_CONFLICT", 409, { current: current.usage_status, expect: rule.from });
    }
    const updated = sparePartUsageRepository.updateStatus(id, rule.to, {
      request_id: requestId,
      approved_by: action === "approve" ? `${actor.role}#${actor.id}` : current.approved_by
    });
    if (!updated) throw new BizError("SPARE_PART_NOT_FOUND", 404, { id });
    audit(actor, rule.template, id, `${rule.text} ${updated.part_name} x${updated.quantity}`, "APPLIED");
    return { usage: createSparePartUsageResponse(updated), deduplicated: false };
  },

  // 工单关闭前对账：列出所有未办结（未归还/未消耗/未出库）的备件原因。
  reconcile: (ticketId: number): ReconcileReport => {
    const usages = sparePartUsageRepository.findByTicket(ticketId);
    const pending: ReconcileReason[] = usages
      .filter((usage) => !SETTLED_USAGE_STATUS.includes(usage.usage_status))
      .map((usage) => ({
        usage_id: usage.id,
        part_code: usage.part_code,
        part_name: usage.part_name,
        quantity: usage.quantity,
        usage_status: usage.usage_status,
        reason: USAGE_STATUS_REASON[usage.usage_status] ?? "备件状态未办结"
      }));
    return { ticket_id: String(ticketId), settled: pending.length === 0, pending };
  },

  assertSettled: (ticketId: number): void => {
    const report = sparePartUsageService.reconcile(ticketId);
    if (!report.settled) {
      throw new BizError("SPARE_PART_UNSETTLED", 409, { reasons: report.pending });
    }
  }
};
