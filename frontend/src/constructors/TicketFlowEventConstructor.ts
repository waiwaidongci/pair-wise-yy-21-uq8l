import type { TicketFlowEvent } from "../types/TicketFlowEvent";

export const createDefaultTicketFlowEvent = (overrides: Partial<TicketFlowEvent> = {}): TicketFlowEvent => ({
  id: 0,
  ticket_id: 0,
  request_id: "",
  scene_seq: 0,
  action: "ARRIVE",
  actor_id: 0,
  actor_role: "crew_member",
  note: "",
  result: "APPLIED",
  from_status: "WAIT_DISPATCH",
  to_status: "WAIT_DISPATCH",
  created_at: new Date().toISOString(),
  ...overrides
});

export const createTicketFlowEventForm = createDefaultTicketFlowEvent;
export const createTicketFlowEventResponse = createDefaultTicketFlowEvent;
