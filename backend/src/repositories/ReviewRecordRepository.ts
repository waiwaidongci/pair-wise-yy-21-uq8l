import { db } from "../database/store";
import type { ReviewRecord } from "../models/ReviewRecord";

export const reviewRecordRepository = {
  findAll: (): ReviewRecord[] => db.reviewRecord.all(),
  findByTicket: (ticketId: number): ReviewRecord[] =>
    db.reviewRecord.filter((r) => r.ticket_id === ticketId),
  save: (row: Omit<ReviewRecord, "id">): ReviewRecord => db.storeReview(row)
};
