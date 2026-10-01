// 备件操作载荷：request_id 为幂等键，重复重试沿用第一次结果，避免同一工单重复消耗备件。
export interface SparePartUsageCreatePayload {
  ticket_id: number;
  part_code: string;
  part_name: string;
  quantity: number;
  warehouse_name: string;
  request_id: string;
}

export interface SparePartUsageActionPayload {
  request_id: string;
}

export type SparePartUsagePayload = Record<string, unknown>;
