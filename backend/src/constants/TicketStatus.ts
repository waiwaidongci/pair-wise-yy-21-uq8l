// 工单状态机：到场 → 处理 → 复电 → 关闭，只能前进不能倒退
export const TicketStatus = ["WAIT_DISPATCH", "ASSIGNED", "ARRIVED", "REPAIRING", "RESTORED", "CLOSED"] as const;
export type TicketStatus = (typeof TicketStatus)[number];

// 允许的正向流转图：key 为当前状态，value 为可到达的下一状态
export const TICKET_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  WAIT_DISPATCH: ["ASSIGNED"],
  ASSIGNED: ["ARRIVED"],
  ARRIVED: ["REPAIRING"],
  REPAIRING: ["RESTORED"],
  RESTORED: ["CLOSED"],
  CLOSED: []
};

// 每个状态上允许执行的现场动作（event_type）
export const TICKET_ACTIONS: Record<TicketStatus, string[]> = {
  WAIT_DISPATCH: ["dispatch"],
  ASSIGNED: ["arrive"],
  ARRIVED: ["start_repair"],
  REPAIRING: ["restore"],
  RESTORED: ["close"],
  CLOSED: []
};

// 复电确认动作的别名（调度员确认复电）
export const RESTORE_ACTION = "restore";

export function canTransition(from: string, to: string): boolean {
  return (TICKET_TRANSITIONS as Record<string, string[]>)[from]?.includes(to) ?? false;
}

export function isTicketStatus(value: unknown): value is TicketStatus {
  return typeof value === "string" && (TicketStatus as readonly string[]).includes(value);
}
