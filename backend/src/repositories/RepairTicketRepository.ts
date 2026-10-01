import { db } from "../database/store";
import type { RepairTicket } from "../models/RepairTicket";

export const repairTicketRepository = {
  findAll: (): RepairTicket[] => db.repairTicket.all(),
  findById: (id: number): RepairTicket | undefined => db.repairTicket.get(id),
  findByFaultReport: (faultReportId: number): RepairTicket | undefined =>
    db.repairTicket.find((t) => t.fault_report_id === faultReportId),
  save: (row: Omit<RepairTicket, "id">): RepairTicket => db.repairTicket.insert(row),
  updateStatus: (id: number, patch: Partial<RepairTicket>): RepairTicket | undefined =>
    db.repairTicket.update(id, patch),
  // 乐观锁更新：version 不匹配返回 undefined
  casUpdate: (id: number, expectedVersion: number, patch: Partial<RepairTicket>): RepairTicket | undefined => {
    const res = db.repairTicket.casUpdate(id, expectedVersion, patch);
    return res.ok ? res.row : undefined;
  }
};
