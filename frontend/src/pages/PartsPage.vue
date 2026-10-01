<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useSparePartUsageStore } from "../stores/SparePartUsageStore";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useSessionStore } from "../stores/SessionStore";
import { applySparePart, transitSparePart } from "../api/SparePartUsage";
import { ApiError } from "../api/client";
import { createSparePartUsageForm } from "../constructors/SparePartUsageConstructor";
import { formatDate } from "../utils/formatters";
import StatusBadge from "../components/common/StatusBadge.vue";
import EmptyState from "../components/common/EmptyState.vue";

const partStore = useSparePartUsageStore();
const ticketStore = useRepairTicketStore();
const session = useSessionStore();

const pageError = ref<string | null>(null);
const dedupHint = ref<string | null>(null);
const reconcileTicketId = ref<number | null>(null);

const form = ref(createSparePartUsageForm({ ticket_id: 1, part_code: "", part_name: "", quantity: 1, warehouse_name: "" }));

const newRequestId = () => `req-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const reconcile = computed(() => (reconcileTicketId.value ? partStore.reconcile[reconcileTicketId.value] ?? null : null));

// 申请/审批/消耗/归还都带请求号：重复重试沿用第一次结果，同一工单不会重复消耗备件。
const run = async (fn: () => Promise<{ deduplicated: boolean }>) => {
  pageError.value = null;
  dedupHint.value = null;
  try {
    const { deduplicated } = await fn();
    if (deduplicated) dedupHint.value = "重复请求已去重，沿用第一次结果";
    await partStore.load();
    if (reconcileTicketId.value) await partStore.loadReconcile(reconcileTicketId.value);
  } catch (err) {
    pageError.value = err instanceof ApiError ? err.localizedMessage : "请求失败，请稍后再试";
  }
};

const apply = () => run(() => applySparePart({ ...form.value, request_id: newRequestId() }));
const transit = (id: number, action: "approve" | "consume" | "return") =>
  run(() => transitSparePart(id, action, newRequestId()));

const showReconcile = async (ticketId: number) => {
  reconcileTicketId.value = ticketId;
  await partStore.loadReconcile(ticketId);
};

onMounted(async () => {
  await Promise.all([partStore.load(), ticketStore.load()]);
});
</script>

<template>
  <section class="parts">
    <div class="panel wide">
      <h2>备件领用</h2>
      <p class="hint">申请由班组长/调度员发起，审批出库、消耗、归还由仓管办理；所有操作按请求号幂等。</p>
      <table class="table">
        <thead>
          <tr><th>编号</th><th>工单</th><th>备件</th><th>数量</th><th>仓库</th><th>状态</th><th>审批人</th><th>操作</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in partStore.rows" :key="row.id">
            <td>#{{ row.id }}</td>
            <td><a @click="showReconcile(row.ticket_id)">#{{ row.ticket_id }}</a></td>
            <td>{{ row.part_name }}（{{ row.part_code }}）</td>
            <td>{{ row.quantity }}</td>
            <td>{{ row.warehouse_name }}</td>
            <td><StatusBadge :value="row.usage_status" /></td>
            <td>{{ row.approved_by ?? "—" }}</td>
            <td>
              <button v-if="row.usage_status === 'REQUESTED'" :disabled="session.role !== 'warehouse' && session.role !== 'dispatcher'" @click="transit(row.id, 'approve')">审批出库</button>
              <template v-if="row.usage_status === 'ISSUED'">
                <button :disabled="session.role !== 'warehouse' && session.role !== 'dispatcher'" @click="transit(row.id, 'consume')">登记消耗</button>
                <button :disabled="session.role !== 'warehouse' && session.role !== 'dispatcher'" @click="transit(row.id, 'return')">归还入库</button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="pageError" class="error">{{ pageError }}</p>
      <p v-if="dedupHint" class="queued">{{ dedupHint }}</p>
    </div>

    <div class="panel">
      <h2>申请备件</h2>
      <label>工单
        <select v-model.number="form.ticket_id">
          <option v-for="ticket in ticketStore.rows" :key="ticket.id" :value="ticket.id">#{{ ticket.id }}</option>
        </select>
      </label>
      <label>备件编码<input v-model="form.part_code" placeholder="如 TR-10KV-200" /></label>
      <label>备件名称<input v-model="form.part_name" placeholder="如 10kV 配电变压器" /></label>
      <label>数量<input v-model.number="form.quantity" type="number" min="1" /></label>
      <label>仓库<input v-model="form.warehouse_name" placeholder="如 城东中心库" /></label>
      <button class="primary" :disabled="session.role !== 'crew_leader' && session.role !== 'dispatcher'" @click="apply">提交申请</button>
    </div>

    <div class="panel" v-if="reconcile">
      <h2>工单#{{ reconcile.ticket_id }} 备件对账</h2>
      <p v-if="reconcile.settled" class="ok-text">已全部对账（消耗/归还），工单可关闭。</p>
      <template v-else>
        <p class="error">存在未办结备件，工单关闭将被拦截：</p>
        <ul class="reasons">
          <li v-for="reason in reconcile.pending" :key="reason.usage_id">
            {{ reason.part_name }}（{{ reason.part_code }}）x{{ reason.quantity }}：{{ reason.reason }}
          </li>
        </ul>
      </template>
      <p class="muted">最近更新：{{ formatDate(new Date().toISOString()) }}</p>
    </div>
    <div class="panel" v-else>
      <h2>备件对账</h2>
      <EmptyState />
    </div>
  </section>
</template>
