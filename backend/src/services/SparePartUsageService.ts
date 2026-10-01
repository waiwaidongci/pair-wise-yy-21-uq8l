import { sparePartUsageRepository } from "../repositories/SparePartUsageRepository";
import { repairTicketRepository } from "../repositories/RepairTicketRepository";
import { idempotencyRepository } from "../repositories/IdempotencyRepository";
import { isSparePartSettled, UNSETTLED_SPARE_PART_STATUSES, type SparePartStatus } from "../constants/SparePartStatus";
import { roleCan } from "../constants/Role";
import { ERROR_CODES } from "../constants/errorCodes";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { appError } from "../utils/errors";
import { now } from "../database/store";
import type { SparePartUsage } from "../models/SparePartUsage";
import type { ChainUser } from "./RepairTicketService";

// 备件状态流转：申请 -> 审批 -> 领用 -> 归还/消耗
const PART_TRANSITIONS: Record<string, SparePartStatus> = {
  approve: "APPROVED",
  take: "TAKEN",
  return: "RETURNED",
  consume: "CONSUMED"
};

// 每个动作要求的当前状态
const PART_REQUIRED_STATUS: Record<string, SparePartStatus[]> = {
  approve: ["PENDING"],
  take: ["APPROVED"],
  return: ["TAKEN"],
  consume: ["TAKEN"]
};

function log(template: string, payload: Record<string, unknown>): void {
  console.info(JSON.stringify({ template, ...payload, at: now() }));
}

class SparePartUsageService {
  list(): SparePartUsage[] {
    return sparePartUsageRepository.findAll();
  }

  // 申请备件
  apply(input: { requestId: string; ticketId: number; partCode: string; partName: string; quantity: number; warehouseName: string; operatorId: number }, user: ChainUser): SparePartUsage {
    if (!roleCan(user.role, "part.apply")) {
      throw appError(403, ERROR_CODES.RBAC_DENIED, "RBAC_DENIED", { role: user.role, action: "part.apply" });
    }
    const ticket = repairTicketRepository.findById(input.ticketId);
    if (!ticket) {
      throw appError(404, ERROR_CODES.TICKET_NOT_FOUND, "TICKET_NOT_FOUND", { ticketId: input.ticketId });
    }
    const created = sparePartUsageRepository.save({
      ticket_id: input.ticketId,
      part_code: input.partCode,
      part_name: input.partName,
      quantity: input.quantity,
      warehouse_name: input.warehouseName,
      approved_by: null,
      usage_status: "PENDING",
      applied_at: now(),
      approved_at: null,
      settled_at: null
    });
    log(LOG_TEMPLATES.SparePartUsage[0], { partId: created.id, ticketId: input.ticketId, operatorId: user.id });
    return created;
  }

  // 备件状态流转：审批 / 领用 / 归还 / 消耗
  settle(partId: number, action: string, input: { requestId: string; operatorId: number; note?: string }, user: ChainUser): SparePartUsage {
    const existing = idempotencyRepository.findByRequestId(input.requestId);
    if (existing) {
      log(LOG_TEMPLATES.RepairTicket[8], { requestId: input.requestId, partId });
      return JSON.parse(existing.response) as SparePartUsage;
    }

    const part = sparePartUsageRepository.findById(partId);
    if (!part) {
      throw appError(404, ERROR_CODES.PART_NOT_FOUND, "PART_NOT_FOUND", { partId });
    }

    const targetStatus = PART_TRANSITIONS[action];
    if (!targetStatus) {
      throw appError(400, ERROR_CODES.VALIDATION_FAILED, "VALIDATION_FAILED", { field: "action" });
    }

    if (!roleCan(user.role, `part.${action}`)) {
      throw appError(403, ERROR_CODES.RBAC_DENIED, "RBAC_DENIED", { role: user.role, action: `part.${action}` });
    }

    const required = PART_REQUIRED_STATUS[action] ?? [];
    if (!required.includes(part.usage_status as SparePartStatus)) {
      throw appError(409, ERROR_CODES.INVALID_PART_STATUS, "INVALID_PART_STATUS", { status: part.usage_status, action });
    }

    const patch: Partial<SparePartUsage> = { usage_status: targetStatus };
    if (action === "approve") {
      patch.approved_by = String(user.id);
      patch.approved_at = now();
    }
    if (action === "return" || action === "consume") {
      patch.settled_at = now();
    }

    const updated = sparePartUsageRepository.update(partId, patch) as SparePartUsage;

    idempotencyRepository.save({
      request_id: input.requestId,
      target_type: "SparePartUsage",
      target_id: partId,
      event_type: action,
      response: JSON.stringify(updated),
      created_at: now()
    });

    const templateIndex = { approve: 1, take: 2, return: 3, consume: 4 }[action] ?? 0;
    log(LOG_TEMPLATES.SparePartUsage[templateIndex], { partId, ticketId: part.ticket_id, from: part.usage_status, to: targetStatus, operatorId: user.id });

    return updated;
  }

  // 对账：列出工单未结算备件
  reconcile(ticketId: number): { settled: boolean; ticketId: number; unsettled: SparePartUsage[] } {
    const parts = sparePartUsageRepository.findByTicket(ticketId);
    const unsettled = parts.filter((p) => !isSparePartSettled(p.usage_status));
    return { settled: unsettled.length === 0, ticketId, unsettled };
  }

  // 全量未结算统计
  unsettledAll(): SparePartUsage[] {
    return sparePartUsageRepository.findAll().filter((p) =>
      (UNSETTLED_SPARE_PART_STATUSES as readonly string[]).includes(p.usage_status)
    );
  }
}

export const sparePartUsageService = new SparePartUsageService();
