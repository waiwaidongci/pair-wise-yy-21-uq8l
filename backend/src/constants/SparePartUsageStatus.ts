// 备件领用状态机：申请 -> 出库 -> 消耗/归还。
// 工单关闭前必须全部对账为 CONSUMED 或 RETURNED。
export const SparePartUsageStatus = ["REQUESTED","ISSUED","CONSUMED","RETURNED"] as const;
export type SparePartUsageStatus = (typeof SparePartUsageStatus)[number];

export const isSparePartUsageStatus = (value: unknown): value is SparePartUsageStatus =>
  typeof value === "string" && (SparePartUsageStatus as readonly string[]).includes(value);

// 对账通过（已办结）的领用状态。
export const SETTLED_USAGE_STATUS: readonly SparePartUsageStatus[] = ["CONSUMED", "RETURNED"];
