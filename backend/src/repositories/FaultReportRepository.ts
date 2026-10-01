import { seed } from "../seed";
import type { FaultReport } from "../models/FaultReport";

const rows: FaultReport[] = seed.faultReport.map((row) => ({ ...row })) as FaultReport[];

export const faultReportRepository = {
  findAll: (): FaultReport[] => rows.map((row) => ({ ...row })),
  findById: (id: number): FaultReport | undefined => {
    const found = rows.find((row) => row.id === id);
    return found ? { ...found } : undefined;
  },
  save: (row: Omit<FaultReport, "id"> & { id?: number }): FaultReport => {
    const id = row.id ?? Math.max(0, ...rows.map((r) => r.id)) + 1;
    const record = { ...row, id } as FaultReport;
    rows.push(record);
    return { ...record };
  },
  // 工单推进后联动报修状态，保持报修-工单同一处置链。
  updateStatus: (id: number, status: string): FaultReport | undefined => {
    const found = rows.find((row) => row.id === id);
    if (!found) return undefined;
    found.status = status;
    return { ...found };
  }
};
