import { Router } from "express";
import { signDevToken } from "../middlewares/authMiddleware";
import { isRole, type Role } from "../constants/Role";

const router = Router();

// 开发/演示登录：按角色签发 JWT
router.post("/dev-login", (req, res) => {
  const { role, id, name } = req.body as { role?: string; id?: number; name?: string };
  const resolvedRole: Role = isRole(role) ? role : "CREW_MEMBER";
  const user = { id: id ?? 1, role: resolvedRole, name: name ?? resolvedRole };
  const token = signDevToken(user);
  res.json({ token, user });
});

export default router;
