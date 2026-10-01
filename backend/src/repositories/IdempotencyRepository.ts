import { db } from "../database/store";
import type { IdempotencyRecord } from "../models/IdempotencyRecord";

export const idempotencyRepository = {
  findByRequestId: (requestId: string): IdempotencyRecord | undefined => db.findIdempotent(requestId),
  save: (row: Omit<IdempotencyRecord, "id">): IdempotencyRecord => db.storeIdempotent(row),
  findAll: (): IdempotencyRecord[] => db.idempotencyRecord.all()
};
