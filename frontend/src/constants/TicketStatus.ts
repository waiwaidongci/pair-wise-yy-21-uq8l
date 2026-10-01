export const TicketStatus = ["WAIT_DISPATCH","ASSIGNED","ARRIVED","REPAIRING","RESTORED","CLOSED"] as const;
export type TicketStatus = (typeof TicketStatus)[number];

export const TicketStatusText: Record<TicketStatus, string> = {
  WAIT_DISPATCH: "待派工",
  ASSIGNED: "已派工",
  ARRIVED: "已到场",
  REPAIRING: "处理中",
  RESTORED: "已复电",
  CLOSED: "已关闭"
};

// 状态秩：处置链只允许单调推进，迟到上报不得把工单拉回低秩状态。
export const TICKET_STATUS_RANK: Record<TicketStatus, number> = {
  WAIT_DISPATCH: 0,
  ASSIGNED: 1,
  ARRIVED: 2,
  REPAIRING: 3,
  RESTORED: 4,
  CLOSED: 5
};
