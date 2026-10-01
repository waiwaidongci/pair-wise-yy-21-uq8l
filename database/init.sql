-- 配网抢修工单系统数据库初始化（MySQL 8.0）
-- 核心实体表
CREATE TABLE IF NOT EXISTS grid_asset (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_code VARCHAR(64),
  asset_type VARCHAR(32),
  feeder_line VARCHAR(64),
  voltage_level VARCHAR(16),
  location_desc VARCHAR(128),
  health_status VARCHAR(16),
  owner_team_id INT
);

CREATE TABLE IF NOT EXISTS fault_report (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reporter_name VARCHAR(64),
  phone VARCHAR(20),
  asset_id INT,
  fault_type VARCHAR(32),
  address_desc VARCHAR(128),
  severity VARCHAR(16),
  report_channel VARCHAR(32),
  status VARCHAR(16)
);

CREATE TABLE IF NOT EXISTS repair_ticket (
  id INT PRIMARY KEY AUTO_INCREMENT,
  fault_report_id INT,
  team_id INT,
  dispatcher_id INT,
  priority VARCHAR(16),
  status VARCHAR(16),
  assigned_at VARCHAR(32),
  restored_at VARCHAR(32),
  site_seq INT DEFAULT 0,
  version INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS crew (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(64),
  leader_id INT,
  skill_tags VARCHAR(128),
  duty_status VARCHAR(16),
  current_ticket_id INT,
  contact_phone VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS spare_part_usage (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT,
  part_code VARCHAR(64),
  part_name VARCHAR(64),
  quantity INT,
  warehouse_name VARCHAR(64),
  approved_by VARCHAR(32),
  usage_status VARCHAR(16),
  applied_at VARCHAR(32),
  approved_at VARCHAR(32),
  settled_at VARCHAR(32)
);

-- 处置链表：幂等记录（按原请求号恢复）
CREATE TABLE IF NOT EXISTS idempotency_record (
  id INT PRIMARY KEY AUTO_INCREMENT,
  request_id VARCHAR(64) UNIQUE,
  target_type VARCHAR(32),
  target_id INT,
  event_type VARCHAR(32),
  response TEXT,
  created_at VARCHAR(32)
);

-- 复核记录表（迟到/越序上报，状态不倒退）
CREATE TABLE IF NOT EXISTS review_record (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT,
  request_id VARCHAR(64),
  site_seq INT,
  event_type VARCHAR(32),
  payload TEXT,
  reason VARCHAR(32),
  created_at VARCHAR(32)
);

-- 工单事件表（处置链审计轨迹）
CREATE TABLE IF NOT EXISTS ticket_event (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT,
  event_type VARCHAR(32),
  from_status VARCHAR(16),
  to_status VARCHAR(16),
  site_seq INT,
  request_id VARCHAR(64),
  operator_id INT,
  operator_role VARCHAR(32),
  note VARCHAR(256),
  created_at VARCHAR(32)
);

-- 审计日志表
CREATE TABLE IF NOT EXISTS audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  actor VARCHAR(64),
  action VARCHAR(128),
  target_type VARCHAR(32),
  target_id VARCHAR(32),
  created_at VARCHAR(32)
);

-- 种子数据
INSERT INTO grid_asset (asset_code, asset_type, feeder_line, voltage_level, location_desc, health_status, owner_team_id) VALUES
('GA-001', 'VOLTAGE_LOW', '城东线', 'LOW', '城东开发区1号杆', 'NORMAL', 1),
('GA-002', 'TRIP', '城西线', 'MEDIUM', '城西工业园2号杆', 'WATCH', 2),
('GA-003', 'EQUIPMENT_DAMAGE', '城南线', 'HIGH', '城南变电站3号杆', 'DEGRADED', 3);

INSERT INTO fault_report (reporter_name, phone, asset_id, fault_type, address_desc, severity, report_channel, status) VALUES
('张伟', '13800000001', 1, 'VOLTAGE_LOW', '城东开发区电压偏低', 'MEDIUM', 'PHONE', 'ASSIGNED'),
('李娜', '13800000002', 2, 'TRIP', '城西工业园跳闸', 'HIGH', 'APP', 'ARRIVED'),
('王强', '13800000003', 3, 'EQUIPMENT_DAMAGE', '城南设备损坏', 'CRITICAL', 'PHONE', 'WAIT_DISPATCH');

INSERT INTO repair_ticket (fault_report_id, team_id, dispatcher_id, priority, status, assigned_at, restored_at, site_seq, version) VALUES
(1, 1, 1, 'MEDIUM', 'ASSIGNED', '2026-06-11T09:00:00Z', NULL, 0, 1),
(2, 2, 1, 'HIGH', 'ARRIVED', '2026-06-12T09:00:00Z', NULL, 1, 1),
(3, 3, 1, 'CRITICAL', 'WAIT_DISPATCH', '2026-06-13T09:00:00Z', NULL, 0, 1);

INSERT INTO crew (name, leader_id, skill_tags, duty_status, current_ticket_id, contact_phone) VALUES
('城东抢修班', 1, '高压,低压', 'ON_DUTY', 1, '13800000001'),
('城西抢修班', 2, '高压,电缆', 'ON_DUTY', 2, '13800000002'),
('城南抢修班', 3, '变电,设备', 'ON_DUTY', 3, '13800000003');

INSERT INTO spare_part_usage (ticket_id, part_code, part_name, quantity, warehouse_name, approved_by, usage_status, applied_at, approved_at, settled_at) VALUES
(1, 'PART-001', '交流接触器', 2, '一号库', 'u2', 'TAKEN', '2026-06-11T09:10:00Z', '2026-06-11T09:30:00Z', NULL),
(2, 'PART-002', '断路器', 1, '二号库', 'u2', 'RETURNED', '2026-06-12T09:10:00Z', '2026-06-12T09:30:00Z', '2026-06-12T11:00:00Z'),
(3, 'PART-003', '隔离开关', 4, '三号库', NULL, 'PENDING', '2026-06-13T09:10:00Z', NULL, NULL);
