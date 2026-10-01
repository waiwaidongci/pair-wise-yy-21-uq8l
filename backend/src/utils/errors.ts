import { ERROR_CODES } from "../constants/errorCodes";
import { formatMessage, type ErrorMessageKey } from "../constants/errorMessages";

// 业务异常：service 层包装后抛出，controller 层转 HTTP 响应
export class AppError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "AppError";
  }
}

// 工厂方法：按错误码 + 模板参数构造业务异常
export function appError(
  status: number,
  code: (typeof ERROR_CODES)[keyof typeof ERROR_CODES],
  messageKey: ErrorMessageKey,
  params: Record<string, string | number> = {}
): AppError {
  return new AppError(status, code, formatMessage(messageKey, params));
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
