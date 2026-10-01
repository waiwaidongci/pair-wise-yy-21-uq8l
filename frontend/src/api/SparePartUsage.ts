import { request, genRequestId } from "./request";
import type { SparePartUsage, PartApplyRequest, PartSettleRequest, ReconcileResult } from "../types/SparePartUsage";

const endpoint = "/api/spare-part-usage";

export async function listSparePartUsage(): Promise<SparePartUsage[]> {
  return request<SparePartUsage[]>(endpoint);
}

export async function applyPart(payload: Omit<PartApplyRequest, "requestId"> & { requestId?: string }, role: string): Promise<SparePartUsage> {
  const body: PartApplyRequest = { ...payload, requestId: payload.requestId ?? genRequestId() };
  return request<SparePartUsage>(endpoint, {
    method: "POST",
    headers: { "x-role": role },
    body: JSON.stringify(body)
  });
}

export async function settlePart(
  partId: number,
  action: "approve" | "take" | "return" | "consume",
  payload: Omit<PartSettleRequest, "requestId"> & { requestId?: string },
  role: string
): Promise<SparePartUsage> {
  const body: PartSettleRequest = { ...payload, requestId: payload.requestId ?? genRequestId() };
  return request<SparePartUsage>(`${endpoint}/${partId}/${action}`, {
    method: "POST",
    headers: { "x-role": role },
    body: JSON.stringify(body)
  });
}

export async function reconcileTicket(ticketId: number): Promise<ReconcileResult> {
  return request<ReconcileResult>(`/api/repair-ticket/${ticketId}/reconcile`);
}

export async function listUnsettled(): Promise<SparePartUsage[]> {
  return request<SparePartUsage[]>(`${endpoint}/unsettled`);
}
