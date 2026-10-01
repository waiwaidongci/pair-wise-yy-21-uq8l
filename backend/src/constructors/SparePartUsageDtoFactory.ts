import type { SparePartUsage } from "../models/SparePartUsage";

// 默认备件领用对象
export const createSparePartUsageDto = (overrides: Partial<SparePartUsage> = {}): SparePartUsage => ({
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

// 备件申请请求
export interface PartApplyRequest {
  requestId: string;
  ticketId: number;
  partCode: string;
  partName: string;
  quantity: number;
  warehouseName: string;
  operatorId: number;
}

// 备件状态流转请求（审批 / 领用 / 归还 / 消耗）
export interface PartSettleRequest {
  requestId: string;
  operatorId: number;
  note?: string;
}

export const createPartApplyRequest = (overrides: Partial<PartApplyRequest> = {}): PartApplyRequest => ({
  requestId: "",
  ticketId: 0,
  partCode: "",
  partName: "",
  quantity: 0,
  warehouseName: "",
  operatorId: 0,
  ...overrides
});

export const createPartSettleRequest = (overrides: Partial<PartSettleRequest> = {}): PartSettleRequest => ({
  requestId: "",
  operatorId: 0,
  note: "",
  ...overrides
});
