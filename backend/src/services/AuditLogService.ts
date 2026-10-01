import { auditLogRepository } from "../repositories/AuditLogRepository";
import { createAuditLogDto } from "../constructors/AuditLogDtoFactory";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { AuditLog } from "../models/AuditLog";

// 审计服务：所有写操作落同一张审计表，页面与审计读取同一数据源。
export const auditLogService = {
  list: (): AuditLog[] => auditLogRepository.findAll(),
  listByTarget: (targetType: string, targetId: string): AuditLog[] =>
    auditLogRepository.findByTarget(targetType, targetId),
  record: (entry: { actor: string; action: string; targetType: string; targetId: string | number; detail: string; result: string }): AuditLog =>
    auditLogRepository.save(createAuditLogDto({
      actor: entry.actor,
      action: entry.action,
      target_type: entry.targetType,
      target_id: String(entry.targetId),
      detail: entry.detail,
      result: entry.result
    })),
  templates: () => LOG_TEMPLATES
};
