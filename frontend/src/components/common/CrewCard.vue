<script setup lang="ts">
import type { Crew } from "../../types/Crew";

defineProps<{ crew: Crew }>();
</script>

<template>
  <article class="crew-card">
    <header>
      <strong>{{ crew.name }}</strong>
      <span class="badge" :data-tone="crew.duty_status === 'ON_DUTY' ? 'info' : 'plain'">
        {{ crew.duty_status === "ON_DUTY" ? "在岗" : "待命" }}
      </span>
    </header>
    <p>技能：{{ crew.skill_tags }}</p>
    <p>电话：{{ crew.contact_phone }}</p>
    <p v-if="crew.current_ticket_id">当前工单：#{{ crew.current_ticket_id }}</p>
  </article>
</template>
