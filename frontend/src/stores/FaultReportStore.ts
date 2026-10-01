import { defineStore } from "pinia";
import { listFaultReport, saveFaultReport } from "../api/FaultReport";
import type { FaultReport } from "../types/FaultReport";

export const useFaultReportStore = defineStore("faultReport", {
  state: () => ({ rows: [] as FaultReport[], loading: false }),
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listFaultReport();
      } finally {
        this.loading = false;
      }
    },
    async create(payload: FaultReport) {
      const created = await saveFaultReport(payload);
      this.rows.push(created);
      return created;
    }
  }
});
