export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "missing bearer token",
  RBAC_DENIED: "role denied for this action",
  VALIDATION_FAILED: "invalid payload",
  RATE_LIMITED: "too many requests",
  TICKET_NOT_FOUND: "repair ticket not found",
  TICKET_STATE_CONFLICT: "ticket status does not allow this transition",
  FLOW_REQUEST_NOT_FOUND: "no flow event recorded for this request id",
  SPARE_PART_NOT_FOUND: "spare part usage not found",
  SPARE_PART_STATE_CONFLICT: "spare part usage status does not allow this action",
  SPARE_PART_UNSETTLED: "ticket still has unsettled spare part usages"
};
