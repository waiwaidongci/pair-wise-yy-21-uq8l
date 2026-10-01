<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRepairTicketStore } from "../stores/RepairTicketStore";
import { useCrewStore } from "../stores/CrewStore";
import { useFaultReportStore } from "../stores/FaultReportStore";
import { useSparePartUsageStore } from "../stores/SparePartUsageStore";
import { TicketStatusText } from "../constants/TicketStatus";
import { isSettled } from "../constants/SparePartStatus";
import StatCard from "../components/common/StatCard.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import CrewCard from "../components/common/CrewCard.vue";
import { useCrewAvailability } from "../hooks/useCrewAvailability";

const ticketStore = useRepairTicketStore();
const crewStore = useCrewStore();
const faultStore = useFaultReportStore();
const partStore = useSparePartUsageStore();

onMounted(async () => {
  await Promise.all([ticketStore.load(), crewStore.load(), faultStore.load(), partStore.load()]);
});

const { available, busy } = useCrewAvailability(crewStore.rows);

const stats = computed(() => ({
  pending: ticketStore.rows.filter((t) => t.status === "WAIT_DISPATCH").length,
  repairing: ticketStore.rows.filter((t) => ["ASSIGNED", "ARRIVED", "REPAIRING"].includes(t.status)).length,
  restored: ticketStore.rows.filter((t) => ["RESTORED", "CLOSED"].includes(t.status)).length,
  unsettledParts: partStore.rows.filter((p) => !isSettled(p.usage_status)).length
}));

const avgRestore = computed(() => {
  const done = ticketStore.rows.filter((t) => t.restored_at && t.assigned_at);
  if (!done.length) return "—";
  const hours = done.reduce((s, t) => s + (new Date(t.restored_at!).getTime() - new Date(t.assigned_at).getTime()) / 3600000, 0) / done.length;
  return `${hours.toFixed(1)}h`;
});
</script>

<template>
  <div class="dashboard">
    <div class="stats">
      <StatCard label="待派工" :value="stats.pending" hint="等待调度派工" />
      <StatCard label="抢修中" :value="stats.repairing" hint="含已到场/处理中" />
      <StatCard label="已复电" :value="stats.restored" hint="本月累计" />
      <StatCard label="平均复电时长" :value="avgRestore" hint="派工到复电" />
    </div>

    <div class="panels">
      <section class="panel">
        <h3>备件未结算预警</h3>
        <StatCard label="未结算备件" :value="stats.unsettledParts" hint="未归还/未消耗将挡住关闭" />
      </section>

      <section class="panel">
        <h3>班组状态 <span class="muted">（值班 {{ available.length }} / 执勤 {{ busy.length }}）</span></h3>
        <div class="crew-grid">
          <CrewCard v-for="c in crewStore.rows" :key="c.id" :crew="c" />
        </div>
      </section>

      <section class="panel">
        <h3>最近工单</h3>
        <table>
          <thead><tr><th>工单</th><th>状态</th><th>现场序号</th></tr></thead>
          <tbody>
            <tr v-for="t in ticketStore.rows.slice(0, 6)" :key="t.id">
              <td>#{{ t.id }}</td>
              <td><StatusBadge :value="t.status" /></td>
              <td>{{ t.site_seq }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dashboard { padding: 16px; }
.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.panels { display: grid; grid-template-columns: 1fr 2fr; gap: 16px; }
.panel { background: #fff; border-radius: 8px; padding: 16px; }
.panel h3 { font-size: 15px; margin-bottom: 12px; }
.muted { color: #909399; font-size: 12px; font-weight: normal; }
.crew-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 8px; border-bottom: 1px solid #f0f2f5; }
th { color: #909399; font-weight: 500; }
</style>
