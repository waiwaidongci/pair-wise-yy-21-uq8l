import type { Request, Response, NextFunction } from "express";
import { isAppError } from "../utils/errors";

// 包装异步 handler：service 抛出的 AppError 转 HTTP 响应，其余交全局错误处理
export function wrap(handler: (req: Request, res: Response) => unknown) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(handler(req, res)).catch((err: unknown) => {
      if (isAppError(err)) {
        res.status(err.status).json({ code: err.code, message: err.message });
        return;
      }
      next(err);
    });
  };
}

// 从请求头/体解析操作人
export function operatorOf(req: Request): { id: number; role: string } {
  const body = (req.body ?? {}) as { operatorId?: number };
  const headerId = req.header("x-operator-id");
  return {
    id: body.operatorId ?? (headerId ? Number(headerId) : (req as unknown as { user?: { id: number } }).user?.id ?? 0),
    role: (req as unknown as { user?: { role: string } }).user?.role ?? "CREW_MEMBER"
  };
}
