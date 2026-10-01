import { request, genRequestId } from "./request";
import type { RepairTicket, TicketDetail, TransitionResult, TransitionRequest, TicketAction } from "../types/RepairTicket";

const endpoint = "/api/repair-ticket";

export async function listRepairTicket(): Promise<RepairTicket[]> {
  return request<RepairTicket[]>(endpoint);
}

export async function getTicketDetail(id: number): Promise<TicketDetail> {
  return request<TicketDetail>(`${endpoint}/${id}`);
}

// 处置链推进：到场/处理/复电/关闭（离线上报带回原请求号和现场序号）
export async function transitionTicket(
  ticketId: number,
  action: TicketAction,
  payload: Partial<TransitionRequest> & { operatorId: number },
  role: string
): Promise<TransitionResult> {
  const body: TransitionRequest = {
    requestId: payload.requestId ?? genRequestId(),
    siteSeq: payload.siteSeq ?? 0,
    operatorId: payload.operatorId,
    note: payload.note
  };
  return request<TransitionResult>(`${endpoint}/${ticketId}/${action}`, {
    method: "POST",
    headers: { "x-role": role },
    body: JSON.stringify(body)
  });
}

// 对账
export async function reconcileTicket(ticketId: number): Promise<{ settled: boolean; unsettled: unknown[] }> {
  return request(`${endpoint}/${ticketId}/reconcile`);
}
