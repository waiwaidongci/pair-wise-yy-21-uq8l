import type { ErrorRequestHandler } from "express";
import { isAppError } from "../utils/errors";

// 全局异常处理：service/controller 已包装的 AppError 直接透传，其余兜底
export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
  if (isAppError(err)) {
    res.status(err.status).json({ code: err.code, message: err.message });
    return;
  }
  console.error(JSON.stringify({ template: "UnhandledError", message: (err as Error).message }));
  res.status(500).json({ code: "INTERNAL_ERROR", message: (err as Error).message ?? "internal error" });
};
