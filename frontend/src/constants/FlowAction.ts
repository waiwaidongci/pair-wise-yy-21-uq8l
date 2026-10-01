import type { Role } from "./Role";
import type { TicketStatus } from "./TicketStatus";

// 处置链推进动作：派工、到场、处理、复电、关闭。
export const FlowAction = ["DISPATCH","ARRIVE","START_REPAIR","RESTORE","CLOSE"] as const;
export type FlowAction = (typeof FlowAction)[number];

export const FlowActionText: Record<FlowAction, string> = {
  DISPATCH: "派工",
  ARRIVE: "到场",
  START_REPAIR: "开始处理",
  RESTORE: "复电确认",
  CLOSE: "关闭工单"
};

// 与后端 FLOW_RULES 对齐的角色矩阵，用于按钮显隐；最终以后端裁决为准。
export const FLOW_ACTION_ROLES: Record<FlowAction, readonly Role[]> = {
  DISPATCH: ["dispatcher"],
  ARRIVE: ["crew_leader", "dispatcher"],
  START_REPAIR: ["crew_leader", "dispatcher"],
  RESTORE: ["dispatcher"],
  CLOSE: ["dispatcher"]
};

// 当前工单状态对应的下一个推进动作；CLOSED 后无动作。
export const NEXT_FLOW_ACTION: Record<TicketStatus, FlowAction | null> = {
  WAIT_DISPATCH: "DISPATCH",
  ASSIGNED: "ARRIVE",
  ARRIVED: "START_REPAIR",
  REPAIRING: "RESTORE",
  RESTORED: "CLOSE",
  CLOSED: null
};
