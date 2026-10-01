<script setup lang="ts">
import type { Crew } from "../../types/Crew";
import { formatPhone } from "../../utils/formatters";

defineProps<{ crew: Crew; active?: boolean }>();
</script>

<template>
  <div class="crew-card" :class="{ active }">
    <div class="avatar">{{ crew.name.slice(0, 1) }}</div>
    <div class="info">
      <strong>{{ crew.name }}</strong>
      <div class="tags">
        <span v-for="t in crew.skill_tags.split(',')" :key="t" class="tag">{{ t }}</span>
      </div>
      <div class="phone">{{ formatPhone(crew.contact_phone) }}</div>
    </div>
    <div class="status">
      <span class="dot" :class="crew.duty_status"></span>
      {{ crew.duty_status === "ON_DUTY" ? "值班中" : "休息" }}
    </div>
  </div>
</template>

<style scoped>
.crew-card { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #ebeef5; border-radius: 8px; background: #fff; }
.crew-card.active { border-color: #409eff; background: #ecf5ff; }
.avatar { width: 40px; height: 40px; border-radius: 50%; background: #409eff; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 600; }
.info { flex: 1; }
.tags { display: flex; gap: 4px; margin-top: 4px; }
.tag { font-size: 11px; padding: 1px 6px; background: #f0f2f5; border-radius: 4px; color: #606266; }
.phone { font-size: 12px; color: #909399; margin-top: 4px; }
.status { font-size: 12px; color: #606266; display: flex; align-items: center; gap: 4px; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #c0c4cc; }
.dot.ON_DUTY { background: #67c23a; }
</style>
