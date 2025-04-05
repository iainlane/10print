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
    sourcemap: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        background: path.resolve(__dirname, "src/lib/background-js/index.ts"),
      },
      output: {
        entryFileNames: function (chunkInfo) {
          return chunkInfo.name === "background"
            ? "static/background.js"
            : "assets/[name]-[hash].js";
        },
      },
    },
  },
});
