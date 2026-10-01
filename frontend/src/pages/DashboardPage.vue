<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useCrewStore } from "../stores/CrewStore";
import { useFaultReportStore } from "../stores/FaultReportStore";
import { useAuditLogStore } from "../stores/AuditLogStore";
import { formatDate } from "../utils/formatters";
import StatCard from "../components/common/StatCard.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import CrewCard from "../components/common/CrewCard.vue";

const ticketStore = useRepairTicketStore();
const crewStore = useCrewStore();
const faultStore = useFaultReportStore();
const auditStore = useAuditLogStore();

const countBy = (status: string) => ticketStore.rows.filter((row) => row.status === status).length;

// 平均复电时长：已复电工单的 assigned_at -> restored_at。
const avgRestoreMinutes = computed(() => {
  const durations = ticketStore.rows
    .filter((row) => row.assigned_at && row.restored_at)
    .map((row) => (new Date(row.restored_at!).getTime() - new Date(row.assigned_at!).getTime()) / 60000);
  if (!durations.length) return "—";
  return `${Math.round(durations.reduce((sum, v) => sum + v, 0) / durations.length)} 分钟`;
});

const latestAudit = computed(() => [...auditStore.rows].slice(-8).reverse());

onMounted(async () => {
  await Promise.all([ticketStore.load(), crewStore.load(), faultStore.load(), auditStore.load()]);
});
</script>

<template>
  <section class="dashboard">
    <div class="metrics">
      <StatCard label="待派工" :value="countBy('WAIT_DISPATCH')" />
      <StatCard label="处理中" :value="countBy('ARRIVED') + countBy('REPAIRING')" />
      <StatCard label="已复电" :value="countBy('RESTORED')" />
      <StatCard label="平均复电时长" :value="avgRestoreMinutes" />
    </div>
    <div class="workbench">
      <div class="panel wide">
        <h2>抢修工单</h2>
        <article class="row" v-for="row in ticketStore.rows" :key="row.id">
          <strong>#{{ row.id }} · 报修#{{ row.fault_report_id }}</strong>
          <span>{{ formatDate(row.updated_at) }}</span>
          <StatusBadge :value="row.status" />
        </article>
      </div>
      <div class="panel">
        <h2>班组状态</h2>
        <CrewCard v-for="crew in crewStore.rows" :key="crew.id" :crew="crew" />
      </div>
    </div>
    <div class="panel wide">
      <h2>审计动态（与页面操作同源）</h2>
      <table class="table">
        <thead><tr><th>时间</th><th>操作者</th><th>动作</th><th>对象</th><th>结果</th></tr></thead>
        <tbody>
          <tr v-for="row in latestAudit" :key="row.id">
            <td>{{ formatDate(row.created_at) }}</td>
            <td>{{ row.actor }}</td>
            <td>{{ row.action }}</td>
            <td>{{ row.target_type }}#{{ row.target_id }}</td>
            <td><StatusBadge :value="row.result" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
