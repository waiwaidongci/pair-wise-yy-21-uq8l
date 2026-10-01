// 工单现场事件：处置链审计轨迹，页面与审计共用同一份数据
export interface TicketEvent {
  id: number;
  ticket_id: number;
  event_type: string;
  from_status: string | null;
  to_status: string;
  site_seq: number;
  request_id: string;
  operator_id: number;
  operator_role: string;
  note: string;
  created_at: string;
}
