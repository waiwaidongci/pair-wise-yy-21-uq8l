// 备件领用状态机：申请 -> 出库 -> 消耗/归还。
export const SparePartUsageStatus = ["REQUESTED","ISSUED","CONSUMED","RETURNED"] as const;
export type SparePartUsageStatus = (typeof SparePartUsageStatus)[number];

export const SparePartUsageStatusText: Record<SparePartUsageStatus, string> = {
  REQUESTED: "已申请",
  ISSUED: "已出库",
  CONSUMED: "已消耗",
  RETURNED: "已归还"
};

export const SETTLED_USAGE_STATUS: readonly SparePartUsageStatus[] = ["CONSUMED", "RETURNED"];
