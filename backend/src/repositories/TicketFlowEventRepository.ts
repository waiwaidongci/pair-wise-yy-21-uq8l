import { seed } from "../seed";
import type { TicketFlowEvent } from "../models/TicketFlowEvent";

// 处置链事件表：request_id 唯一，是幂等恢复与复核记录的存储基础。
const rows: TicketFlowEvent[] = seed.ticketFlowEvent.map((row) => ({ ...row })) as TicketFlowEvent[];

const clone = (row: TicketFlowEvent): TicketFlowEvent => ({ ...row });

export const ticketFlowEventRepository = {
  findAll: (): TicketFlowEvent[] => rows.map(clone),
  findByTicket: (ticketId: number): TicketFlowEvent[] =>
    rows.filter((row) => row.ticket_id === ticketId).map(clone),
  findByRequestId: (requestId: string): TicketFlowEvent | undefined => {
    const found = rows.find((row) => row.request_id === requestId);
    return found ? clone(found) : undefined;
  },
  save: (row: Omit<TicketFlowEvent, "id" | "created_at"> & { created_at?: string }): TicketFlowEvent => {
    const record: TicketFlowEvent = {
      ...row,
      id: Math.max(0, ...rows.map((r) => r.id)) + 1,
      created_at: row.created_at ?? new Date().toISOString()
    };
    rows.push(record);
    return clone(record);
  }
};
