export interface RepairTicket {
  id: number;
  fault_report_id: number;
  team_id: number;
  dispatcher_id: number;
  priority: string;
  status: string;
  assigned_at: string;
  restored_at: string | null;
  // 现场序号：班组离线上报的事件序号，单调递增，用于乐观锁与排序
  site_seq: number;
  // 版本号：乐观锁
  version: number;
}
