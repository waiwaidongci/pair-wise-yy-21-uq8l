import type { SparePartUsageStatus } from "../constants/SparePartUsageStatus";

export interface SparePartUsage {
  id: number;
  ticket_id: number;
  part_code: string;
  part_name: string;
  quantity: number;
  warehouse_name: string;
  approved_by: string | null;
  usage_status: SparePartUsageStatus;
  request_id: string;
  updated_at: string;
}
