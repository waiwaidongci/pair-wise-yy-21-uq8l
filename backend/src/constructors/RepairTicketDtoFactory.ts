import type { RepairTicket } from "../models/RepairTicket";

// 默认工单对象
export const createRepairTicketDto = (overrides: Partial<RepairTicket> = {}): RepairTicket => ({
  id: 0,
  fault_report_id: 0,
  team_id: 0,
  dispatcher_id: 0,
  priority: "normal",
  status: "WAIT_DISPATCH",
  assigned_at: "",
  restored_at: null,
  site_seq: 0,
  version: 1,
  ...overrides
});

// 派工请求
export interface DispatchRequest {
  requestId: string;
  siteSeq: number;
  teamId: number;
  dispatcherId: number;
  priority?: string;
}

// 现场流转请求（到场 / 处理 / 复电 / 关闭）
export interface TransitionRequest {
  requestId: string;
  siteSeq: number;
  operatorId: number;
  note?: string;
  // 备件对账快照：复电/关闭时携带，用于核对消耗与归还
  partSnapshot?: Array<{ partCode: string; quantity: number; settled: boolean }>;
}

// 构造派工请求默认值
export const createDispatchRequest = (overrides: Partial<DispatchRequest> = {}): DispatchRequest => ({
  requestId: "",
  siteSeq: 0,
  teamId: 0,
  dispatcherId: 0,
  priority: "normal",
  ...overrides
});

// 构造现场流转请求默认值
export const createTransitionRequest = (overrides: Partial<TransitionRequest> = {}): TransitionRequest => ({
  requestId: "",
  siteSeq: 0,
  operatorId: 0,
  note: "",
  ...overrides
});

// 构造工单响应（脱敏/补全展示字段）
export const createRepairTicketResponse = (ticket: RepairTicket) => ({
  ...ticket,
  siteSeq: ticket.site_seq,
  restoredAt: ticket.restored_at
});
