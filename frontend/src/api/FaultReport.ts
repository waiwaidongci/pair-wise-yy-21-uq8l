import { request } from "./request";
import type { FaultReport } from "../types/FaultReport";

const endpoint = "/api/fault-report";

export async function listFaultReport(): Promise<FaultReport[]> {
  return request<FaultReport[]>(endpoint);
}

export async function saveFaultReport(payload: FaultReport): Promise<FaultReport> {
  return request<FaultReport>(endpoint, { method: "POST", body: JSON.stringify(payload) });
}
