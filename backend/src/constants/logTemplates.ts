// 日志模板集中管理：所有写操作记录日志，字段变更时同步模板与调用处
export const LOG_TEMPLATES = {
  GridAsset: ["GridAsset.create", "GridAsset.update", "GridAsset.status", "GridAsset.export"],
  FaultReport: ["FaultReport.create", "FaultReport.update", "FaultReport.status", "FaultReport.export"],
  RepairTicket: [
    "RepairTicket.create",
    "RepairTicket.dispatch",
    "RepairTicket.arrive",
    "RepairTicket.start_repair",
    "RepairTicket.restore",
    "RepairTicket.close",
    "RepairTicket.transition.rejected",
    "RepairTicket.review.recorded",
    "RepairTicket.idempotent.replay",
    "RepairTicket.export"
  ],
  Crew: ["Crew.create", "Crew.update", "Crew.status", "Crew.export"],
  SparePartUsage: [
    "SparePartUsage.apply",
    "SparePartUsage.approve",
    "SparePartUsage.take",
    "SparePartUsage.return",
    "SparePartUsage.consume",
    "SparePartUsage.reconcile.blocked",
    "SparePartUsage.export"
  ],
  Idempotency: ["Idempotency.store", "Idempotency.replay", "Idempotency.conflict"],
  Review: ["Review.record", "Review.state_regression", "Review.stale_seq"],
  Auth: ["Auth.login", "Auth.denied", "Auth.restore_denied"]
} as const;

export type LogTemplateKey = keyof typeof LOG_TEMPLATES;
