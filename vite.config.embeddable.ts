import path from "node:path";

import { defineConfig } from "vite";

const src = path.resolve(__dirname, "./src");

export default defineConfig({
  resolve: {
    alias: {
      "@": src,
    },
  },
  build: {
    rollupOptions: {
      input: {
        "background-body": path.resolve(
          __dirname,
          "src/embeddable/background-body.ts",
        ),
        "background-element": path.resolve(
          __dirname,
          "src/embeddable/background-element.ts",
        ),
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
    outDir: "dist/client",
    emptyOutDir: false,
    sourcemap: true,
  },
});
