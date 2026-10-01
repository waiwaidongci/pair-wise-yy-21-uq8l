import { seed } from "../seed";
import type { SparePartUsage } from "../models/SparePartUsage";
import type { SparePartUsageStatus } from "../constants/SparePartUsageStatus";

const rows: SparePartUsage[] = seed.sparePartUsage.map((row) => ({ ...row })) as SparePartUsage[];

const clone = (row: SparePartUsage): SparePartUsage => ({ ...row });

export const sparePartUsageRepository = {
  findAll: (): SparePartUsage[] => rows.map(clone),
  findById: (id: number): SparePartUsage | undefined => {
    const found = rows.find((row) => row.id === id);
    return found ? clone(found) : undefined;
  },
  findByTicket: (ticketId: number): SparePartUsage[] =>
    rows.filter((row) => row.ticket_id === ticketId).map(clone),
  findByRequestId: (requestId: string): SparePartUsage | undefined => {
    const found = rows.find((row) => row.request_id === requestId);
    return found ? clone(found) : undefined;
  },
  save: (row: Omit<SparePartUsage, "id"> & { id?: number }): SparePartUsage => {
    const id = row.id ?? Math.max(0, ...rows.map((r) => r.id)) + 1;
    const record = { ...row, id } as SparePartUsage;
    rows.push(record);
    return clone(record);
  },
  updateStatus: (id: number, status: SparePartUsageStatus, patch: Partial<SparePartUsage> = {}): SparePartUsage | undefined => {
    const found = rows.find((row) => row.id === id);
    if (!found) return undefined;
    found.usage_status = status;
    Object.assign(found, patch);
    found.updated_at = new Date().toISOString();
    return clone(found);
  }
};
