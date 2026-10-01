import { Router } from "express";
import { repairTicketController } from "../controllers/RepairTicketController";

const router = Router();
router.get("/", repairTicketController.list);
router.post("/", repairTicketController.create);
// 断网恢复：按原请求号取回第一次落库结果。
router.get("/flow/:requestId", repairTicketController.recover);
router.get("/:id/events", repairTicketController.events);
// 处置链推进：到场、处理、复电、关闭。
router.post("/:id/flow", repairTicketController.advance);
export default router;
