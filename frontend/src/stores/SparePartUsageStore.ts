import { defineStore } from "pinia";
import { listSparePartUsage, applyPart, settlePart, listUnsettled } from "../api/SparePartUsage";
import type { SparePartUsage, PartApplyRequest } from "../types/SparePartUsage";
import { useAuthStore } from "./AuthStore";

interface PartState {
  rows: SparePartUsage[];
  unsettled: SparePartUsage[];
  loading: boolean;
}

export const useSparePartUsageStore = defineStore("sparePartUsage", {
  state: (): PartState => ({ rows: [], unsettled: [], loading: false }),
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listSparePartUsage();
        this.unsettled = await listUnsettled();
      } finally {
        this.loading = false;
      }
    },
    async apply(payload: Omit<PartApplyRequest, "requestId">) {
      const auth = useAuthStore();
      const created = await applyPart(payload, auth.role);
      this.rows.push(created);
      return created;
    },
    async settle(partId: number, action: "approve" | "take" | "return" | "consume", note = "") {
      const auth = useAuthStore();
      const updated = await settlePart(partId, action, { operatorId: auth.operatorId, note }, auth.role);
      const idx = this.rows.findIndex((p) => p.id === partId);
      if (idx >= 0) this.rows[idx] = updated;
      return updated;
    }
  }
});
