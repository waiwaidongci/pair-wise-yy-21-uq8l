import type { RequestHandler } from "express";
import { db, now } from "../database/store";

// 审计日志中间件：写操作落 audit_log，与页面状态同源
export const auditLogMiddleware: RequestHandler = (req, _res, next) => {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    const actor = req.user ? `${req.user.id}:${req.user.role}` : "anonymous";
    const entry = {
      actor,
      action: `${req.method} ${req.path}`,
      target_type: req.path.split("/").filter(Boolean)[1] ?? "unknown",
      target_id: req.params?.id ?? "",
      created_at: now()
    };
    // 异步落库，不阻塞
    setImmediate(() => {
      try {
        db.auditLog.insert(entry as never);
      } catch {
        console.info(JSON.stringify({ template: "Audit.persist", ...entry }));
      }
    });
  }
  next();
};
