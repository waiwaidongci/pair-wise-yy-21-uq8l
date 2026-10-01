export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  TICKET_NOT_FOUND: "工单不存在",
  TICKET_STATE_CONFLICT: "当前工单状态不允许该流转",
  FLOW_REQUEST_NOT_FOUND: "未找到该请求号的处置记录",
  SPARE_PART_NOT_FOUND: "备件领用记录不存在",
  SPARE_PART_STATE_CONFLICT: "备件当前状态不允许该操作",
  SPARE_PART_UNSETTLED: "存在未归还或未消耗的备件，暂不能关闭工单"
};
