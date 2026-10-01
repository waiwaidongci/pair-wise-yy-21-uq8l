<script setup lang="ts">
import { computed, ref } from "vue";
import type { GridAsset } from "../../types/GridAsset";
import StatusBadge from "./StatusBadge.vue";

const props = defineProps<{ assets: GridAsset[] }>();
const expanded = ref<Set<number>>(new Set());

const byFeeder = computed(() => {
  const map = new Map<string, GridAsset[]>();
  for (const a of props.assets) {
    const key = a.feeder_line || "未分组";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }
  return Array.from(map.entries());
});

function toggle(id: number) {
  if (expanded.value.has(id)) expanded.value.delete(id);
  else expanded.value.add(id);
}
</script>

<template>
  <div class="asset-tree">
    <div v-for="[feeder, list] in byFeeder" :key="feeder" class="feeder">
      <div class="feeder-head" @click="toggle(list[0]?.id ?? 0)">
        <span class="arrow">{{ expanded.has(list[0]?.id ?? 0) ? "▾" : "▸" }}</span>
        <strong>{{ feeder }}</strong>
        <span class="count">{{ list.length }} 台</span>
      </div>
      <div v-if="expanded.has(list[0]?.id ?? 0)" class="asset-list">
        <div v-for="a in list" :key="a.id" class="asset-item">
          <span class="code">{{ a.asset_code }}</span>
          <span class="desc">{{ a.location_desc }}</span>
          <StatusBadge :value="a.health_status" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feeder { border: 1px solid #ebeef5; border-radius: 8px; margin-bottom: 8px; overflow: hidden; }
.feeder-head { display: flex; align-items: center; gap: 8px; padding: 10px 12px; background: #fafafa; cursor: pointer; }
.arrow { color: #909399; }
.count { margin-left: auto; font-size: 12px; color: #909399; }
.asset-list { padding: 4px 0; }
.asset-item { display: flex; align-items: center; gap: 12px; padding: 8px 12px; border-top: 1px solid #f5f7fa; }
.code { font-family: monospace; color: #409eff; }
.desc { flex: 1; font-size: 13px; color: #606266; }
</style>
