import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/Medical-pill-despenser/" : "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        medic: resolve(__dirname, "medic.html"),
        logs: resolve(__dirname, "logs.html"),
        user: resolve(__dirname, "user.html"),
      },
    },
  },
});
