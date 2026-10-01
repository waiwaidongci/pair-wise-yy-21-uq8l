<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useCrewStore } from "../stores/CrewStore";
import { useAuditLogStore } from "../stores/AuditLogStore";
import { useSessionStore } from "../stores/SessionStore";
import { useTicketFlow } from "../hooks/useTicketFlow";
import { ApiError } from "../api/client";
import { FlowActionText, FLOW_ACTION_ROLES, NEXT_FLOW_ACTION, type FlowAction } from "../constants/FlowAction";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { formatDate } from "../utils/formatters";
import StatusBadge from "../components/common/StatusBadge.vue";
import PriorityTag from "../components/common/PriorityTag.vue";
import TimelineList from "../components/common/TimelineList.vue";
import EmptyState from "../components/common/EmptyState.vue";
import type { ReconcileReason } from "../types/SparePartUsage";

const ticketStore = useRepairTicketStore();
const crewStore = useCrewStore();
const auditStore = useAuditLogStore();
const session = useSessionStore();
const flow = useTicketFlow();

const selectedId = ref<number | null>(null);
const note = ref("");
const pageError = ref<string | null>(null);
const blockedReasons = ref<ReconcileReason[]>([]);
const queuedHint = ref<string | null>(null);

const selected = computed(() => ticketStore.rows.find((row) => row.id === selectedId.value) ?? null);
const selectedEvents = computed(() => (selectedId.value ? ticketStore.events[selectedId.value] ?? [] : []));
const crewName = (id: number) => crewStore.rows.find((crew) => crew.id === id)?.name ?? `班组#${id}`;

// 按钮显隐：状态机的下一步动作 + 当前角色是否在允许矩阵内。
const nextActionOf = (status: string) => NEXT_FLOW_ACTION[status as keyof typeof NEXT_FLOW_ACTION] ?? null;
const canAct = (action: FlowAction | null) => !!action && FLOW_ACTION_ROLES[action].includes(session.role);

const select = async (id: number) => {
  selectedId.value = id;
  blockedReasons.value = [];
  await Promise.all([
    ticketStore.loadEvents(id),
    auditStore.load("RepairTicket", String(id))
  ]);
};

const reload = async (ticketId?: number) => {
  await ticketStore.load();
  if (ticketId ?? selectedId.value) {
    await Promise.all([
      ticketStore.loadEvents((ticketId ?? selectedId.value)!),
      auditStore.load("RepairTicket", String(ticketId ?? selectedId.value))
    ]);
  }
};

// 推进处置链：网络失败进离线队列；业务错误（越权/对账拦截）直接展示。
const act = async (ticketId: number, action: FlowAction) => {
  pageError.value = null;
  blockedReasons.value = [];
  queuedHint.value = null;
  try {
    const result = await flow.submit(ticketId, action, note.value);
    note.value = "";
    if (result === null) {
      queuedHint.value = `网络不可用，${FlowActionText[action]}已按原请求号缓存，恢复后自动沿用首次结果`;
      return;
    }
    await reload(ticketId);
  } catch (err) {
    if (err instanceof ApiError) {
      pageError.value = err.localizedMessage;
      const details = err.details as { reasons?: ReconcileReason[] } | null;
      if (err.code === "SPARE_PART_UNSETTLED" && details?.reasons) {
        blockedReasons.value = details.reasons;
        pageError.value = ERROR_MESSAGES.SPARE_PART_UNSETTLED;
      }
      await reload(ticketId);
    } else {
      pageError.value = "请求失败，请稍后再试";
    }
  }
};

// 恢复重试：离线队列按原请求号重新提交，重复重试沿用第一次结果。
const flushQueue = async () => {
  await flow.flush();
  await reload();
};

onMounted(async () => {
  await Promise.all([ticketStore.load(), crewStore.load()]);
  if (ticketStore.rows.length) await select(ticketStore.rows[0].id);
});
</script>

<template>
  <section class="tickets">
    <div class="panel wide">
      <h2>工单处置链</h2>
      <p class="hint">当前角色：<strong>{{ session.roleText }}</strong>。到场、处理由班组长上报，复电确认与关闭仅调度员可执行。</p>
      <table class="table">
        <thead>
          <tr><th>工单</th><th>优先级</th><th>状态</th><th>班组</th><th>派工时间</th><th>复电时间</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in ticketStore.rows" :key="row.id" :class="{ active: row.id === selectedId }" @click="select(row.id)">
            <td>#{{ row.id }}</td>
            <td><PriorityTag :value="row.priority" /></td>
            <td><StatusBadge :value="row.status" /></td>
            <td>{{ crewName(row.team_id) }}</td>
            <td>{{ formatDate(row.assigned_at) }}</td>
            <td>{{ formatDate(row.restored_at) }}</td>
            <td>
              <button
                v-if="nextActionOf(row.status)"
                class="primary"
                :disabled="!canAct(nextActionOf(row.status))"
                :title="canAct(nextActionOf(row.status)) ? '' : '当前角色无权执行该动作'"
                @click.stop="act(row.id, nextActionOf(row.status)!)"
              >{{ FlowActionText[nextActionOf(row.status)!] }}</button>
              <span v-else class="muted">已办结</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="pageError" class="error">{{ pageError }}</p>
      <ul v-if="blockedReasons.length" class="reasons">
        <li v-for="reason in blockedReasons" :key="reason.usage_id">
          {{ reason.part_name }}（{{ reason.part_code }}）x{{ reason.quantity }}：{{ reason.reason }}
        </li>
      </ul>
      <p v-if="queuedHint" class="queued">{{ queuedHint }}</p>
      <div class="note-bar">
        <input v-model="note" placeholder="处置备注（随上报落库，迟到内容保留为复核记录）" />
      </div>
    </div>

    <div class="panel">
      <h2>离线待恢复队列（{{ flow.pendingCount.value }}）</h2>
      <template v-if="flow.queue.value.length">
        <article class="queue-item" v-for="item in flow.queue.value" :key="item.request_id">
          <strong>{{ FlowActionText[item.action] }} · 工单#{{ item.ticket_id }}</strong>
          <p>请求号 {{ item.request_id }} · 现场序号 {{ item.scene_seq }}</p>
          <button @click="flow.recover(item.request_id).then(() => reload(item.ticket_id)).catch(() => {})">按请求号恢复</button>
          <button @click="flow.removeQueued(item.request_id)">移除</button>
        </article>
        <button class="primary" @click="flushQueue">恢复重试（沿用首次结果）</button>
      </template>
      <EmptyState v-else />
    </div>

    <div class="panel" v-if="selected">
      <h2>处置时间线 · 工单#{{ selected.id }}</h2>
      <TimelineList :events="selectedEvents" />
    </div>

    <div class="panel" v-if="selected">
      <h2>审计记录 · 工单#{{ selected.id }}</h2>
      <table class="table">
        <thead><tr><th>时间</th><th>操作者</th><th>动作</th><th>结果</th></tr></thead>
        <tbody>
          <tr v-for="row in auditStore.rows" :key="row.id">
            <td>{{ formatDate(row.created_at) }}</td>
            <td>{{ row.actor }}</td>
            <td>{{ row.action }}</td>
            <td><StatusBadge :value="row.result" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
