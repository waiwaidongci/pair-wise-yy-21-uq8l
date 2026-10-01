# 电力配网抢修工单系统

面向供电所的配网故障报修、抢修派工、备件领用和停电恢复跟踪平台。故障报修、抢修工单、班组和备件领用接成一条**可恢复的处置链**：工单按到场、处理、复电推进，离线上报可恢复、可去重、可复核。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20104>

后端健康检查：<http://localhost:21104/health>

处置链上报（到场/处理/复电/关闭统一入口，需带原请求号与现场序号）：

```bash
curl -X POST http://localhost:21104/api/repair-ticket/1/flow \
  -H 'content-type: application/json' -H 'x-role: crew_leader' -H 'x-user-id: 11' \
  -d '{"request_id":"req-001","scene_seq":1,"action":"ARRIVE","note":"已到场"}'
```

断网恢复（按原请求号取回第一次落库结果）：

```bash
curl http://localhost:21104/api/repair-ticket/flow/req-001 -H 'x-role: dispatcher'
```

## 可恢复的处置链设计

- **状态机单调推进**：`WAIT_DISPATCH → ASSIGNED → ARRIVED → REPAIRING → RESTORED → CLOSED`，状态秩只升不降，晚到的到场更新无法盖掉已复电状态。
- **离线上报**：每次上报携带客户端生成的 `request_id`（原请求号）与单调递增的 `scene_seq`（现场序号）；断网时前端把上报缓存在本地队列，恢复后按原请求号重试。
- **幂等恢复**：同一 `request_id` 重复提交直接返回第一次结果（`deduplicated: true`）；写失败后可调 `GET /api/repair-ticket/flow/:requestId` 按原请求号恢复。
- **并发复电**：两个班组同时提交复电时，先落库的有效请求改变工单（`APPLIED`），后到内容保留为复核记录（`REVIEW_ONLY`），状态不倒退；越权与非法流转记为 `REJECTED` 留痕。
- **备件对账**：备件按 `REQUESTED → ISSUED → CONSUMED/RETURNED` 流转，全部操作按 `request_id` 幂等，同一工单不会重复消耗；工单关闭前对账，存在未归还/未消耗备件时返回 `409 SPARE_PART_UNSETTLED` 并列出原因清单。
- **RBAC**：复电确认与关闭仅调度员可执行，班组成员越权确认复电直接 `403 RBAC_DENIED`；页面按钮显隐与后端裁决使用同一角色（`x-role` 请求头）。
- **审计同源**：所有写操作落 `audit_log`，页面时间线（`ticket_flow_event`）与审计接口读取同一结果，调度员确认复电后页面与审计一致。

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`（`/api` 由 Vite 代理到 `localhost:21104`）
- 后端：`cd backend && npm install && npm run dev`，接口统一挂在 `/api`。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia |
| 后端 | Node.js + Express + TypeScript + Prisma |
| 数据库 | MySQL 8.0 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
backend/src/routes, controllers, services, models, repositories, middlewares, constants, constructors, utils, types, config
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `grid-repair`
- `FRONTEND_PORT`: 前端端口，默认 `20104`
- `BACKEND_PORT`: 后端端口，默认 `21104`
- `DB_PORT`: 数据库宿主机端口
- `DB_USER/DB_PASSWORD/DB_NAME`: 本地数据库凭据

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: grid-repair`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-grid-repair}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- FaultType: constants/FaultType、types/FaultType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- TicketStatus: constants/TicketStatus（含 `TICKET_STATUS_RANK` 状态秩）、types/TicketStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- AssetHealthStatus: constants/AssetHealthStatus、types/AssetHealthStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- FlowAction: constants/FlowAction（前后端各一份，含角色矩阵与下一动作表）、types/TicketFlowEvent、logTemplates、useTicketFlow、TicketsPage。
- FlowEventResult: constants/FlowEventResult（前后端各一份）、types/TicketFlowEvent、StatusBadge、TimelineList。
- SparePartUsageStatus: constants/SparePartUsageStatus（前后端各一份）、types/SparePartUsage、SparePartUsageService、PartsPage、StatusBadge。
- Role: constants/Role（前后端各一份）、middlewares/authMiddleware、middlewares/rbacMiddleware、SessionStore、App.vue 角色切换。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
