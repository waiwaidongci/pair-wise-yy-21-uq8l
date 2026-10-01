import type { RequestHandler } from "express";
import { roleCan } from "../constants/Role";
import { ERROR_CODES } from "../constants/errorCodes";

// RBAC：校验当前角色是否允许执行某动作
export function rbacMiddleware(action: string): RequestHandler {
  return (req, res, next) => {
    const role = req.user?.role ?? "CREW_MEMBER";
    if (!roleCan(role, action)) {
      res.status(403).json({
        code: ERROR_CODES.RBAC_DENIED,
        message: `角色 ${role} 无权执行 ${action}`
      });
      return;
    }
    next();
  };
}
