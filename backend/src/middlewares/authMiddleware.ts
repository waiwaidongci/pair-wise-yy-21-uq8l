import type { RequestHandler } from "express";
import { isRole } from "../constants/Role";

// 认证：从请求头解析操作者。本地联调用 x-role / x-user-id 头模拟登录态。
export const authMiddleware: RequestHandler = (req, res, next) => {
  const roleHeader = req.header("x-role") ?? "dispatcher";
  if (!isRole(roleHeader)) {
    res.status(401).json({ code: "AUTH_REQUIRED", message: "unknown role", details: { role: roleHeader } });
    return;
  }
  const id = Number(req.header("x-user-id") ?? 1);
  (req as unknown as { user: { id: number; role: string } }).user = {
    id: Number.isInteger(id) && id > 0 ? id : 1,
    role: roleHeader
  };
  next();
};
