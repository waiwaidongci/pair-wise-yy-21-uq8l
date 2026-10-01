import type { RequestHandler } from "express";

// 请求日志中间件
export const requestLoggerMiddleware: RequestHandler = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    console.info(
      JSON.stringify({
        template: "HttpRequest",
        method: req.method,
        path: req.path,
        status: res.statusCode,
        costMs: Date.now() - start,
        at: new Date().toISOString()
      })
    );
  });
  next();
};
