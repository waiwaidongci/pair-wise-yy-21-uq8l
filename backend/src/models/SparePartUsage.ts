export interface SparePartUsage {
  id: number;
  ticket_id: number;
  part_code: string;
  part_name: string;
  quantity: number;
  warehouse_name: string;
  approved_by: string | null;
  usage_status: string;
  applied_at: string;
  approved_at: string | null;
  settled_at: string | null;
}
