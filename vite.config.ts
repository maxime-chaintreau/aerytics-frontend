import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { preloadFonts } from "./vite/plugins/preloadFonts.ts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), preloadFonts([/inter-latin-wght-normal-.*\.woff2$/])],
  server: {
    // dev only: /api/... is forwarded to the fake backend
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
