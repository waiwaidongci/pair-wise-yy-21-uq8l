import type { AuditLog } from "../models/AuditLog";

export const createAuditLogDto = (overrides: Partial<AuditLog> = {}): AuditLog => ({
  id: 0,
  actor: "",
  action: "",
  target_type: "",
  target_id: "",
  detail: "",
  result: "",
  created_at: new Date().toISOString(),
  ...overrides
});
