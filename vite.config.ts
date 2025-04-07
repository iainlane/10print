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
        backgroundbody: path.resolve(__dirname, "background-body.ts"),
        backgroundelement: path.resolve(__dirname, "background-element.ts"),
        demo: path.resolve(__dirname, "demo.html"),
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        entryFileNames: function (chunkInfo) {
          const filenameMap: Record<string, string> = {
            backgroundbody: "background-body.js",
            backgroundelement: "background-element.js",
          };

          return filenameMap[chunkInfo.name] ?? "assets/[name]-[hash].js";
        },
        minifyInternalExports: false,
      },
    },
    sourcemap: true,
  },
});
