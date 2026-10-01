import { db } from "../database/store";
import type { TicketEvent } from "../models/TicketEvent";

export const ticketEventRepository = {
  findAll: (): TicketEvent[] => db.ticketEvent.all(),
  findByTicket: (ticketId: number): TicketEvent[] =>
    db.ticketEvent.filter((e) => e.ticket_id === ticketId),
  save: (row: Omit<TicketEvent, "id">): TicketEvent => db.appendEvent(row)
};
