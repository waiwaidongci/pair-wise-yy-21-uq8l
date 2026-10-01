import { TicketStatusText, type TicketStatus } from "../constants/TicketStatus";
import { FlowActionText, type FlowAction } from "../constants/FlowAction";
import { FlowEventResultText, type FlowEventResult } from "../constants/FlowEventResult";
import { SparePartUsageStatusText, type SparePartUsageStatus } from "../constants/SparePartUsageStatus";
import { RoleText, type Role } from "../constants/Role";

// 日期、状态文本、风险等级等格式化逻辑集中在此，页面与服务共同依赖。
export const formatDate = (value: string | null | undefined) => (value ? new Date(value).toLocaleString("zh-CN") : "—");
export const formatStatus = (value: string) => TicketStatusText[value as TicketStatus] ?? value.replace(/_/g, " ");
export const formatFlowAction = (value: string) => FlowActionText[value as FlowAction] ?? value;
export const formatFlowResult = (value: string) => FlowEventResultText[value as FlowEventResult] ?? value;
export const formatUsageStatus = (value: string) => SparePartUsageStatusText[value as SparePartUsageStatus] ?? value;
export const formatRole = (value: string) => RoleText[value as Role] ?? value;
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
