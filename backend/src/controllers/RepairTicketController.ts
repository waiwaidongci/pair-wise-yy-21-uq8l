import type { Request, Response } from "express";
import { repairTicketService } from "../services/RepairTicketService";
import { sparePartUsageService } from "../services/SparePartUsageService";
import { wrap, operatorOf } from "../utils/controller";

export const repairTicketController = {
  list: wrap((_req: Request, res: Response) => {
    res.json(repairTicketService.list());
  }),

  detail: wrap((req: Request, res: Response) => {
    const id = Number(req.params.id);
    res.json(repairTicketService.detail(id));
  }),

  // 派工
  dispatch: wrap((req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = operatorOf(req);
    const result = repairTicketService.transition(id, "dispatch", req.body, user);
    res.status(result.applied ? 200 : 202).json(result);
  }),

  // 到场
  arrive: wrap((req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = operatorOf(req);
    const result = repairTicketService.transition(id, "arrive", req.body, user);
    res.status(result.applied ? 200 : 202).json(result);
  }),

  // 处理（开始抢修）
  startRepair: wrap((req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = operatorOf(req);
    const result = repairTicketService.transition(id, "start_repair", req.body, user);
    res.status(result.applied ? 200 : 202).json(result);
  }),

  // 复电确认（仅调度员）
  restore: wrap((req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = operatorOf(req);
    const result = repairTicketService.transition(id, "restore", req.body, user);
    res.status(result.applied ? 200 : 202).json(result);
  }),

  // 关闭（需备件对账通过）
  close: wrap((req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = operatorOf(req);
    const result = repairTicketService.transition(id, "close", req.body, user);
    res.status(result.applied ? 200 : 202).json(result);
  }),

  // 对账：查询工单未结算备件
  reconcile: wrap((req: Request, res: Response) => {
    const id = Number(req.params.id);
    res.json(sparePartUsageService.reconcile(id));
  })
};
