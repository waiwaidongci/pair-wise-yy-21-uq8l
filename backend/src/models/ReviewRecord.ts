// 复核记录：迟到/越序/会导致状态倒退的上报内容不落工单，留存复核
export interface ReviewRecord {
  id: number;
  ticket_id: number;
  request_id: string;
  site_seq: number;
  event_type: string;
  payload: string;
  reason: string;
  created_at: string;
}
