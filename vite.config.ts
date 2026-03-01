import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const src = path.resolve(__dirname, "./src");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": src,
    },
  },
  build: {
    rollupOptions: {
      input: {
        demo: path.resolve(__dirname, "demo.html"),
        main: path.resolve(__dirname, "index.html"),
      },
    },
    sourcemap: true,
  },
});
