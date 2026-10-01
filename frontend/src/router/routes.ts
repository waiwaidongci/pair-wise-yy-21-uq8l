import { createRouter, createWebHashHistory, type RouteRecordRaw, type RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "../stores/AuthStore";

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/dashboard" },
  { path: "/dashboard", name: "抢修态势", component: () => import("../pages/DashboardPage.vue"), meta: { roles: ["DISPATCHER", "CREW_LEADER", "STOREKEEPER", "AUDITOR", "CREW_MEMBER"] } },
  { path: "/assets", name: "配网资产", component: () => import("../pages/AssetsPage.vue"), meta: { roles: ["DISPATCHER", "AUDITOR"] } },
  { path: "/faults", name: "故障报修", component: () => import("../pages/FaultsPage.vue"), meta: { roles: ["DISPATCHER", "CREW_LEADER"] } },
  { path: "/tickets", name: "抢修工单", component: () => import("../pages/TicketsPage.vue"), meta: { roles: ["DISPATCHER", "CREW_LEADER", "STOREKEEPER", "AUDITOR", "CREW_MEMBER"] } },
  { path: "/parts", name: "备件领用", component: () => import("../pages/PartsPage.vue"), meta: { roles: ["DISPATCHER", "STOREKEEPER", "AUDITOR"] } }
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes
});

// 路由守卫：无权限角色跳回态势页
router.beforeEach((to: RouteLocationNormalized) => {
  const auth = useAuthStore();
  const roles = to.meta.roles as string[] | undefined;
  if (roles && !roles.includes(auth.role)) {
    return { path: "/dashboard" };
  }
  return true;
});
