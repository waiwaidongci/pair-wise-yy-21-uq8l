// RBAC 角色：调度员 / 班组长 / 班组成员 / 仓管 / 审计员。
export const Role = ["dispatcher","crew_leader","crew_member","warehouse","auditor"] as const;
export type Role = (typeof Role)[number];

export const RoleText: Record<Role, string> = {
  dispatcher: "调度员",
  crew_leader: "班组长",
  crew_member: "班组成员",
  warehouse: "仓管",
  auditor: "审计员"
};
