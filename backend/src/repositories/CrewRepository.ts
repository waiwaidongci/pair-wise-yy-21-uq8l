import { seed } from "../seed";
import type { Crew } from "../models/Crew";

const rows: Crew[] = seed.crew.map((row) => ({ ...row })) as Crew[];

export const crewRepository = {
  findAll: (): Crew[] => rows.map((row) => ({ ...row })),
  findById: (id: number): Crew | undefined => {
    const found = rows.find((row) => row.id === id);
    return found ? { ...found } : undefined;
  },
  save: (row: Omit<Crew, "id"> & { id?: number }): Crew => {
    const id = row.id ?? Math.max(0, ...rows.map((r) => r.id)) + 1;
    const record = { ...row, id } as Crew;
    rows.push(record);
    return { ...record };
  },
  // 派工后班组进入在岗并挂接当前工单。
  assignTicket: (crewId: number, ticketId: number): Crew | undefined => {
    const found = rows.find((row) => row.id === crewId);
    if (!found) return undefined;
    found.duty_status = "ON_DUTY";
    found.current_ticket_id = ticketId;
    return { ...found };
  },
  // 工单关闭后释放班组。
  releaseTicket: (crewId: number, ticketId: number): Crew | undefined => {
    const found = rows.find((row) => row.id === crewId);
    if (!found || found.current_ticket_id !== ticketId) return found ? { ...found } : undefined;
    found.duty_status = "STANDBY";
    found.current_ticket_id = 0;
    return { ...found };
  }
};
