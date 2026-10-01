<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useGridAssetStore } from "../stores/GridAssetStore";
import { AssetHealthStatusText } from "../constants/AssetHealthStatus";
import AssetTree from "../components/common/AssetTree.vue";
import StatusBadge from "../components/common/StatusBadge.vue";
import EmptyState from "../components/common/EmptyState.vue";

const assetStore = useGridAssetStore();
const feederFilter = ref<string>("");
const healthFilter = ref<string>("");

onMounted(() => assetStore.load());

const feeders = computed(() => Array.from(new Set(assetStore.rows.map((a) => a.feeder_line))));
const filtered = computed(() =>
  assetStore.rows.filter((a) => {
    if (feederFilter.value && a.feeder_line !== feederFilter.value) return false;
    if (healthFilter.value && a.health_status !== healthFilter.value) return false;
    return true;
  })
);
</script>

<template>
  <div class="assets-page">
    <div class="filters panel">
      <label>线路
        <select v-model="feederFilter">
          <option value="">全部</option>
          <option v-for="f in feeders" :key="f" :value="f">{{ f }}</option>
        </select>
      </label>
      <label>健康状态
        <select v-model="healthFilter">
          <option value="">全部</option>
          <option v-for="(label, key) in AssetHealthStatusText" :key="key" :value="key">{{ label }}</option>
        </select>
      </label>
    </div>

    <div class="panel">
      <h3>资产树</h3>
      <AssetTree v-if="filtered.length" :assets="filtered" />
      <EmptyState v-else text="暂无匹配资产" />
    </div>

    <div class="panel">
      <h3>资产列表</h3>
      <table v-if="filtered.length">
        <thead><tr><th>资产编号</th><th>类型</th><th>线路</th><th>电压</th><th>位置</th><th>健康状态</th></tr></thead>
        <tbody>
          <tr v-for="a in filtered" :key="a.id">
            <td class="mono">{{ a.asset_code }}</td>
            <td>{{ a.asset_type }}</td>
            <td>{{ a.feeder_line }}</td>
            <td>{{ a.voltage_level }}</td>
            <td>{{ a.location_desc }}</td>
            <td><StatusBadge :value="a.health_status" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.assets-page { padding: 16px; }
.filters { display: flex; gap: 16px; align-items: center; background: #fff; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; }
.filters label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #606266; }
.filters select { padding: 4px 8px; border: 1px solid #dcdfe6; border-radius: 4px; }
.panel { background: #fff; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.panel h3 { font-size: 15px; margin-bottom: 12px; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 8px; border-bottom: 1px solid #f0f2f5; }
th { color: #909399; font-weight: 500; }
.mono { font-family: monospace; }
</style>
