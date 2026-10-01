import type { Request, Response } from "express";
import { auditLogService } from "../services/AuditLogService";

export const auditLogController = {
  list: (req: Request, res: Response) => {
    const { target_type: targetType, target_id: targetId } = req.query as { target_type?: string; target_id?: string };
    if (targetType && targetId) {
      res.json(auditLogService.listByTarget(targetType, targetId));
      return;
    }
    res.json(auditLogService.list());
  }
};
