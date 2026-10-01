import { defineStore } from "pinia";
import { Role, RoleText } from "../constants/Role";
import type { Role as RoleValue } from "../constants/Role";

const ROLE_KEY = "grid-repair.role";
const USER_KEY = "grid-repair.user-id";

const readRole = (): RoleValue => {
  const saved = localStorage.getItem(ROLE_KEY);
  return (Role as readonly string[]).includes(saved ?? "") ? (saved as RoleValue) : "dispatcher";
};

// 会话：当前操作角色。切换角色即切换 RBAC 视角，按钮显隐与后端裁决共用同一角色。
export const useSessionStore = defineStore("session", {
  state: () => ({
    role: readRole() as RoleValue,
    userId: Number(localStorage.getItem(USER_KEY) ?? 1)
  }),
  getters: {
    roleText: (state) => RoleText[state.role]
  },
  actions: {
    setRole(role: RoleValue) {
      this.role = role;
      localStorage.setItem(ROLE_KEY, role);
      localStorage.setItem(USER_KEY, String(this.userId));
    }
  }
});
