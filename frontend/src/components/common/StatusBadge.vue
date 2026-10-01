<script setup lang="ts">
import { computed } from "vue";
import { TicketStatusText, type TicketStatus } from "../../constants/TicketStatus";
import { SparePartStatusText, type SparePartStatus } from "../../constants/SparePartStatus";
import { FaultTypeText, type FaultType } from "../../constants/FaultType";
import { AssetHealthStatusText, type AssetHealthStatus } from "../../constants/AssetHealthStatus";

const props = defineProps<{ value: string }>();

const text = computed(() => {
  if (props.value in TicketStatusText) return TicketStatusText[props.value as TicketStatus];
  if (props.value in SparePartStatusText) return SparePartStatusText[props.value as SparePartStatus];
  if (props.value in FaultTypeText) return FaultTypeText[props.value as FaultType];
  if (props.value in AssetHealthStatusText) return AssetHealthStatusText[props.value as AssetHealthStatus];
  return props.value.replace(/_/g, " ");
});

const cls = computed(() => {
  const v = props.value;
  if (["RESTORED", "RETURNED", "CONSUMED", "NORMAL", "CLOSED"].includes(v)) return "badge badge--ok";
  if (["WAIT_DISPATCH", "PENDING", "WATCH"].includes(v)) return "badge badge--warn";
  if (["ASSIGNED", "APPROVED", "TAKEN", "ARRIVED", "REPAIRING", "DEGRADED"].includes(v)) return "badge badge--progress";
  if (["DANGEROUS", "EQUIPMENT_DAMAGE", "SAFETY_RISK"].includes(v)) return "badge badge--danger";
  return "badge";
});
</script>

<template>
  <span :class="cls">{{ text }}</span>
</template>

<style scoped>
.badge { display: inline-block; padding: 2px 10px; border-radius: 10px; font-size: 12px; background: #f0f2f5; color: #606266; }
.badge--ok { background: #e1f3d8; color: #67c23a; }
.badge--warn { background: #fdf6ec; color: #e6a23c; }
.badge--progress { background: #ecf5ff; color: #409eff; }
.badge--danger { background: #fef0f0; color: #f56c6c; }
</style>
