import { defineStore } from "pinia";
import { listRepairTicket, listFlowEvents } from "../api/RepairTicket";
import type { RepairTicket } from "../types/RepairTicket";
import type { FlowResult, TicketFlowEvent } from "../types/TicketFlowEvent";

export const useRepairTicketStore = defineStore("repairTicket", {
  state: () => ({
    rows: [] as RepairTicket[],
    events: {} as Record<number, TicketFlowEvent[]>,
    loading: false
  }),
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listRepairTicket();
      } finally {
        this.loading = false;
      }
    },
    async loadEvents(ticketId: number) {
      this.events[ticketId] = await listFlowEvents(ticketId);
    },
    // 处置链提交成功后：工单快照直接替换，事件与审计重新拉取，保证页面与审计同源。
    async applyFlowResult(result: FlowResult) {
      const index = this.rows.findIndex((row) => row.id === result.ticket.id);
      if (index >= 0) this.rows[index] = result.ticket;
      else this.rows.push(result.ticket);
      await this.loadEvents(result.ticket.id);
    },
    async refresh(ticketId?: number) {
      await this.load();
      if (ticketId) await this.loadEvents(ticketId);
    }
  }
});
