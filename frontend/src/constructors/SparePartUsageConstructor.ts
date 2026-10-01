import type { SparePartUsage } from "../types/SparePartUsage";

export const createDefaultSparePartUsage = (overrides: Partial<SparePartUsage> = {}): SparePartUsage => ({
  id: 0,
  ticket_id: 0,
  part_code: "",
  part_name: "",
  quantity: 1,
  warehouse_name: "",
  approved_by: null,
  usage_status: "REQUESTED",
  request_id: "",
  updated_at: new Date().toISOString(),
  ...overrides
});

export const createSparePartUsageForm = createDefaultSparePartUsage;
export const createSparePartUsageResponse = createDefaultSparePartUsage;
