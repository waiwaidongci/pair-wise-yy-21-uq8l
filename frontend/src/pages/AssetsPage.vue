<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useGridAssetStore } from "../stores/GridAssetStore";
import { AssetHealthStatusText, type AssetHealthStatus } from "../constants/AssetHealthStatus";
import StatusBadge from "../components/common/StatusBadge.vue";

const assetStore = useGridAssetStore();
const feeder = ref<string>("");

const feeders = computed(() => [...new Set(assetStore.rows.map((row) => row.feeder_line))]);
const filtered = computed(() => (feeder.value ? assetStore.rows.filter((row) => row.feeder_line === feeder.value) : assetStore.rows));

onMounted(() => assetStore.load());
</script>

<template>
  <section class="panel wide">
    <h2>配网资产</h2>
    <div class="note-bar">
      <select v-model="feeder">
        <option value="">全部线路</option>
        <option v-for="line in feeders" :key="line" :value="line">{{ line }}</option>
      </select>
    </div>
    <table class="table">
      <thead>
        <tr><th>资产编码</th><th>类型</th><th>线路</th><th>电压等级</th><th>位置</th><th>健康状态</th></tr>
      </thead>
      <tbody>
        <tr v-for="row in filtered" :key="row.id">
          <td>{{ row.asset_code }}</td>
          <td>{{ row.asset_type }}</td>
          <td>{{ row.feeder_line }}</td>
          <td>{{ row.voltage_level }}</td>
          <td>{{ row.location_desc }}</td>
          <td><StatusBadge :value="row.health_status" /> <span class="muted">{{ AssetHealthStatusText[row.health_status as AssetHealthStatus] ?? "" }}</span></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
