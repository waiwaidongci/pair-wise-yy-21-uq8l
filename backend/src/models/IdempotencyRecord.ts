// 幂等记录：按原请求号（request_id）保存第一次写入结果，重试沿用
export interface IdempotencyRecord {
  id: number;
  request_id: string;
  target_type: string;
  target_id: number;
  event_type: string;
  // 第一次写入的响应（JSON 字符串）
  response: string;
  created_at: string;
}
