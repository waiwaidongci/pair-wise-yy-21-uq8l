import type { FlowAction } from "../constants/FlowAction";
import type { FlowEventResult } from "../constants/FlowEventResult";
import type { TicketStatus } from "../constants/TicketStatus";
import type { Role } from "../constants/Role";
import type { RepairTicket } from "./RepairTicket";

// 处置链事件：每次上报（含离线补报、复核保留、拒绝留痕）都是一条记录。
export interface TicketFlowEvent {
  id: number;
  ticket_id: number;
  request_id: string;
  scene_seq: number;
  action: FlowAction;
  actor_id: number;
  actor_role: Role;
  note: string;
  result: FlowEventResult;
  from_status: TicketStatus;
  to_status: TicketStatus;
  created_at: string;
}

// 处置链接口统一响应：工单快照 + 本次事件 + 是否命中幂等去重。
export interface FlowResult {
  ticket: RepairTicket;
  event: TicketFlowEvent;
  deduplicated: boolean;
}
