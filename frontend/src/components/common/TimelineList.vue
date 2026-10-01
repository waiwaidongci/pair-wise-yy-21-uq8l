<script setup lang="ts">
import { FlowActionText } from "../../constants/FlowAction";
import { RoleText } from "../../constants/Role";
import { formatDate } from "../../utils/formatters";
import StatusBadge from "./StatusBadge.vue";
import type { TicketFlowEvent } from "../../types/TicketFlowEvent";

defineProps<{ events: TicketFlowEvent[] }>();
</script>

<template>
  <ol class="timeline" v-if="events.length">
    <li v-for="event in events" :key="event.id" :data-result="event.result">
      <div class="timeline-head">
        <strong>{{ FlowActionText[event.action] }}</strong>
        <StatusBadge :value="event.result" />
        <time>{{ formatDate(event.created_at) }}</time>
      </div>
      <p class="timeline-meta">
        {{ RoleText[event.actor_role] }}#{{ event.actor_id }} · 现场序号 {{ event.scene_seq }} · 请求号 {{ event.request_id }}
      </p>
      <p class="timeline-note" v-if="event.note">{{ event.note }}</p>
      <p class="timeline-note" v-if="event.result === 'REVIEW_ONLY'">内容已保留为复核记录，工单状态未回退</p>
    </li>
  </ol>
  <p v-else class="empty">暂无处置记录</p>
</template>
