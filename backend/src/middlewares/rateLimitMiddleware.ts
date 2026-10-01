import type { RequestHandler } from "express";

// 简单令牌桶：每 IP 每分钟 120 次写请求。
const WINDOW_MS = 60_000;
const LIMIT = 120;
const hits = new Map<string, { count: number; resetAt: number }>();

export const rateLimitMiddleware: RequestHandler = (req, res, next) => {
  if (req.method === "GET") {
    next();
    return;
  }
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const bucket = hits.get(key);
  if (!bucket || bucket.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }
  bucket.count += 1;
  if (bucket.count > LIMIT) {
    res.status(429).json({ code: "RATE_LIMITED", message: "too many requests" });
    return;
  }
  next();
};
