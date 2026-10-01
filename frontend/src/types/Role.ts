// RBAC 角色
export type Role = "DISPATCHER" | "CREW_LEADER" | "STOREKEEPER" | "AUDITOR" | "CREW_MEMBER";

export const RoleText: Record<Role, string> = {
  DISPATCHER: "调度员",
  CREW_LEADER: "班组长",
  STOREKEEPER: "仓管",
  AUDITOR: "审计员",
  CREW_MEMBER: "班组成员"
};

// 各角色可执行的工单动作（与后端 Role 常量对齐）
export const RolePermissions: Record<Role, string[]> = {
  DISPATCHER: ["dispatch", "arrive", "start_repair", "restore", "close", "part.approve", "part.take", "part.return", "part.consume"],
  CREW_LEADER: ["arrive", "start_repair", "part.apply", "part.take", "part.return", "part.consume"],
  STOREKEEPER: ["part.approve", "part.take", "part.return", "part.consume"],
  AUDITOR: [],
  CREW_MEMBER: ["part.apply"]
};

// 复电确认仅调度员
export const RESTORE_ALLOWED_ROLES: Role[] = ["DISPATCHER"];

export function roleCan(role: Role, action: string): boolean {
  return RolePermissions[role]?.includes(action) ?? false;
}
