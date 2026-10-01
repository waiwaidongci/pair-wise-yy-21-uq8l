import type { Request, Response, NextFunction } from "express";
import { sparePartUsageService, type Actor } from "../services/SparePartUsageService";
import { BizError } from "../utils/BizError";

const actorOf = (req: Request): Actor => (req as unknown as { user: Actor }).user;

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

export const sparePartUsageController = {
  list: wrap((req, res) => {
    const ticketId = req.query.ticket_id ? Number(req.query.ticket_id) : null;
    res.json(ticketId ? sparePartUsageService.listByTicket(ticketId) : sparePartUsageService.list());
  }),
  apply: wrap((req, res) => res.status(201).json(sparePartUsageService.apply(req.body, actorOf(req)))),
  approve: wrap((req, res) => res.json(sparePartUsageService.transit(Number(req.params.id), "approve", req.body?.request_id, actorOf(req)))),
  consume: wrap((req, res) => res.json(sparePartUsageService.transit(Number(req.params.id), "consume", req.body?.request_id, actorOf(req)))),
  giveBack: wrap((req, res) => res.json(sparePartUsageService.transit(Number(req.params.id), "return", req.body?.request_id, actorOf(req)))),
  reconcile: wrap((req, res) => res.json(sparePartUsageService.reconcile(Number(req.params.ticketId))))
};
