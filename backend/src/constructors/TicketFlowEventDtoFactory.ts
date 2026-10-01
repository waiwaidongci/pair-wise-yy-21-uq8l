import type { TicketFlowEvent } from "../models/TicketFlowEvent";
import type { FlowAction } from "../constants/FlowAction";
import type { FlowEventResult } from "../constants/FlowEventResult";
import type { TicketStatus } from "../constants/TicketStatus";
import type { Role } from "../constants/Role";

export const createTicketFlowEventDto = (overrides: Partial<TicketFlowEvent> = {}): TicketFlowEvent => ({
  id: 0,
  ticket_id: 0,
  request_id: "",
  scene_seq: 0,
  action: "ARRIVE" as FlowAction,
  actor_id: 0,
  actor_role: "crew_member" as Role,
  note: "",
  result: "APPLIED" as FlowEventResult,
  from_status: "WAIT_DISPATCH" as TicketStatus,
  to_status: "WAIT_DISPATCH" as TicketStatus,
  created_at: new Date().toISOString(),
  ...overrides
});

// 处置链接口统一响应：工单快照 + 本次事件 + 是否命中幂等去重。
export const createFlowResponse = (ticket: unknown, event: TicketFlowEvent, deduplicated: boolean) => ({
  ticket,
  event: createTicketFlowEventDto(event),
  deduplicated
});
