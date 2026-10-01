import { db } from "../database/store";
import type { SparePartUsage } from "../models/SparePartUsage";

export const sparePartUsageRepository = {
  findAll: (): SparePartUsage[] => db.sparePartUsage.all(),
  findById: (id: number): SparePartUsage | undefined => db.sparePartUsage.get(id),
  findByTicket: (ticketId: number): SparePartUsage[] =>
    db.sparePartUsage.filter((p) => p.ticket_id === ticketId),
  save: (row: Omit<SparePartUsage, "id">): SparePartUsage => db.sparePartUsage.insert(row),
  update: (id: number, patch: Partial<SparePartUsage>): SparePartUsage | undefined =>
    db.sparePartUsage.update(id, patch)
};
