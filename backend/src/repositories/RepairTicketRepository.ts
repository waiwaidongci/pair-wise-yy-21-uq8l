import { seed } from "../seed";
import type { RepairTicket } from "../models/RepairTicket";
import type { TicketStatus } from "../constants/TicketStatus";

// 进程内有状态仓库：以种子数据初始化，写操作真实落库（内存表）。
const rows: RepairTicket[] = seed.repairTicket.map((row) => ({ ...row })) as RepairTicket[];

const clone = (row: RepairTicket): RepairTicket => ({ ...row });

export const repairTicketRepository = {
  findAll: (): RepairTicket[] => rows.map(clone),
  findById: (id: number): RepairTicket | undefined => {
    const found = rows.find((row) => row.id === id);
    return found ? clone(found) : undefined;
  },
  save: (row: Omit<RepairTicket, "id"> & { id?: number }): RepairTicket => {
    const id = row.id ?? Math.max(0, ...rows.map((r) => r.id)) + 1;
    const record = { ...row, id } as RepairTicket;
    rows.push(record);
    return clone(record);
  },
  // 状态单调推进：仅当目标状态秩高于当前秩时才落库，返回是否真正变更。
  advanceStatus: (id: number, to: TicketStatus, rankOf: (s: TicketStatus) => number, patch: Partial<RepairTicket>): RepairTicket | undefined => {
    const found = rows.find((row) => row.id === id);
    if (!found) return undefined;
    if (rankOf(to) <= rankOf(found.status)) return clone(found);
    found.status = to;
    Object.assign(found, patch);
    found.updated_at = new Date().toISOString();
    return clone(found);
  }
};
