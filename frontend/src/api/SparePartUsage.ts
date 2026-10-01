import { request } from "./client";
import { mockData } from "../mocks/seedData";
import type { ReconcileReport, SparePartUsage } from "../types/SparePartUsage";

const endpoint = "/api/spare-part-usage";

export async function listSparePartUsage(ticketId?: number): Promise<SparePartUsage[]> {
  try {
    const query = ticketId ? `?ticket_id=${ticketId}` : "";
    return await request<SparePartUsage[]>(`${endpoint}${query}`);
  } catch {
    const rows = mockData.sparePartUsage as unknown as SparePartUsage[];
    return ticketId ? rows.filter((row) => row.ticket_id === ticketId) : [...rows];
  }
}

export interface SparePartApplyPayload {
  ticket_id: number;
  part_code: string;
  part_name: string;
  quantity: number;
  warehouse_name: string;
  request_id: string;
}

export interface SparePartResult {
  usage: SparePartUsage;
  deduplicated: boolean;
}

// 申请备件：request_id 幂等，重复提交沿用第一次结果。
export async function applySparePart(payload: SparePartApplyPayload): Promise<SparePartResult> {
  return request<SparePartResult>(endpoint, { method: "POST", body: payload });
}

// 审批出库 / 登记消耗 / 归还入库：均按 request_id 幂等。
export async function transitSparePart(id: number, action: "approve" | "consume" | "return", requestId: string): Promise<SparePartResult> {
  return request<SparePartResult>(`${endpoint}/${id}/${action}`, { method: "POST", body: { request_id: requestId } });
}

// 工单关闭前的备件对账。
export async function reconcileSpareParts(ticketId: number): Promise<ReconcileReport> {
  return request<ReconcileReport>(`${endpoint}/reconcile/${ticketId}`);
}

export async function saveSparePartUsage(payload: SparePartUsage) {
  console.info("save SparePartUsage", payload);
  return payload;
}
