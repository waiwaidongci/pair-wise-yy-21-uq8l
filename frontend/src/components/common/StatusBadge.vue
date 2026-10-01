<script setup lang="ts">
import { computed } from "vue";
import { TicketStatusText, type TicketStatus } from "../../constants/TicketStatus";
import { SparePartUsageStatusText, type SparePartUsageStatus } from "../../constants/SparePartUsageStatus";
import { FlowEventResultText, type FlowEventResult } from "../../constants/FlowEventResult";

const props = defineProps<{ value: string }>();

// 三组枚举共用同一徽章：工单状态 / 备件状态 / 处置链事件结果。
const text = computed(() =>
  TicketStatusText[props.value as TicketStatus]
  ?? SparePartUsageStatusText[props.value as SparePartUsageStatus]
  ?? FlowEventResultText[props.value as FlowEventResult]
  ?? props.value.replace(/_/g, " ")
);

const tone = computed(() => {
  switch (props.value) {
    case "RESTORED":
    case "CONSUMED":
    case "RETURNED":
    case "APPLIED":
      return "ok";
    case "CLOSED":
      return "done";
    case "REVIEW_ONLY":
    case "REQUESTED":
    case "WAIT_DISPATCH":
      return "warn";
    case "REJECTED":
      return "bad";
    case "DUPLICATE":
    case "ISSUED":
      return "info";
    default:
      return "plain";
  }
});
</script>

<template>
  <span class="badge" :data-tone="tone">{{ text }}</span>
</template>
