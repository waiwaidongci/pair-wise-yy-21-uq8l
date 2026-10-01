import type { ErrorRequestHandler } from "express";

// 全局兜底：未预期异常统一 500；业务错误已在 controller 层包装。
export const errorHandlerMiddleware: ErrorRequestHandler = (err, _req, res, _next) =>
  res.status(err.status ?? 500).json({ code: err.code ?? "INTERNAL_ERROR", message: err.message, details: err.details ?? null });
