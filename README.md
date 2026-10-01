# 电力配网抢修工单系统（grid-repair）

面向供电所的配网故障报修、抢修派工、备件领用和停电恢复跟踪平台。核心是把**故障报修 → 抢修工单 → 班组 → 备件领用**接成可恢复的处置链。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址

- 前端：<http://localhost:20104>
- 后端健康检查：<http://localhost:21104/health>
- 后端 API：<http://localhost:21104/api>

## 本地开发

- 前端：`cd frontend && npm install && npm run dev`（端口 20104，`/api` 代理到 3000）
- 后端：`cd backend && npm install && npm run dev`（端口 3000）

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia + Vue Router |
| 后端 | Node.js + Express + TypeScript |
| 数据库 | MySQL 8.0（Docker）/ 内存数据层（本地开发） |
| 部署 | Docker Compose |

## 核心：可恢复处置链

针对"断网记录回所后被晚到的到场更新盖掉"和"同一工单重复消耗备件"两个问题，系统实现了以下机制：

### 1. 工单状态机（只能前进，不能倒退）

```
WAIT_DISPATCH → ASSIGNED → ARRIVED → REPAIRING → RESTORED → CLOSED
```

每个状态只允许执行正向动作（派工、到场、开始抢修、复电确认、关闭）。任何导致状态回退的请求都不会覆盖工单。

### 2. 离线上报：原请求号 + 现场序号

班组离线作业时，每次上报携带：
- **requestId（原请求号）**：全局唯一，用于幂等恢复
- **siteSeq（现场序号）**：工单现场事件的单调递增序号，用于乐观锁和排序

### 3. 写失败恢复（幂等）

- 每个写操作先按 `requestId` 查幂等记录
- 若已存在，直接返回第一次的结果（`replay=true`），不重复执行
- 写失败后按原请求号重试，沿用第一次结果

### 4. 并发复电：先落库有效，后到留存复核

两个班组同时提交复电时：
- 先落库的有效请求改变工单状态
- 后到的内容不覆盖工单，而是写入**复核记录表**（review_record），原因标记为 `STATE_REGRESSION` 或 `STALE_SEQ`
- 状态始终不倒退

### 5. 备件对账：未归还挡住关闭

工单关闭前，系统对账该工单下所有备件领用记录：
- 备件状态必须为 `RETURNED`（已归还）或 `CONSUMED`（已消耗）
- 若存在 `PENDING`/`APPROVED`/`TAKEN` 的备件，关闭被拦截（HTTP 409），并列出未结算备件清单
- 避免同一工单重复消耗备件

### 6. RBAC：越权直接拒绝

| 角色 | 权限 |
|---|---|
| 调度员 DISPATCHER | 派工、到场、抢修、复电确认、关闭、备件审批/领用/归还/消耗 |
| 班组长 CREW_LEADER | 到场、抢修、备件申请/领用/归还/消耗 |
| 仓管 STOREKEEPER | 备件审批/领用/归还/消耗 |
| 审计员 AUDITOR | 只读 |
| 班组成员 CREW_MEMBER | 仅备件申请 |

**复电确认仅调度员可做**，班组成员越权直接返回 403 `RBAC_DENIED`。

### 7. 审计一致性

每次处置都写入工单事件（ticket_event）和审计日志（audit_log），页面展示的状态和审计记录同源，调度员确认后页面和审计反映同一结果。

## 项目目录结构

```text
frontend/src/
├── api/              # 按实体分文件，request.ts 统一封装
├── stores/           # 按实体分文件（Auth/RepairTicket/SparePartUsage 等）
├── types/            # 共享类型定义
├── constants/        # 枚举、错误码、日志模板、状态文案
├── constructors/     # 默认对象/表单构造器
├── components/common/# StatusBadge/TimelineList/CrewCard/AssetTree 等
├── hooks/            # useTicketFlow/useCrewAvailability/usePagination
├── pages/            # Dashboard/Assets/Faults/Tickets/Parts
├── router/           # 路由 + RBAC 守卫
└── utils/            # formatters/request

backend/src/
├── routes/           # 按实体分文件
├── controllers/      # 按实体分文件，wrap 包装异常
├── services/         # 核心业务逻辑（状态机/幂等/对账/RBAC）
├── repositories/     # 数据访问层
├── models/           # 实体类型
├── database/         # 内存数据层（Table + 幂等/复核/事件表）
├── middlewares/      # auth/rbac/audit/requestLogger/errorHandler
├── constants/        # 枚举、错误码、日志模板
├── constructors/     # DTO 构造器
└── utils/            # errors/controller
```

## 环境变量

| 变量 | 说明 | 默认值 |
|---|---|---|
| COMPOSE_PROJECT_NAME | Compose 项目名 | grid-repair |
| FRONTEND_PORT | 前端端口 | 20104 |
| BACKEND_PORT | 后端端口 | 21104 |
| DB_PORT | 数据库宿主机端口 | 33060 |
| DB_USER/DB_PASSWORD/DB_NAME | 数据库凭据 | app_user/app_password/app_db |

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: grid-repair`
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-grid-repair}` 前缀
- 数据库使用命名卷 `db_data`，避免绑定中文路径
- 数据库配置 healthcheck，后端 `depends_on: condition: service_healthy`
- 常见问题：端口占用时修改 `.env` 中端口后重启；重置数据执行 `docker compose down -v`

## 枚举/常量出现位置清单

- **TicketStatus**（WAIT_DISPATCH/ASSIGNED/ARRIVED/REPAIRING/RESTORED/CLOSED）：
  - 后端：`constants/TicketStatus.ts`（状态机）、`services/RepairTicketService.ts`（流转校验）、`constructors/RepairTicketDtoFactory.ts`
  - 前端：`constants/TicketStatus.ts`（文案+流转图）、`stores/RepairTicketStore.ts`、`pages/TicketsPage.vue`（流程条）、`components/common/StatusBadge.vue`
- **SparePartStatus**（PENDING/APPROVED/TAKEN/RETURNED/CONSUMED）：
  - 后端：`constants/SparePartStatus.ts`、`services/SparePartUsageService.ts`（对账）
  - 前端：`constants/SparePartStatus.ts`、`pages/PartsPage.vue`、`components/common/StatusBadge.vue`
- **Role**（DISPATCHER/CREW_LEADER/STOREKEEPER/AUDITOR/CREW_MEMBER）：
  - 后端：`constants/Role.ts`（权限矩阵）、`middlewares/authMiddleware.ts`、`services/RepairTicketService.ts`
  - 前端：`types/Role.ts`、`stores/AuthStore.ts`、`router/routes.ts`（守卫）、`App.vue`（角色切换）
- **errorCodes/errorMessages**：前后端各一份，service/controller 分别包装异常
- **logTemplates**：`constants/logTemplates.ts`，所有写操作记录日志

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
