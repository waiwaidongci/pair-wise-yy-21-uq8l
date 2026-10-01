<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ value: string }>();

const text = computed(() => {
  const map: Record<string, string> = { HIGH: "高", MEDIUM: "中", LOW: "低", CRITICAL: "紧急" };
  return map[props.value] ?? props.value;
});
const cls = computed(() => ({
  HIGH: "tag--high",
  CRITICAL: "tag--critical",
  MEDIUM: "tag--medium",
  LOW: "tag--low"
}[props.value] ?? "tag--low"));
</script>

<template>
  <span class="tag" :class="cls">{{ text }}</span>
</template>

<style scoped>
.tag { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 12px; }
.tag--high { background: #fef0f0; color: #f56c6c; }
.tag--critical { background: #f56c6c; color: #fff; }
.tag--medium { background: #fdf6ec; color: #e6a23c; }
.tag--low { background: #ecf5ff; color: #409eff; }
</style>
