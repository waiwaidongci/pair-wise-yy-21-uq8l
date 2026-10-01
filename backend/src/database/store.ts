import { seed } from "../seed";
import type { RepairTicket } from "../models/RepairTicket";
import type { SparePartUsage } from "../models/SparePartUsage";
import type { IdempotencyRecord } from "../models/IdempotencyRecord";
import type { ReviewRecord } from "../models/ReviewRecord";
import type { TicketEvent } from "../models/TicketEvent";

export interface DbRow {
  id: number;
}

// 泛型内存表：提供自增主键、乐观锁更新
export class Table<T extends DbRow> {
  rows: T[];
  private nextId: number;

  constructor(seedRows: T[] = []) {
    this.rows = [...seedRows];
    this.nextId = seedRows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  }

  all(): T[] {
    return [...this.rows];
  }

  get(id: number): T | undefined {
    return this.rows.find((r) => r.id === id);
  }

  find(pred: (r: T) => boolean): T | undefined {
    return this.rows.find(pred);
  }

  filter(pred: (r: T) => boolean): T[] {
    return this.rows.filter(pred);
  }

  insert(row: Omit<T, "id">): T {
    const created = { ...(row as object), id: this.nextId++ } as T;
    this.rows.push(created);
    return created;
  }

  update(id: number, patch: Partial<T>): T | undefined {
    const idx = this.rows.findIndex((r) => r.id === id);
    if (idx < 0) return undefined;
    this.rows[idx] = { ...this.rows[idx], ...patch };
    return this.rows[idx];
  }

  // 乐观锁：仅当 version 匹配时更新，返回是否成功
  casUpdate(id: number, expectedVersion: number, patch: Partial<T>): { ok: boolean; row?: T } {
    const row = this.get(id);
    if (!row || (row as unknown as RepairTicket).version !== expectedVersion) {
      return { ok: false };
    }
    return { ok: true, row: this.update(id, patch) };
  }
}

function now(): string {
  return new Date().toISOString();
}

// 归一化工单：补齐处置链字段
function normalizeTickets(): RepairTicket[] {
  return (seed.repairTicket as unknown as RepairTicket[]).map((t) => ({
    ...t,
    restored_at: null,
    site_seq: t.status === "ARRIVED" ? 1 : 0,
    version: 1
  }));
}

// 归一化备件：覆盖申请/审批/领用/归还/消耗全状态
function normalizeParts(): SparePartUsage[] {
  const base = seed.sparePartUsage as unknown as SparePartUsage[];
  return [
    { ...base[0], id: 1, ticket_id: 1, usage_status: "TAKEN", quantity: 2, approved_by: "u2", applied_at: "2026-06-11T09:10:00Z", approved_at: "2026-06-11T09:30:00Z", settled_at: null },
    { ...base[1], id: 2, ticket_id: 2, usage_status: "RETURNED", quantity: 1, approved_by: "u2", applied_at: "2026-06-12T09:10:00Z", approved_at: "2026-06-12T09:30:00Z", settled_at: "2026-06-12T11:00:00Z" },
    { ...base[2], id: 3, ticket_id: 3, usage_status: "PENDING", quantity: 4, approved_by: null, applied_at: "2026-06-13T09:10:00Z", approved_at: null, settled_at: null }
  ];
}

class Database {
  repairTicket = new Table<RepairTicket>(normalizeTickets());
  sparePartUsage = new Table<SparePartUsage>(normalizeParts());
  idempotencyRecord = new Table<IdempotencyRecord>([]);
  reviewRecord = new Table<ReviewRecord>([]);
  ticketEvent = new Table<TicketEvent>([]);
  auditLog = new Table<{ id: number; actor: string; action: string; target_type: string; target_id: string; created_at: string }>([]);

  // 幂等查询：按原请求号
  findIdempotent(requestId: string): IdempotencyRecord | undefined {
    return this.idempotencyRecord.find((r) => r.request_id === requestId);
  }

  // 写入幂等记录（与状态变更同生共死）
  storeIdempotent(rec: Omit<IdempotencyRecord, "id">): IdempotencyRecord {
    return this.idempotencyRecord.insert(rec);
  }

  // 留存复核记录
  storeReview(rec: Omit<ReviewRecord, "id">): ReviewRecord {
    return this.reviewRecord.insert(rec);
  }

  // 追加处置链事件
  appendEvent(rec: Omit<TicketEvent, "id">): TicketEvent {
    return this.ticketEvent.insert(rec);
  }
}

export const db = new Database();
export { now };
