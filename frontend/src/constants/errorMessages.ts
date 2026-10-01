export const ERROR_MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限（仅调度员可复电确认）",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  TICKET_NOT_FOUND: "工单不存在",
  INVALID_TRANSITION: "当前状态不允许执行该动作",
  STATE_REGRESSION: "状态不可倒退，迟到内容已留存复核",
  STALE_SEQ: "现场序号过期，内容已留存复核",
  IDEMPOTENCY_CONFLICT: "请求号已存在但内容不一致",
  PART_NOT_RETURNED: "存在未结算备件，不能关闭工单",
  PART_NOT_FOUND: "备件领用记录不存在",
  INVALID_PART_STATUS: "备件状态不允许执行该动作",
  TICKET_NOT_CLOSABLE: "工单存在未结算备件，不能关闭",
  WRITE_FAILED_RETRYABLE: "写入失败，请按原请求号重试"
};

export function errorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? "操作失败，请重试";
}
