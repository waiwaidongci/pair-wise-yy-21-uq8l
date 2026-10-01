import { faultReportRepository } from "../repositories/FaultReportRepository";
import type { FaultReport } from "../models/FaultReport";

export const faultReportService = {
  list: (): FaultReport[] => faultReportRepository.findAll(),
  create: (row: FaultReport): FaultReport => faultReportRepository.save(row)
};
