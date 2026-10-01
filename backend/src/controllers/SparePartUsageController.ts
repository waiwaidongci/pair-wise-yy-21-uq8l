import type { Request, Response } from "express";
import { sparePartUsageService } from "../services/SparePartUsageService";
import { wrap, operatorOf } from "../utils/controller";

export const sparePartUsageController = {
  list: wrap((_req: Request, res: Response) => {
    res.json(sparePartUsageService.list());
  }),

  // 申请备件
  apply: wrap((req: Request, res: Response) => {
    const user = operatorOf(req);
    const created = sparePartUsageService.apply(req.body, user);
    res.status(201).json(created);
  }),

  // 审批
  approve: wrap((req: Request, res: Response) => {
    const user = operatorOf(req);
    const updated = sparePartUsageService.settle(Number(req.params.id), "approve", req.body, user);
    res.json(updated);
  }),

  // 领用
  take: wrap((req: Request, res: Response) => {
    const user = operatorOf(req);
    const updated = sparePartUsageService.settle(Number(req.params.id), "take", req.body, user);
    res.json(updated);
  }),

  // 归还
  returnPart: wrap((req: Request, res: Response) => {
    const user = operatorOf(req);
    const updated = sparePartUsageService.settle(Number(req.params.id), "return", req.body, user);
    res.json(updated);
  }),

  // 消耗
  consume: wrap((req: Request, res: Response) => {
    const user = operatorOf(req);
    const updated = sparePartUsageService.settle(Number(req.params.id), "consume", req.body, user);
    res.json(updated);
  }),

  // 全量未结算
  unsettled: wrap((_req: Request, res: Response) => {
    res.json(sparePartUsageService.unsettledAll());
  })
};
