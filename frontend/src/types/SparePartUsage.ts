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

export type PartAction = "apply" | "approve" | "take" | "return" | "consume";

export interface PartApplyRequest {
  requestId: string;
  ticketId: number;
  partCode: string;
  partName: string;
  quantity: number;
  warehouseName: string;
  operatorId: number;
}

export interface PartSettleRequest {
  requestId: string;
  operatorId: number;
  note?: string;
}

export interface ReconcileResult {
  settled: boolean;
  ticketId: number;
  unsettled: SparePartUsage[];
}
