import { request } from "./client";
import { mockData } from "../mocks/seedData";
import type { AuditLog } from "../types/AuditLog";

const endpoint = "/api/audit-log";

// 审计与页面同源：调度员确认复电后，这里读到的就是页面展示的那次结果。
export async function listAuditLog(targetType?: string, targetId?: string): Promise<AuditLog[]> {
  try {
    const query = targetType && targetId ? `?target_type=${targetType}&target_id=${targetId}` : "";
    return await request<AuditLog[]>(`${endpoint}${query}`);
  } catch {
    return [...(mockData.auditLog as unknown as AuditLog[])];
  }
}
