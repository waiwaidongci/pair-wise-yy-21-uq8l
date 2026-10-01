// 错误消息模板：service/controller 分别包装异常时引用同一模板
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "角色 {{role}} 无权执行 {{action}}（仅调度员可复电确认）",
  VALIDATION_FAILED: "invalid payload: {{field}}",
  RATE_LIMITED: "too many requests",
  TICKET_NOT_FOUND: "工单 {{ticketId}} 不存在",
  INVALID_TRANSITION: "工单状态 {{from}} 不允许执行 {{action}}",
  STATE_REGRESSION: "状态不可倒退：工单当前 {{current}}，收到 {{target}} 已留存复核",
  STALE_SEQ: "现场序号过期：当前 {{currentSeq}}，收到 {{siteSeq}}，内容已留存复核",
  IDEMPOTENCY_CONFLICT: "请求号 {{requestId}} 已存在但内容不一致",
  PART_NOT_RETURNED: "备件 {{partCode}}（{{partName}}）未{{settleAction}}，共 {{count}} 件",
  PART_NOT_FOUND: "备件领用记录 {{partId}} 不存在",
  INVALID_PART_STATUS: "备件状态 {{status}} 不允许执行 {{action}}",
  TICKET_NOT_CLOSABLE: "工单 {{ticketId}} 存在未结算备件，不能关闭",
  WRITE_FAILED_RETRYABLE: "写入失败，请按原请求号 {{requestId}} 重试"
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

// 简单模板替换：{{key}} -> params[key]
export function formatMessage(key: ErrorMessageKey, params: Record<string, string | number> = {}): string {
  const tpl: string = ERROR_MESSAGES[key];
  return tpl.replace(/\{\{(\w+)\}\}/g, (_match, k: string) => String(params[k] ?? ""));
}
