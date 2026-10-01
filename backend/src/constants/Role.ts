// RBAC 角色：调度员 / 班组长 / 班组成员 / 仓管 / 审计员。
export const Role = ["dispatcher","crew_leader","crew_member","warehouse","auditor"] as const;
export type Role = (typeof Role)[number];

export const isRole = (value: unknown): value is Role =>
  typeof value === "string" && (Role as readonly string[]).includes(value);
