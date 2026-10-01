import { defineStore } from "pinia";
import { request } from "../api/request";
import type { Role } from "../types/Role";
import { RoleText } from "../types/Role";

interface AuthState {
  role: Role;
  operatorId: number;
  operatorName: string;
  token: string;
}

const ROLE_ORDER: Role[] = ["DISPATCHER", "CREW_LEADER", "STOREKEEPER", "AUDITOR", "CREW_MEMBER"];

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    role: "DISPATCHER",
    operatorId: 1,
    operatorName: "调度员",
    token: ""
  }),
  getters: {
    roleLabel: (s) => RoleText[s.role],
    roleOptions: () => ROLE_ORDER.map((r) => ({ value: r, label: RoleText[r] }))
  },
  actions: {
    // 切换角色（演示用：重新签发 dev token）
    async switchRole(role: Role) {
      this.role = role;
      this.operatorName = RoleText[role];
      try {
        const res = await request<{ token: string }>("/api/auth/dev-login", {
          method: "POST",
          body: JSON.stringify({ role, id: this.operatorId, name: RoleText[role] })
        });
        this.token = res.token;
      } catch {
        // 离线时仅切换本地角色
      }
    }
  }
});
