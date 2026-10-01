<script setup lang="ts">
import type { TicketEvent } from "../../types/RepairTicket";
import { TicketActionText } from "../../constants/TicketStatus";
import { formatDate } from "../../utils/formatters";

defineProps<{ events: TicketEvent[] }>();
</script>

<template>
  <div class="timeline">
    <div v-for="e in events" :key="e.id" class="timeline-item">
      <div class="dot"></div>
      <div class="content">
        <div class="head">
          <strong>{{ TicketActionText[e.event_type] ?? e.event_type }}</strong>
          <span class="seq">现场序号 {{ e.site_seq }}</span>
        </div>
        <div class="meta">{{ e.from_status }} → {{ e.to_status }} · {{ e.operator_role }} · {{ formatDate(e.created_at) }}</div>
        <div v-if="e.note" class="note">{{ e.note }}</div>
      </div>
    </div>
    <div v-if="!events.length" class="empty">暂无处置记录</div>
  </div>
</template>

<style scoped>
.timeline { padding: 4px 0; }
.timeline-item { display: flex; gap: 12px; padding: 8px 0; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: #409eff; margin-top: 6px; flex-shrink: 0; }
.head { display: flex; justify-content: space-between; align-items: center; }
.seq { font-size: 12px; color: #909399; }
.meta { font-size: 12px; color: #909399; margin-top: 2px; }
.note { font-size: 13px; color: #606266; margin-top: 4px; }
.empty { color: #c0c4cc; font-size: 13px; padding: 12px 0; }
</style>
