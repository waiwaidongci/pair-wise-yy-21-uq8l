<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter, type RouteRecordNormalized } from "vue-router";
import { useAuthStore } from "./stores/AuthStore";
import { RoleText, type Role } from "./types/Role";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const routes = computed<RouteRecordNormalized[]>(() => router.getRoutes().filter((r) => r.name && r.path !== "/"));
const current = computed(() => route.name);

function go(path: string) {
  router.push(path);
}

async function switchRole(role: Role) {
  await auth.switchRole(role);
  // 切换角色后重新校验当前路由权限
  const roles = route.meta.roles as string[] | undefined;
  if (roles && !roles.includes(auth.role)) {
    router.push("/dashboard");
  }
}

function onRoleChange(e: Event) {
  switchRole((e.target as HTMLSelectElement).value as Role);
}
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="logo">⚡</div>
        <div class="title">
          <strong>配网抢修</strong>
          <span>grid-repair</span>
        </div>
      </div>
      <nav class="nav">
        <button
          v-for="r in routes"
          :key="r.path"
          class="nav-item"
          :class="{ active: current === r.name }"
          @click="go(r.path)"
        >
          {{ r.name }}
        </button>
      </nav>
      <div class="role-switcher">
        <div class="label">当前角色</div>
        <select :value="auth.role" @change="onRoleChange">
          <option v-for="opt in auth.roleOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
    </aside>
    <main class="main">
      <header class="topbar">
        <h1>{{ current }}</h1>
        <div class="user">
          <span class="role-badge">{{ RoleText[auth.role] }}</span>
          <span class="name">{{ auth.operatorName }}</span>
        </div>
      </header>
      <div class="content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
.shell { display: flex; min-height: 100vh; }
.sidebar { width: 220px; background: #001529; color: #fff; display: flex; flex-direction: column; padding: 16px 0; }
.brand { display: flex; align-items: center; gap: 10px; padding: 0 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
.logo { font-size: 28px; }
.title { display: flex; flex-direction: column; }
.title strong { font-size: 16px; }
.title span { font-size: 11px; color: #8c8c8c; }
.nav { flex: 1; padding: 12px 8px; }
.nav-item { display: block; width: 100%; text-align: left; padding: 10px 16px; background: none; border: none; color: #d9d9d9; font-size: 14px; border-radius: 6px; cursor: pointer; margin-bottom: 4px; }
.nav-item:hover { background: rgba(255,255,255,0.08); }
.nav-item.active { background: #409eff; color: #fff; }
.role-switcher { padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.1); }
.role-switcher .label { font-size: 11px; color: #8c8c8c; margin-bottom: 6px; }
.role-switcher select { width: 100%; padding: 6px; border-radius: 4px; border: none; background: rgba(255,255,255,0.1); color: #fff; }
.main { flex: 1; background: #f0f2f5; display: flex; flex-direction: column; }
.topbar { display: flex; justify-content: space-between; align-items: center; padding: 16px 24px; background: #fff; border-bottom: 1px solid #e8e8e8; }
.topbar h1 { font-size: 20px; margin: 0; }
.user { display: flex; align-items: center; gap: 10px; }
.role-badge { background: #ecf5ff; color: #409eff; padding: 4px 10px; border-radius: 10px; font-size: 12px; }
.name { font-size: 14px; color: #606266; }
.content { flex: 1; overflow-y: auto; }
</style>
