<script setup lang="ts">
defineProps<{ text?: string }>();
</script>

<template>
  <div class="empty-state">
    <div class="icon">📭</div>
    <p>{{ text ?? "暂无数据" }}</p>
  </div>
</template>

<style scoped>
.empty-state { text-align: center; padding: 40px 20px; color: #c0c4cc; }
.icon { font-size: 40px; margin-bottom: 8px; }
p { font-size: 14px; }
</style>
