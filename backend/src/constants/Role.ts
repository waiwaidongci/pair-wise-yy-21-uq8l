// RBAC 角色：调度员 / 班组长 / 仓管 / 审计员 / 班组成员
export const Role = ["DISPATCHER", "CREW_LEADER", "STOREKEEPER", "AUDITOR", "CREW_MEMBER"] as const;
export type Role = (typeof Role)[number];

// 各角色可执行的现场动作
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  DISPATCHER: ["dispatch", "arrive", "start_repair", "restore", "close", "part.approve", "part.take", "part.return", "part.consume"],
  CREW_LEADER: ["arrive", "start_repair", "part.apply", "part.take", "part.return", "part.consume"],
  STOREKEEPER: ["part.approve", "part.take", "part.return", "part.consume"],
  AUDITOR: [],
  CREW_MEMBER: ["part.apply"]
};

// 复电确认仅调度员可做（班组成员越权直接拒绝）
export const RESTORE_ALLOWED_ROLES: Role[] = ["DISPATCHER"];

export function roleCan(role: string, action: string): boolean {
  return (ROLE_PERMISSIONS as Record<string, string[]>)[role]?.includes(action) ?? false;
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (Role as readonly string[]).includes(value);
}
