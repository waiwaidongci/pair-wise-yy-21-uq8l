<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useSparePartUsageStore } from "../stores/SparePartUsageStore";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useAuthStore } from "../stores/AuthStore";
import { SparePartStatusText, PartActionText, isSettled } from "../constants/SparePartStatus";
import { roleCan } from "../types/Role";
import { errorMessage } from "../constants/errorMessages";
import StatusBadge from "../components/common/StatusBadge.vue";
import StatCard from "../components/common/StatCard.vue";
import EmptyState from "../components/common/EmptyState.vue";
import { formatDate } from "../utils/formatters";

const partStore = useSparePartUsageStore();
const ticketStore = useRepairTicketStore();
const auth = useAuthStore();

const feedback = ref<{ type: "ok" | "err"; text: string } | null>(null);
const showApply = ref(false);
const applyForm = ref({ ticketId: 0, partCode: "", partName: "", quantity: 1, warehouseName: "" });

onMounted(async () => {
  await Promise.all([partStore.load(), ticketStore.load()]);
});

const stats = computed(() => ({
  total: partStore.rows.length,
  pending: partStore.rows.filter((p) => p.usage_status === "PENDING").length,
  taken: partStore.rows.filter((p) => p.usage_status === "TAKEN").length,
  settled: partStore.rows.filter((p) => isSettled(p.usage_status)).length
}));

async function doSettle(id: number, action: "approve" | "take" | "return" | "consume") {
  feedback.value = null;
  try {
    await partStore.settle(id, action);
    feedback.value = { type: "ok", text: `${PartActionText[action]}成功` };
  } catch (err) {
    feedback.value = { type: "err", text: errorMessage((err as { code?: string }).code ?? "") };
  }
}

async function doApply() {
  feedback.value = null;
  try {
    await partStore.apply({ ...applyForm.value, operatorId: auth.operatorId });
    feedback.value = { type: "ok", text: "备件申请已提交" };
    showApply.value = false;
    applyForm.value = { ticketId: 0, partCode: "", partName: "", quantity: 1, warehouseName: "" };
  } catch (err) {
    feedback.value = { type: "err", text: errorMessage((err as { code?: string }).code ?? "") };
  }
}

function can(action: string) {
  return roleCan(auth.role, `part.${action}`);
}
</script>

<template>
  <div class="parts-page">
    <div class="stats">
      <StatCard label="备件领用总数" :value="stats.total" />
      <StatCard label="待审批" :value="stats.pending" />
      <StatCard label="未归还" :value="stats.taken" />
      <StatCard label="已结算" :value="stats.settled" />
    </div>

    <div class="toolbar">
      <button v-if="can('apply')" class="btn btn-primary" @click="showApply = !showApply">+ 申请备件</button>
    </div>

    <transition name="fade">
      <div v-if="feedback" class="feedback" :class="feedback.type">{{ feedback.text }}</div>
    </transition>

    <div v-if="showApply" class="apply-form panel">
      <h3>申请备件</h3>
      <div class="form-row">
        <label>工单</label>
        <select v-model.number="applyForm.ticketId">
          <option v-for="t in ticketStore.rows" :key="t.id" :value="t.id">#{{ t.id }}（{{ t.status }}）</option>
        </select>
      </div>
      <div class="form-row">
        <label>备件编号</label>
        <input v-model="applyForm.partCode" placeholder="如 PART-001" />
      </div>
      <div class="form-row">
        <label>备件名称</label>
        <input v-model="applyForm.partName" placeholder="如 交流接触器" />
      </div>
      <div class="form-row">
        <label>数量</label>
        <input v-model.number="applyForm.quantity" type="number" min="1" />
      </div>
      <div class="form-row">
        <label>仓库</label>
        <input v-model="applyForm.warehouseName" placeholder="如 一号库" />
      </div>
      <button class="btn btn-primary" @click="doApply">提交申请</button>
    </div>

    <div class="panel">
      <h3>领用记录</h3>
      <table v-if="partStore.rows.length">
        <thead>
          <tr><th>编号</th><th>名称</th><th>工单</th><th>数量</th><th>仓库</th><th>状态</th><th>申请时间</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="p in partStore.rows" :key="p.id">
            <td class="mono">{{ p.part_code }}</td>
            <td>{{ p.part_name }}</td>
            <td>#{{ p.ticket_id }}</td>
            <td>{{ p.quantity }}</td>
            <td>{{ p.warehouse_name }}</td>
            <td><StatusBadge :value="p.usage_status" /></td>
            <td>{{ formatDate(p.applied_at) }}</td>
            <td class="ops">
              <button v-if="p.usage_status === 'PENDING' && can('approve')" class="btn btn-sm" @click="doSettle(p.id, 'approve')">审批</button>
              <button v-if="p.usage_status === 'APPROVED' && can('take')" class="btn btn-sm" @click="doSettle(p.id, 'take')">领用</button>
              <button v-if="p.usage_status === 'TAKEN' && can('return')" class="btn btn-sm" @click="doSettle(p.id, 'return')">归还</button>
              <button v-if="p.usage_status === 'TAKEN' && can('consume')" class="btn btn-sm btn-warn" @click="doSettle(p.id, 'consume')">消耗</button>
            </td>
          </tr>
        </tbody>
      </table>
      <EmptyState v-else text="暂无领用记录" />
    </div>
  </div>
</template>

<style scoped>
.parts-page { padding: 16px; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.toolbar { margin-bottom: 12px; }
.btn { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-size: 14px; }
.btn-primary { background: #409eff; color: #fff; }
.btn-sm { padding: 4px 10px; font-size: 12px; background: #ecf5ff; color: #409eff; border: 1px solid #d9ecff; border-radius: 4px; cursor: pointer; margin-right: 4px; }
.btn-warn { background: #fdf6ec; color: #e6a23c; border-color: #faecd8; }
.feedback { padding: 10px 14px; border-radius: 6px; margin-bottom: 12px; font-size: 14px; }
.feedback.ok { background: #e1f3d8; color: #67c23a; }
.feedback.err { background: #fef0f0; color: #f56c6c; }
.panel { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.panel h3 { font-size: 15px; margin-bottom: 12px; }
.apply-form { max-width: 520px; }
.form-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.form-row label { width: 70px; font-size: 13px; color: #606266; }
.form-row input, .form-row select { flex: 1; padding: 6px 10px; border: 1px solid #dcdfe6; border-radius: 4px; font-size: 14px; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 8px; border-bottom: 1px solid #f0f2f5; }
th { color: #909399; font-weight: 500; }
.mono { font-family: monospace; }
.ops { white-space: nowrap; }
</style>
