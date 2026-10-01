export const TicketStatus = ["WAIT_DISPATCH","ASSIGNED","ARRIVED","REPAIRING","RESTORED","CLOSED"] as const;
export type TicketStatus = (typeof TicketStatus)[number];

// 状态秩：处置链只允许单调推进，迟到上报不得把工单拉回低秩状态。
export const TICKET_STATUS_RANK: Record<TicketStatus, number> = {
  WAIT_DISPATCH: 0,
  ASSIGNED: 1,
  ARRIVED: 2,
  REPAIRING: 3,
  RESTORED: 4,
  CLOSED: 5
};

export const isTicketStatus = (value: unknown): value is TicketStatus =>
  typeof value === "string" && (TicketStatus as readonly string[]).includes(value);
