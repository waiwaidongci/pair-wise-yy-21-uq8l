import { TicketStatus } from "./TicketStatus";
import type { Role } from "./Role";

// 处置链推进动作：派工、到场、处理、复电、关闭。
export const FlowAction = ["DISPATCH","ARRIVE","START_REPAIR","RESTORE","CLOSE"] as const;
export type FlowAction = (typeof FlowAction)[number];

export const isFlowAction = (value: unknown): value is FlowAction =>
  typeof value === "string" && (FlowAction as readonly string[]).includes(value);

interface FlowRule {
  from: TicketStatus;
  to: TicketStatus;
  roles: readonly Role[];
}

// 每个动作的前置状态、目标状态和允许角色。
// 复电确认(RESTORE)与关闭(CLOSE)只能由调度员执行，班组成员越权直接拒绝。
export const FLOW_RULES: Record<FlowAction, FlowRule> = {
  DISPATCH: { from: "WAIT_DISPATCH", to: "ASSIGNED", roles: ["dispatcher"] },
  ARRIVE: { from: "ASSIGNED", to: "ARRIVED", roles: ["crew_leader", "dispatcher"] },
  START_REPAIR: { from: "ARRIVED", to: "REPAIRING", roles: ["crew_leader", "dispatcher"] },
  RESTORE: { from: "REPAIRING", to: "RESTORED", roles: ["dispatcher"] },
  CLOSE: { from: "RESTORED", to: "CLOSED", roles: ["dispatcher"] }
};
