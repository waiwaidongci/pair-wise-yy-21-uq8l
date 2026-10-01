// 处置链事件落库结果：
// APPLIED      首次有效请求，已改变工单状态
// DUPLICATE    同一请求号重复重试，沿用第一次结果
// REVIEW_ONLY  晚到/并发上报，内容保留为复核记录，工单状态不倒退
// REJECTED     越权或非法流转，直接拒绝
export const FlowEventResult = ["APPLIED","DUPLICATE","REVIEW_ONLY","REJECTED"] as const;
export type FlowEventResult = (typeof FlowEventResult)[number];
