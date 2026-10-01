import { Router } from "express";
import { sparePartUsageController } from "../controllers/SparePartUsageController";

const router = Router();
router.get("/", sparePartUsageController.list);
router.post("/", sparePartUsageController.apply);
// 工单关闭前的备件对账。
router.get("/reconcile/:ticketId", sparePartUsageController.reconcile);
router.post("/:id/approve", sparePartUsageController.approve);
router.post("/:id/consume", sparePartUsageController.consume);
router.post("/:id/return", sparePartUsageController.giveBack);
export default router;
