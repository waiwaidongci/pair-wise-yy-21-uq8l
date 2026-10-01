import { defineStore } from "pinia";
import { listRepairTicket, getTicketDetail, transitionTicket } from "../api/RepairTicket";
import type { RepairTicket, TicketDetail, TransitionResult, TicketAction } from "../types/RepairTicket";
import { useAuthStore } from "./AuthStore";

interface TicketState {
  rows: RepairTicket[];
  detail: TicketDetail | null;
  loading: boolean;
  lastResult: TransitionResult | null;
}

export const useRepairTicketStore = defineStore("repairTicket", {
  state: (): TicketState => ({ rows: [], detail: null, loading: false, lastResult: null }),
  getters: {
    byId: (s) => (id: number) => s.rows.find((t) => t.id === id)
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listRepairTicket();
      } finally {
        this.loading = false;
      }
    },
    async loadDetail(id: number) {
      this.detail = await getTicketDetail(id);
      return this.detail;
    },
    // 处置链推进
    async advance(ticketId: number, action: TicketAction, siteSeq: number, note = ""): Promise<TransitionResult> {
      const auth = useAuthStore();
      const result = await transitionTicket(
        ticketId,
        action,
        { operatorId: auth.operatorId, siteSeq, note },
        auth.role
      );
      this.lastResult = result;
      // 若应用成功，更新列表中的工单
      if (result.applied && result.ticket) {
        const idx = this.rows.findIndex((t) => t.id === ticketId);
        if (idx >= 0) this.rows[idx] = result.ticket;
        if (this.detail?.ticket.id === ticketId) {
          this.detail = await getTicketDetail(ticketId);
        }
      }
      return result;
    },
    clearLastResult() {
      this.lastResult = null;
    }
  }
});
