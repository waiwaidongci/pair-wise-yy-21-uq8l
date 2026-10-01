import type { RepairTicket } from "../models/RepairTicket";
import type { RepairTicketCreatePayload } from "../types/RepairTicketPayload";

export const createRepairTicketDto = (overrides: Partial<RepairTicket> = {}): RepairTicket => ({
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

// 由创建载荷构造新工单：派工即进入 ASSIGNED。
export const createRepairTicketFromPayload = (payload: RepairTicketCreatePayload, dispatcherId: number): RepairTicket =>
  createRepairTicketDto({
    fault_report_id: payload.fault_report_id,
    team_id: payload.team_id,
    dispatcher_id: dispatcherId,
    priority: payload.priority,
    status: "ASSIGNED",
    assigned_at: new Date().toISOString()
  });

// 列表/详情响应对象。
export const createRepairTicketResponse = (row: RepairTicket): RepairTicket => createRepairTicketDto(row);
