import type { RepairTicket } from "../types/RepairTicket";

export const createDefaultRepairTicket = (overrides: Partial<RepairTicket> = {}): RepairTicket => ({
  id: 0,
  fault_report_id: 0,
  team_id: 0,
  dispatcher_id: 0,
  priority: "MEDIUM",
  status: "WAIT_DISPATCH",
  assigned_at: null,
  restored_at: null,
  closed_at: null,
  updated_at: new Date().toISOString(),
  ...overrides
});

export const createRepairTicketForm = createDefaultRepairTicket;
export const createRepairTicketResponse = createDefaultRepairTicket;
