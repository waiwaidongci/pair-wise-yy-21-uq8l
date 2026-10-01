import type { TicketStatus } from "../constants/TicketStatus";

export interface RepairTicket {
  id: number;
  fault_report_id: number;
  team_id: number;
  dispatcher_id: number;
  priority: string;
  status: TicketStatus;
  assigned_at: string | null;
  restored_at: string | null;
  closed_at: string | null;
  updated_at: string;
}
