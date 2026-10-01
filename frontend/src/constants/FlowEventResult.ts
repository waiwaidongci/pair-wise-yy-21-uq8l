// 处置链事件落库结果。
export const FlowEventResult = ["APPLIED","DUPLICATE","REVIEW_ONLY","REJECTED"] as const;
export type FlowEventResult = (typeof FlowEventResult)[number];

export const FlowEventResultText: Record<FlowEventResult, string> = {
  APPLIED: "已生效",
  DUPLICATE: "重复请求",
  REVIEW_ONLY: "复核记录",
  REJECTED: "已拒绝"
};
