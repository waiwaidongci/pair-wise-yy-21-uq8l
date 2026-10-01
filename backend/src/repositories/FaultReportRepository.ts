import { seed } from "../seed";
import type { FaultReport } from "../models/FaultReport";

// 故障报修：参考数据，内存维护
let rows: FaultReport[] = [...(seed.faultReport as unknown as FaultReport[])];

export const faultReportRepository = {
  findAll: (): FaultReport[] => rows,
  findById: (id: number): FaultReport | undefined => rows.find((r) => r.id === id),
  save: (row: FaultReport): FaultReport => {
    rows = [...rows, row];
    return row;
  }
};
