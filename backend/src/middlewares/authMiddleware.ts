import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { isRole, type Role } from "../constants/Role";

export interface AuthUser {
  id: number;
  role: Role;
  name: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? "local-dev-secret";

// 认证：优先解析 Bearer JWT，其次 x-role 头（开发/离线联调用）
export const authMiddleware: RequestHandler = (req, _res, next) => {
  const bearer = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (bearer) {
    try {
      const payload = jwt.verify(bearer, JWT_SECRET) as { sub?: string | number; role?: string; name?: string };
      const role = isRole(payload.role) ? payload.role : "CREW_MEMBER";
      req.user = { id: Number(payload.sub ?? 0), role, name: payload.name ?? "" };
      next();
      return;
    } catch {
      // token 非法，落到 x-role
    }
  }
  const roleHeader = req.header("x-role");
  const role = isRole(roleHeader) ? roleHeader : "CREW_MEMBER";
  const idHeader = req.header("x-operator-id");
  req.user = { id: idHeader ? Number(idHeader) : 0, role, name: req.header("x-operator-name") ?? "" };
  next();
};

// 签发开发用 JWT
export function signDevToken(user: { id: number; role: Role; name: string }): string {
  return jwt.sign({ sub: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "12h" });
}
