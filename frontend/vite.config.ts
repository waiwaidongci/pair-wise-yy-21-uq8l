import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 20104,
    host: "0.0.0.0",
    // 本地开发时将 /api 代理到后端；生产环境由 nginx 反代。
    proxy: { "/api": { target: "http://localhost:21104", changeOrigin: true } }
  }
});
