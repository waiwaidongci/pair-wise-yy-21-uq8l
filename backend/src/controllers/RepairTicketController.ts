import type { Request, Response, NextFunction } from "express";
import { repairTicketService } from "../services/RepairTicketService";
import type { Actor } from "../services/SparePartUsageService";
import { BizError } from "../utils/BizError";

const actorOf = (req: Request): Actor => (req as unknown as { user: Actor }).user;

// controller 层统一包装：业务错误转成带错误码的 HTTP 响应，未预期错误继续抛给全局中间件。
const wrap = (fn: (req: Request, res: Response) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      fn(req, res);
    } catch (err) {
      if (err instanceof BizError) {
        res.status(err.status).json({ code: err.code, message: err.message, details: err.details ?? null });
        return;
      }
      next(err);
    }
  };

export const repairTicketController = {
  list: wrap((_req, res) => res.json(repairTicketService.list())),
  create: wrap((req, res) => res.status(201).json(repairTicketService.create(req.body, actorOf(req)))),
  events: wrap((req, res) => res.json(repairTicketService.eventsOf(Number(req.params.id)))),
  advance: wrap((req, res) => res.json(repairTicketService.advance(Number(req.params.id), req.body, actorOf(req)))),
  recover: wrap((req, res) => res.json(repairTicketService.recover(String(req.params.requestId))))
};
