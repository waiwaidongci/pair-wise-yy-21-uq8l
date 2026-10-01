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
    "RepairTicket.flow.duplicate",
    "RepairTicket.flow.review_only",
    "RepairTicket.flow.rejected",
    "RepairTicket.close.blocked"
  ],
  Crew: ["Crew.create", "Crew.update", "Crew.status", "Crew.export"],
  SparePartUsage: [
    "SparePartUsage.create",
    "SparePartUsage.approve",
    "SparePartUsage.consume",
    "SparePartUsage.return",
    "SparePartUsage.duplicate",
    "SparePartUsage.reconcile"
  ],
  TicketFlowEvent: ["TicketFlowEvent.record", "TicketFlowEvent.recover", "TicketFlowEvent.review", "TicketFlowEvent.export"],
  AuditLog: ["AuditLog.write", "AuditLog.list", "AuditLog.export", "AuditLog.purge"]
};
