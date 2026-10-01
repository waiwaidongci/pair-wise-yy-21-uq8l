import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { ErrorCode } from "../constants/errorCodes";

// 业务错误：service 抛出，controller 捕获后包装为 HTTP 响应。
export class BizError extends Error {
  status: number;
  code: ErrorCode;
  details?: unknown;

  constructor(code: ErrorCode, status: number, details?: unknown, message?: string) {
    super(message ?? ERROR_MESSAGES[code] ?? code);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
