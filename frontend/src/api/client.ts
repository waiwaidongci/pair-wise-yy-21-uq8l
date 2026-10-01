import { ERROR_MESSAGES } from "../constants/errorMessages";

// 会话头由 SessionStore 写入 localStorage，请求封装统一读取，避免 store 与 api 循环依赖。
const ROLE_KEY = "grid-repair.role";
const USER_KEY = "grid-repair.user-id";

export const sessionHeaders = (): Record<string, string> => ({
  "x-role": localStorage.getItem(ROLE_KEY) ?? "dispatcher",
  "x-user-id": localStorage.getItem(USER_KEY) ?? "1"
});

export class ApiError extends Error {
  code: string;
  status: number;
  details: unknown;

  constructor(code: string, status: number, message: string, details: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }

  get localizedMessage(): string {
    const known = ERROR_MESSAGES[this.code as keyof typeof ERROR_MESSAGES];
    return known ?? this.message;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
}

// 统一请求封装：业务错误抛 ApiError（带错误码与 details），网络错误原样抛出供离线队列识别。
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await fetch(path, {
    method: options.method ?? "GET",
    headers: { "content-type": "application/json", ...sessionHeaders() },
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new ApiError(data?.code ?? "INTERNAL_ERROR", res.status, data?.message ?? res.statusText, data?.details ?? null);
  }
  return data as T;
}
