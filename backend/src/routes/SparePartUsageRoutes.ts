import { Router } from "express";
import { sparePartUsageController } from "../controllers/SparePartUsageController";

const router = Router();

router.get("/", sparePartUsageController.list);
router.get("/unsettled", sparePartUsageController.unsettled);
router.post("/", sparePartUsageController.apply);
router.post("/:id/approve", sparePartUsageController.approve);
router.post("/:id/take", sparePartUsageController.take);
router.post("/:id/return", sparePartUsageController.returnPart);
router.post("/:id/consume", sparePartUsageController.consume);

export default router;
