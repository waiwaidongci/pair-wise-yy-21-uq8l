import { defineStore } from "pinia";
import { listSparePartUsage, reconcileSpareParts } from "../api/SparePartUsage";
import type { ReconcileReport, SparePartUsage } from "../types/SparePartUsage";

export const useSparePartUsageStore = defineStore("sparePartUsage", {
  state: () => ({
    rows: [] as SparePartUsage[],
    reconcile: {} as Record<number, ReconcileReport>,
    loading: false
  }),
  actions: {
    async load(ticketId?: number) {
      this.loading = true;
      try {
        this.rows = await listSparePartUsage(ticketId);
      } finally {
        this.loading = false;
      }
    },
    async loadReconcile(ticketId: number) {
      this.reconcile[ticketId] = await reconcileSpareParts(ticketId);
    }
  }
});
