<script setup lang="ts">
import { onMounted } from "vue";
import { useFaultReportStore } from "../stores/FaultReportStore";
import { useGridAssetStore } from "../stores/GridAssetStore";
import { FaultTypeText, type FaultType } from "../constants/FaultType";
import { formatRisk } from "../utils/formatters";
import StatusBadge from "../components/common/StatusBadge.vue";
import PriorityTag from "../components/common/PriorityTag.vue";

const faultStore = useFaultReportStore();
const assetStore = useGridAssetStore();

const assetCode = (id: number) => assetStore.rows.find((asset) => asset.id === id)?.asset_code ?? `#${id}`;

onMounted(async () => {
  await Promise.all([faultStore.load(), assetStore.load()]);
});
</script>

<template>
  <section class="panel wide">
    <h2>故障报修</h2>
    <table class="table">
      <thead>
        <tr><th>编号</th><th>报修人</th><th>资产</th><th>故障类型</th><th>地址</th><th>严重度</th><th>渠道</th><th>状态</th></tr>
      </thead>
      <tbody>
        <tr v-for="row in faultStore.rows" :key="row.id">
          <td>#{{ row.id }}</td>
          <td>{{ row.reporter_name }}（{{ row.phone }}）</td>
          <td>{{ assetCode(row.asset_id) }}</td>
          <td>{{ FaultTypeText[row.fault_type as FaultType] ?? row.fault_type }}</td>
          <td>{{ row.address_desc }}</td>
          <td><PriorityTag :value="row.severity" /></td>
          <td>{{ row.report_channel }}</td>
          <td><StatusBadge :value="row.status" /></td>
        </tr>
      </tbody>
    </table>
    <p class="hint">报修状态随工单处置链联动：派工、到场、处理、复电、关闭后此处同步反映。</p>
    <p class="muted">严重度图例：{{ formatRisk("LOW") }} / {{ formatRisk("MEDIUM") }} / {{ formatRisk("HIGH") }}</p>
  </section>
</template>
