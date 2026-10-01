import type { FlowAction } from "../constants/FlowAction";

// 处置链上报载荷：离线上报必须带回原请求号和现场序号。
export interface TicketFlowPayload {
  request_id: string;
  scene_seq: number;
  action: FlowAction;
  note?: string;
}

export interface RepairTicketCreatePayload {
  fault_report_id: number;
  team_id: number;
  priority: string;
}

export type RepairTicketPayload = Record<string, unknown>;
