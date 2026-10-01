import { request } from "./client";
import { mockData } from "../mocks/seedData";
import type { RepairTicket } from "../types/RepairTicket";
import type { TicketFlowEvent, FlowResult } from "../types/TicketFlowEvent";
import type { FlowAction } from "../constants/FlowAction";

const endpoint = "/api/repair-ticket";

export async function listRepairTicket(): Promise<RepairTicket[]> {
  try {
    return await request<RepairTicket[]>(endpoint);
  } catch {
    // 本地 mock 兜底，保证离线评审时界面可用。
    return [...(mockData.repairTicket as unknown as RepairTicket[])];
  }
}

export interface FlowSubmitPayload {
  request_id: string;
  scene_seq: number;
  action: FlowAction;
  note?: string;
}

// 处置链推进：携带原请求号与现场序号，网络失败时抛错由 useTicketFlow 进入离线队列。
export async function submitFlow(ticketId: number, payload: FlowSubmitPayload): Promise<FlowResult> {
  return request<FlowResult>(`${endpoint}/${ticketId}/flow`, { method: "POST", body: payload });
}

// 断网恢复：按原请求号取回第一次落库结果。
export async function recoverFlow(requestId: string): Promise<FlowResult> {
  return request<FlowResult>(`${endpoint}/flow/${encodeURIComponent(requestId)}`);
}

export async function listFlowEvents(ticketId: number): Promise<TicketFlowEvent[]> {
  try {
    return await request<TicketFlowEvent[]>(`${endpoint}/${ticketId}/events`);
  } catch {
    return (mockData.ticketFlowEvent as unknown as TicketFlowEvent[]).filter((event) => event.ticket_id === ticketId);
  }
}

export async function saveRepairTicket(payload: RepairTicket) {
  console.info("save RepairTicket", payload);
  return payload;
}
