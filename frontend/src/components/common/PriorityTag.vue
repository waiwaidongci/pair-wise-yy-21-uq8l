<script setup lang="ts">
import { computed } from "vue";
import { formatRisk } from "../../utils/formatters";

const props = defineProps<{ value: string }>();
const text = computed(() => formatRisk(props.value));
const tone = computed(() => ({ LOW: "ok", MEDIUM: "info", HIGH: "warn", CRITICAL: "bad", EXTREME: "bad" }[props.value] ?? "plain"));
</script>

<template>
  <span class="badge" :data-tone="tone">{{ text }}</span>
</template>
