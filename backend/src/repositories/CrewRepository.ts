import { seed } from "../seed";
import type { Crew } from "../models/Crew";

// 抢修班组：参考数据，内存维护
let rows: Crew[] = [...(seed.crew as unknown as Crew[])];

export const crewRepository = {
  findAll: (): Crew[] => rows,
  findById: (id: number): Crew | undefined => rows.find((r) => r.id === id),
  save: (row: Crew): Crew => {
    rows = [...rows, row];
    return row;
  }
};
