export const TicketStatus = ["WAIT_DISPATCH", "ASSIGNED", "ARRIVED", "REPAIRING", "RESTORED", "CLOSED"] as const;
export type TicketStatus = (typeof TicketStatus)[number];

export const TicketStatusText: Record<TicketStatus, string> = {
  WAIT_DISPATCH: "待派工",
  ASSIGNED: "已派工",
  ARRIVED: "已到场",
  REPAIRING: "抢修中",
  RESTORED: "已复电",
  CLOSED: "已关闭"
};

// 正向流转图
export const TICKET_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  WAIT_DISPATCH: ["ASSIGNED"],
  ASSIGNED: ["ARRIVED"],
  ARRIVED: ["REPAIRING"],
  REPAIRING: ["RESTORED"],
  RESTORED: ["CLOSED"],
  CLOSED: []
};

// 每个状态允许的动作
export const TICKET_ACTIONS: Record<TicketStatus, string[]> = {
  WAIT_DISPATCH: ["dispatch"],
  ASSIGNED: ["arrive"],
  ARRIVED: ["start_repair"],
  REPAIRING: ["restore"],
  RESTORED: ["close"],
  CLOSED: []
};

// 动作中文名
export const TicketActionText: Record<string, string> = {
  dispatch: "派工",
  arrive: "到场",
  start_repair: "开始抢修",
  restore: "复电确认",
  close: "关闭工单"
};

export function canTransition(from: string, to: string): boolean {
  return (TICKET_TRANSITIONS as Record<string, string[]>)[from]?.includes(to) ?? false;
}

export function nextAction(status: string): string | undefined {
  return TICKET_ACTIONS[status as TicketStatus]?.[0];
}
