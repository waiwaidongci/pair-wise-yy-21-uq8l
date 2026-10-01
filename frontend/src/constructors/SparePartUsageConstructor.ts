import type { SparePartUsage } from "../types/SparePartUsage";

export const createDefaultSparePartUsage = (overrides: Partial<SparePartUsage> = {}): SparePartUsage => ({
  id: 0,
  ticket_id: 0,
  part_code: "",
  part_name: "",
  quantity: 0,
  warehouse_name: "",
  approved_by: null,
  usage_status: "PENDING",
  applied_at: "",
  approved_at: null,
  settled_at: null,
  ...overrides
});

export const createSparePartUsageForm = createDefaultSparePartUsage;
export const createSparePartUsageResponse = createDefaultSparePartUsage;
