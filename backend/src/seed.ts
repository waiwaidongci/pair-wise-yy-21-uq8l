export const seed = {
  "gridAsset": [
    {
      "id": 1,
      "asset_code": "DL-10KV-001",
      "asset_type": "TRANSFORMER",
      "feeder_line": "城东一线",
      "voltage_level": "MEDIUM",
      "location_desc": "城东街道 10kV 1号杆变",
      "health_status": "NORMAL",
      "owner_team_id": 1
    },
    {
      "id": 2,
      "asset_code": "DL-10KV-002",
      "asset_type": "SWITCH",
      "feeder_line": "城东二线",
      "voltage_level": "MEDIUM",
      "location_desc": "工业园区 10kV 分段开关",
      "health_status": "WATCH",
      "owner_team_id": 2
    },
    {
      "id": 3,
      "asset_code": "DL-04KV-003",
      "asset_type": "CABLE",
      "feeder_line": "河西支线",
      "voltage_level": "LOW",
      "location_desc": "河西村 0.4kV 主干电缆",
      "health_status": "DEGRADED",
      "owner_team_id": 3
    }
  ],
  "faultReport": [
    {
      "id": 1,
      "reporter_name": "王建国",
      "phone": "13800000001",
      "asset_id": 1,
      "fault_type": "OUTAGE",
      "address_desc": "城东街道幸福小区整栋停电",
      "severity": "HIGH",
      "report_channel": "95598热线",
      "status": "ASSIGNED"
    },
    {
      "id": 2,
      "reporter_name": "李秀兰",
      "phone": "13800000002",
      "asset_id": 2,
      "fault_type": "TRIP",
      "address_desc": "工业园区 3 号厂房频繁跳闸",
      "severity": "MEDIUM",
      "report_channel": "网上国网",
      "status": "REPAIRING"
    },
    {
      "id": 3,
      "reporter_name": "张志强",
      "phone": "13800000003",
      "asset_id": 3,
      "fault_type": "VOLTAGE_LOW",
      "address_desc": "河西村末端电压偏低",
      "severity": "LOW",
      "report_channel": "台区经理",
      "status": "WAIT_DISPATCH"
    }
  ],
  "repairTicket": [
    {
      "id": 1,
      "fault_report_id": 1,
      "team_id": 1,
      "dispatcher_id": 1,
      "priority": "HIGH",
      "status": "ASSIGNED",
      "assigned_at": "2026-09-30T08:10:00Z",
      "restored_at": null,
      "closed_at": null,
      "updated_at": "2026-09-30T08:10:00Z"
    },
    {
      "id": 2,
      "fault_report_id": 2,
      "team_id": 2,
      "dispatcher_id": 1,
      "priority": "MEDIUM",
      "status": "REPAIRING",
      "assigned_at": "2026-09-30T07:20:00Z",
      "restored_at": null,
      "closed_at": null,
      "updated_at": "2026-09-30T08:40:00Z"
    },
    {
      "id": 3,
      "fault_report_id": 3,
      "team_id": 3,
      "dispatcher_id": 2,
      "priority": "LOW",
      "status": "WAIT_DISPATCH",
      "assigned_at": null,
      "restored_at": null,
      "closed_at": null,
      "updated_at": "2026-09-30T09:00:00Z"
    }
  ],
  "crew": [
    {
      "id": 1,
      "name": "城东抢修一班",
      "leader_id": 11,
      "skill_tags": "10kV,变压器,夜间作业",
      "duty_status": "ON_DUTY",
      "current_ticket_id": 1,
      "contact_phone": "13800000011"
    },
    {
      "id": 2,
      "name": "园区抢修二班",
      "leader_id": 12,
      "skill_tags": "开关柜,继保",
      "duty_status": "ON_DUTY",
      "current_ticket_id": 2,
      "contact_phone": "13800000012"
    },
    {
      "id": 3,
      "name": "河西抢修三班",
      "leader_id": 13,
      "skill_tags": "低压,电缆",
      "duty_status": "STANDBY",
      "current_ticket_id": 3,
      "contact_phone": "13800000013"
    }
  ],
  "sparePartUsage": [
    {
      "id": 1,
      "ticket_id": 1,
      "part_code": "TR-10KV-200",
      "part_name": "10kV 配电变压器 200kVA",
      "quantity": 1,
      "warehouse_name": "城东中心库",
      "approved_by": "仓管-赵敏",
      "usage_status": "ISSUED",
      "request_id": "seed-spu-1",
      "updated_at": "2026-09-30T08:30:00Z"
    },
    {
      "id": 2,
      "ticket_id": 2,
      "part_code": "SW-10KV-630",
      "part_name": "10kV 负荷开关 630A",
      "quantity": 1,
      "warehouse_name": "园区周转库",
      "approved_by": "仓管-赵敏",
      "usage_status": "REQUESTED",
      "request_id": "seed-spu-2",
      "updated_at": "2026-09-30T08:50:00Z"
    },
    {
      "id": 3,
      "ticket_id": 2,
      "part_code": "FU-10KV-100",
      "part_name": "跌落式熔断器 100A",
      "quantity": 3,
      "warehouse_name": "园区周转库",
      "approved_by": "仓管-赵敏",
      "usage_status": "CONSUMED",
      "request_id": "seed-spu-3",
      "updated_at": "2026-09-30T09:05:00Z"
    }
  ],
  "ticketFlowEvent": [
    {
      "id": 1,
      "ticket_id": 1,
      "request_id": "seed-flow-1",
      "scene_seq": 1,
      "action": "DISPATCH",
      "actor_id": 1,
      "actor_role": "dispatcher",
      "note": "95598 工单派发城东抢修一班",
      "result": "APPLIED",
      "from_status": "WAIT_DISPATCH",
      "to_status": "ASSIGNED",
      "created_at": "2026-09-30T08:10:00Z"
    },
    {
      "id": 2,
      "ticket_id": 2,
      "request_id": "seed-flow-2",
      "scene_seq": 1,
      "action": "DISPATCH",
      "actor_id": 1,
      "actor_role": "dispatcher",
      "note": "派发园区抢修二班",
      "result": "APPLIED",
      "from_status": "WAIT_DISPATCH",
      "to_status": "ASSIGNED",
      "created_at": "2026-09-30T07:20:00Z"
    },
    {
      "id": 3,
      "ticket_id": 2,
      "request_id": "seed-flow-3",
      "scene_seq": 2,
      "action": "ARRIVE",
      "actor_id": 12,
      "actor_role": "crew_leader",
      "note": "已到场，开始勘查",
      "result": "APPLIED",
      "from_status": "ASSIGNED",
      "to_status": "ARRIVED",
      "created_at": "2026-09-30T07:55:00Z"
    },
    {
      "id": 4,
      "ticket_id": 2,
      "request_id": "seed-flow-4",
      "scene_seq": 3,
      "action": "START_REPAIR",
      "actor_id": 12,
      "actor_role": "crew_leader",
      "note": "隔离故障点，开始更换开关",
      "result": "APPLIED",
      "from_status": "ARRIVED",
      "to_status": "REPAIRING",
      "created_at": "2026-09-30T08:40:00Z"
    }
  ],
  "auditLog": [
    {
      "id": 1,
      "actor": "dispatcher#1",
      "action": "RepairTicket.dispatch",
      "target_type": "RepairTicket",
      "target_id": "1",
      "detail": "95598 工单派发城东抢修一班",
      "result": "APPLIED",
      "created_at": "2026-09-30T08:10:00Z"
    },
    {
      "id": 2,
      "actor": "crew_leader#12",
      "action": "RepairTicket.start_repair",
      "target_type": "RepairTicket",
      "target_id": "2",
      "detail": "隔离故障点，开始更换开关",
      "result": "APPLIED",
      "created_at": "2026-09-30T08:40:00Z"
    }
  ]
} as const;
