import { seed } from "../seed";
import type { AuditLog } from "../models/AuditLog";

const rows: AuditLog[] = seed.auditLog.map((row) => ({ ...row })) as AuditLog[];

const clone = (row: AuditLog): AuditLog => ({ ...row });

export const auditLogRepository = {
  findAll: (): AuditLog[] => rows.map(clone),
  findByTarget: (targetType: string, targetId: string): AuditLog[] =>
    rows.filter((row) => row.target_type === targetType && row.target_id === targetId).map(clone),
  save: (row: Omit<AuditLog, "id" | "created_at"> & { created_at?: string }): AuditLog => {
    const record: AuditLog = {
      ...row,
      id: Math.max(0, ...rows.map((r) => r.id)) + 1,
      created_at: row.created_at ?? new Date().toISOString()
    };
    rows.push(record);
    return clone(record);
  }
};
