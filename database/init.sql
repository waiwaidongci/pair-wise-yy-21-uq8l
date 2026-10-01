CREATE TABLE IF NOT EXISTS grid_asset (
  id INT PRIMARY KEY,
  asset_code VARCHAR(64),
  asset_type VARCHAR(32),
  feeder_line VARCHAR(64),
  voltage_level VARCHAR(16),
  location_desc VARCHAR(255),
  health_status VARCHAR(16),
  owner_team_id INT
);

CREATE TABLE IF NOT EXISTS fault_report (
  id INT PRIMARY KEY,
  reporter_name VARCHAR(64),
  phone VARCHAR(32),
  asset_id INT,
  fault_type VARCHAR(32),
  address_desc VARCHAR(255),
  severity VARCHAR(16),
  report_channel VARCHAR(32),
  status VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS repair_ticket (
  id INT PRIMARY KEY,
  fault_report_id INT,
  team_id INT,
  dispatcher_id INT,
  priority VARCHAR(16),
  status VARCHAR(16),
  assigned_at VARCHAR(40),
  restored_at VARCHAR(40),
  closed_at VARCHAR(40),
  updated_at VARCHAR(40)
);

-- 处置链事件：每次到场/处理/复电/关闭上报落一条，request_id 为幂等键。
CREATE TABLE IF NOT EXISTS ticket_flow_event (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_id INT NOT NULL,
  request_id VARCHAR(64) NOT NULL,
  scene_seq INT NOT NULL,
  action VARCHAR(16) NOT NULL,
  actor_id INT NOT NULL,
  actor_role VARCHAR(16) NOT NULL,
  note VARCHAR(255),
  result VARCHAR(16) NOT NULL,
  from_status VARCHAR(16) NOT NULL,
  to_status VARCHAR(16) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uk_flow_request (request_id),
  KEY idx_flow_ticket (ticket_id)
);

CREATE TABLE IF NOT EXISTS crew (
  id INT PRIMARY KEY,
  name VARCHAR(64),
  leader_id INT,
  skill_tags VARCHAR(255),
  duty_status VARCHAR(16),
  current_ticket_id INT,
  contact_phone VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS spare_part_usage (
  id INT PRIMARY KEY,
  ticket_id INT,
  part_code VARCHAR(64),
  part_name VARCHAR(128),
  quantity INT,
  warehouse_name VARCHAR(64),
  approved_by VARCHAR(64),
  usage_status VARCHAR(16),
  request_id VARCHAR(64),
  updated_at VARCHAR(40),
  UNIQUE KEY uk_usage_request (request_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  actor VARCHAR(64),
  action VARCHAR(64),
  target_type VARCHAR(32),
  target_id VARCHAR(32),
  detail VARCHAR(255),
  result VARCHAR(16),
  created_at VARCHAR(40)
);
