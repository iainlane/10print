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
        background: path.resolve(__dirname, "background-element.ts"),
        backgroundbody: path.resolve(__dirname, "background-body.ts"),
        demo: path.resolve(__dirname, "demo.html"),
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        entryFileNames: function (chunkInfo) {
          const filenameMap: Record<string, string> = {
            background: "background.js",
            backgroundbody: "background-body.js",
          };

          return filenameMap[chunkInfo.name] ?? "assets/[name]-[hash].js";
        },
      },
    },
  },
});
