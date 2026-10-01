import type { FlowAction } from "../constants/FlowAction";
import type { FlowEventResult } from "../constants/FlowEventResult";
import type { TicketStatus } from "../constants/TicketStatus";
import type { Role } from "../constants/Role";

// 处置链事件：每一次到场/处理/复电/关闭上报（含离线补报）都落一条记录。
// request_id 是客户端生成的原请求号（幂等键），scene_seq 是现场序号。
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
