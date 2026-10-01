<script setup lang="ts">
defineProps<{ label: string; value: string | number; hint?: string }>();
</script>

<template>
  <div class="stat-card">
    <span class="label">{{ label }}</span>
    <strong class="value">{{ value }}</strong>
    <span v-if="hint" class="hint">{{ hint }}</span>
  </div>
</template>

<style scoped>
.stat-card { background: #fff; border-radius: 8px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 4px; }
.label { font-size: 13px; color: #909399; }
.value { font-size: 28px; font-weight: 600; color: #303133; }
.hint { font-size: 12px; color: #c0c4cc; }
</style>
