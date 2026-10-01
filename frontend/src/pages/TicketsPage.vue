<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useSparePartUsageStore } from "../stores/SparePartUsageStore";
import { useAuthStore } from "../stores/AuthStore";
import { useTicketFlow } from "../hooks/useTicketFlow";
import { TicketStatusText, TicketActionText, nextAction } from "../constants/TicketStatus";
import { SparePartStatusText } from "../constants/SparePartStatus";
import { roleCan } from "../types/Role";
import { errorMessage } from "../constants/errorMessages";
import StatusBadge from "../components/common/StatusBadge.vue";
import PriorityTag from "../components/common/PriorityTag.vue";
import TimelineList from "../components/common/TimelineList.vue";
import EmptyState from "../components/common/EmptyState.vue";
import { formatDate } from "../utils/formatters";
import type { RepairTicket, TicketAction } from "../types/RepairTicket";

const ticketStore = useRepairTicketStore();
const partStore = useSparePartUsageStore();
const auth = useAuthStore();

const selectedId = ref<number | null>(null);
const flow = useTicketFlow(selectedId);

const detail = computed(() => ticketStore.detail);
const selectedTicket = computed(() => flow.currentTicket.value);

onMounted(async () => {
  await Promise.all([ticketStore.load(), partStore.load()]);
  if (ticketStore.rows.length) select(ticketStore.rows[0].id);
});

async function select(id: number) {
  selectedId.value = id;
  await ticketStore.loadDetail(id);
}

const feedback = ref<{ type: "ok" | "warn" | "err"; text: string } | null>(null);

async function doAdvance(action: TicketAction) {
  feedback.value = null;
  try {
    const result = await flow.advance(action);
    if (result.applied) {
      feedback.value = { type: "ok", text: `${TicketActionText[action]}成功` };
    } else if (result.reason === "STATE_REGRESSION") {
      feedback.value = { type: "warn", text: "状态不可倒退，迟到内容已留存复核" };
    } else if (result.reason === "STALE_SEQ") {
      feedback.value = { type: "warn", text: "现场序号过期，内容已留存复核" };
    }
  } catch (err) {
    const code = (err as { code?: string }).code ?? "";
    if (code === "PART_NOT_RETURNED") {
      const blocked = (err as { blockedParts?: unknown[] }).blockedParts;
      feedback.value = { type: "err", text: `存在未结算备件，不能关闭：${(blocked as { partName: string }[])?.map((b) => b.partName).join("、") ?? ""}` };
    } else {
      feedback.value = { type: "err", text: errorMessage(code) };
    }
  }
}

// 当前状态允许的动作按钮
const allowedActions = computed(() => {
  if (!selectedTicket.value) return [];
  const next = nextAction(selectedTicket.value.status);
  if (!next) return [];
  return [next as TicketAction];
});

function canDo(action: string): boolean {
  return roleCan(auth.role, action);
}

const FLOW_ORDER = ["WAIT_DISPATCH", "ASSIGNED", "ARRIVED", "REPAIRING", "RESTORED", "CLOSED"];
function isStepDone(status: string): boolean {
  if (!selectedTicket.value) return false;
  return FLOW_ORDER.indexOf(selectedTicket.value.status) >= FLOW_ORDER.indexOf(status);
}
</script>

