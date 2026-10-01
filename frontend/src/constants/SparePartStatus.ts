export const SparePartStatus = ["PENDING", "APPROVED", "TAKEN", "RETURNED", "CONSUMED"] as const;
export type SparePartStatus = (typeof SparePartStatus)[number];

export const SparePartStatusText: Record<SparePartStatus, string> = {
  PENDING: "待审批",
  APPROVED: "已审批待领用",
  TAKEN: "已领用未归还",
  RETURNED: "已归还",
  CONSUMED: "已消耗"
};

// 未结算状态
export const UNSETTLED_STATUSES: SparePartStatus[] = ["PENDING", "APPROVED", "TAKEN"];
export const SETTLED_STATUSES: SparePartStatus[] = ["RETURNED", "CONSUMED"];

export const PartActionText: Record<string, string> = {
  apply: "申请备件",
  approve: "审批",
  take: "领用",
  return: "归还",
  consume: "消耗"
};

export function isSettled(status: string): boolean {
  return (SETTLED_STATUSES as readonly string[]).includes(status);
}
