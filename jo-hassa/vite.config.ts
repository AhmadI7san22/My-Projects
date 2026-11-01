import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwind()],
  root: "client",
  build: { outDir: "../dist/client", emptyOutDir: true },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:4000",
      "/uploads": "http://127.0.0.1:4000",
    },
  },
});
