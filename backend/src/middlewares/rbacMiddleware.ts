import type { RequestHandler } from "express";
import type { Role } from "../constants/Role";

// RBAC：路由级角色守卫，越权直接 403。
export const rbacMiddleware = (roles: readonly Role[] = []): RequestHandler =>
  (req, res, next) => {
    if (roles.length === 0) {
      next();
      return;
    }
    const user = (req as unknown as { user?: { id: number; role: Role } }).user;
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ code: "RBAC_DENIED", message: "role denied for this action", details: { need: roles, actual: user?.role ?? null } });
      return;
    }
    next();
  };
