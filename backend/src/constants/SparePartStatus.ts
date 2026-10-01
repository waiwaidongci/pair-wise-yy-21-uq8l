// 备件领用状态：申请 → 审批 → 领用 → 归还/消耗（终态）
export const SparePartStatus = ["PENDING", "APPROVED", "TAKEN", "RETURNED", "CONSUMED"] as const;
export type SparePartStatus = (typeof SparePartStatus)[number];

// 未结算状态：工单关闭前必须全部结算（归还或消耗）
export const UNSETTLED_SPARE_PART_STATUSES: SparePartStatus[] = ["PENDING", "APPROVED", "TAKEN"];

// 终态：归还入库 / 实际消耗
export const SETTLED_SPARE_PART_STATUSES: SparePartStatus[] = ["RETURNED", "CONSUMED"];

export function isSparePartSettled(status: string): boolean {
  return (SETTLED_SPARE_PART_STATUSES as readonly string[]).includes(status);
}

export function isSparePartStatus(value: unknown): value is SparePartStatus {
  return typeof value === "string" && (SparePartStatus as readonly string[]).includes(value);
}
