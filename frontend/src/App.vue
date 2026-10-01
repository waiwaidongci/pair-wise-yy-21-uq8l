<script setup lang="ts">
import { computed, ref } from "vue";
import { routes } from "./router/routes";
import { useSessionStore } from "./stores/SessionStore";
import { Role, RoleText } from "./constants/Role";
import DashboardPage from "./pages/DashboardPage.vue";
import AssetsPage from "./pages/AssetsPage.vue";
import FaultsPage from "./pages/FaultsPage.vue";
import TicketsPage from "./pages/TicketsPage.vue";
import PartsPage from "./pages/PartsPage.vue";

const session = useSessionStore();
const active = ref<string>(routes[0]?.route ?? "/dashboard");
const current = computed(() => routes.find((route) => route.route === active.value) ?? routes[0]);

const pages: Record<string, unknown> = {
  "/dashboard": DashboardPage,
  "/assets": AssetsPage,
  "/faults": FaultsPage,
  "/tickets": TicketsPage,
  "/parts": PartsPage
};
const currentPage = computed(() => pages[active.value] ?? DashboardPage);
</script>

<template>
  <div class="shell">
    <aside>
      <div class="brand">电力配网抢修工单系统</div>
      <nav>
        <button v-for="route in routes" :key="route.route" :class="{ active: active === route.route }" @click="active = route.route">{{ route.name }}</button>
      </nav>
      <div class="role-box">
        <p class="eyebrow">当前角色</p>
        <select :value="session.role" @change="session.setRole(($event.target as HTMLSelectElement).value as typeof session.role)">
          <option v-for="role in Role" :key="role" :value="role">{{ RoleText[role] }}</option>
        </select>
        <p class="muted">按钮显隐与后端 RBAC 裁决使用同一角色</p>
      </div>
    </aside>
    <main class="page">
      <section class="page-head">
        <div><p class="eyebrow">grid-repair</p><h1>{{ current?.name }}</h1></div>
        <span class="badge" data-tone="info">{{ session.roleText }}</span>
      </section>
      <component :is="currentPage" :key="active" />
    </main>
  </div>
</template>
