import { defineStore } from "pinia";
import { listAuditLog } from "../api/AuditLog";
import type { AuditLog } from "../types/AuditLog";

export const useAuditLogStore = defineStore("auditLog", {
  state: () => ({ rows: [] as AuditLog[], loading: false }),
  actions: {
    async load(targetType?: string, targetId?: string) {
      this.loading = true;
      try {
        this.rows = await listAuditLog(targetType, targetId);
      } finally {
        this.loading = false;
      }
    }
  }
});