<template>
  <div class="tickets-page">
    <div class="layout">
      <aside class="ticket-list">
        <div
          v-for="t in ticketStore.rows"
          :key="t.id"
          class="ticket-item"
          :class="{ active: t.id === selectedId }"
          @click="select(t.id)"
        >
          <div class="row1">
            <strong>#{{ t.id }}</strong>
            <StatusBadge :value="t.status" />
          </div>
          <div class="row2">
            <PriorityTag :value="t.priority" />
            <span class="seq">现场序号 {{ t.site_seq }}</span>
          </div>
        </div>
        <EmptyState v-if="!ticketStore.rows.length" text="暂无工单" />
      </aside>

      <main class="ticket-detail" v-if="selectedTicket && flow">
        <header class="detail-head">
          <div>
            <h2>工单 #{{ selectedTicket.id }}</h2>
            <div class="sub">
              <StatusBadge :value="selectedTicket.status" />
              <span>当前现场序号：{{ selectedTicket.site_seq }}</span>
            </div>
          </div>
          <div class="actions">
            <template v-for="a in allowedActions" :key="a">
              <button
                v-if="canDo(a)"
                class="btn btn-primary"
                :disabled="flow.submitting.value"
                @click="doAdvance(a)"
              >
                {{ TicketActionText[a] }}
              </button>
              <button v-else class="btn btn-denied" disabled>
                {{ TicketActionText[a] }}（{{ auth.roleLabel }}无权）
              </button>
            </template>
          </div>
        </header>

        <transition name="fade">
          <div v-if="feedback" class="feedback" :class="feedback.type">{{ feedback.text }}</div>
        </transition>

        <section class="panel">
          <h3>处置流程</h3>
          <div class="flow-steps">
            <span v-for="(s, i) in ['WAIT_DISPATCH','ASSIGNED','ARRIVED','REPAIRING','RESTORED','CLOSED']" :key="s" class="step">
              <span class="step-dot" :class="{ done: isStepDone(s), current: selectedTicket.status === s }"></span>
              <span class="step-label">{{ TicketStatusText[s as keyof typeof TicketStatusText] }}</span>
              <span v-if="i < 5" class="step-line"></span>
            </span>
          </div>
        </section>

        <section class="panel">
          <h3>备件领用 <span class="muted">（未归还将挡住关闭）</span></h3>
          <table v-if="detail?.parts.length">
            <thead><tr><th>备件</th><th>数量</th><th>仓库</th><th>状态</th></tr></thead>
            <tbody>
              <tr v-for="p in detail.parts" :key="p.id">
                <td>{{ p.part_name }}（{{ p.part_code }}）</td>
                <td>{{ p.quantity }}</td>
                <td>{{ p.warehouse_name }}</td>
                <td><StatusBadge :value="p.usage_status" /></td>
              </tr>
            </tbody>
          </table>
          <EmptyState v-else text="暂无备件领用" />
        </section>

        <section class="panel">
          <h3>处置记录 <span class="muted">（页面与审计同源）</span></h3>
          <TimelineList :events="detail?.events ?? []" />
        </section>

        <section class="panel" v-if="detail?.reviews.length">
          <h3>复核记录 <span class="muted">（迟到/越序上报，状态不倒退）</span></h3>
          <table>
            <thead><tr><th>动作</th><th>原因</th><th>原请求号</th><th>现场序号</th><th>时间</th></tr></thead>
            <tbody>
              <tr v-for="r in detail.reviews" :key="r.id">
                <td>{{ TicketActionText[r.event_type] ?? r.event_type }}</td>
                <td><span class="reason">{{ r.reason === "STATE_REGRESSION" ? "状态倒退" : "序号过期" }}</span></td>
                <td class="mono">{{ r.request_id }}</td>
                <td>{{ r.site_seq }}</td>
                <td>{{ formatDate(r.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.tickets-page { padding: 16px; }
.layout { display: grid; grid-template-columns: 320px 1fr; gap: 16px; }
.ticket-list { background: #fff; border-radius: 8px; padding: 8px; max-height: 80vh; overflow-y: auto; }
.ticket-item { padding: 12px; border-radius: 6px; cursor: pointer; border: 1px solid transparent; }
.ticket-item:hover { background: #f5f7fa; }
.ticket-item.active { background: #ecf5ff; border-color: #409eff; }
.row1 { display: flex; justify-content: space-between; align-items: center; }
.row2 { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
.seq { font-size: 12px; color: #909399; }
.ticket-detail { background: #fff; border-radius: 8px; padding: 20px; }
.detail-head { display: flex; justify-content: space-between; align-items: flex-start; }
.sub { display: flex; gap: 12px; align-items: center; margin-top: 8px; color: #606266; font-size: 13px; }
.actions { display: flex; gap: 8px; }
.btn { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 14px; }
.btn-primary { background: #409eff; color: #fff; }
.btn-primary:disabled { background: #a0cfff; cursor: not-allowed; }
.btn-denied { background: #fef0f0; color: #f56c6c; cursor: not-allowed; }
.feedback { padding: 10px 14px; border-radius: 6px; margin: 12px 0; font-size: 14px; }
.feedback.ok { background: #e1f3d8; color: #67c23a; }
.feedback.warn { background: #fdf6ec; color: #e6a23c; }
.feedback.err { background: #fef0f0; color: #f56c6c; }
.panel { margin-top: 20px; }
.panel h3 { font-size: 15px; margin-bottom: 12px; }
.muted { color: #909399; font-size: 12px; font-weight: normal; }
.flow-steps { display: flex; align-items: center; gap: 4px; }
.step { display: flex; align-items: center; gap: 6px; }
.step-dot { width: 12px; height: 12px; border-radius: 50%; background: #dcdfe6; }
.step-dot.done { background: #67c23a; }
.step-dot.current { background: #409eff; box-shadow: 0 0 0 4px rgba(64,158,255,0.2); }
.step-label { font-size: 13px; color: #606266; }
.step-line { width: 24px; height: 2px; background: #dcdfe6; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 8px; border-bottom: 1px solid #f0f2f5; }
th { color: #909399; font-weight: 500; }
.mono { font-family: monospace; font-size: 12px; }
.reason { color: #e6a23c; }
</style>
