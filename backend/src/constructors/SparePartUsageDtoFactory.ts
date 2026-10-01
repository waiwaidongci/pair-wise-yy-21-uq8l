import type { SparePartUsage } from "../models/SparePartUsage";
import type { SparePartUsageCreatePayload } from "../types/SparePartUsagePayload";

export const createSparePartUsageDto = (overrides: Partial<SparePartUsage> = {}): SparePartUsage => ({
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

export const createSparePartUsageFromPayload = (payload: SparePartUsageCreatePayload): SparePartUsage =>
  createSparePartUsageDto({
    ticket_id: payload.ticket_id,
    part_code: payload.part_code,
    part_name: payload.part_name,
    quantity: payload.quantity,
    warehouse_name: payload.warehouse_name,
    request_id: payload.request_id,
    usage_status: "REQUESTED"
  });

export const createSparePartUsageResponse = (row: SparePartUsage): SparePartUsage => createSparePartUsageDto(row);
