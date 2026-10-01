export interface RepairTicket {
  id: number;
  fault_report_id: number;
  team_id: number;
  dispatcher_id: number;
  priority: string;
  status: string;
  assigned_at: string;
  restored_at: string | null;
  site_seq: number;
  version: number;
}

// 处置链动作
export type TicketAction = "dispatch" | "arrive" | "start_repair" | "restore" | "close";

// 现场上报请求（离线上报带回原请求号和现场序号）
export interface TransitionRequest {
  requestId: string;
  siteSeq: number;
  operatorId: number;
  note?: string;
}

// 处置链响应
export interface TransitionResult {
  applied: boolean;
  replay?: boolean;
  reason?: "STALE_SEQ" | "STATE_REGRESSION" | string;
  ticket: RepairTicket;
  event?: TicketEvent;
  review?: ReviewRecord;
  blockedParts?: BlockedPart[];
}

export interface BlockedPart {
  partCode: string;
  partName: string;
  quantity: number;
  status: string;
  settleAction: string;
}

// 处置事件（审计轨迹）
export interface TicketEvent {
  id: number;
  ticket_id: number;
  event_type: string;
  from_status: string | null;
  to_status: string;
  site_seq: number;
  request_id: string;
  operator_id: number;
  operator_role: string;
  note: string;
  created_at: string;
}

// 复核记录（迟到/越序上报）
export interface ReviewRecord {
  id: number;
  ticket_id: number;
  request_id: string;
  site_seq: number;
  event_type: string;
  payload: string;
  reason: string;
  created_at: string;
}

// 工单详情（含事件、备件、复核）
export interface TicketDetail {
  ticket: RepairTicket;
  events: TicketEvent[];
  parts: import("./SparePartUsage").SparePartUsage[];
  reviews: ReviewRecord[];
}
