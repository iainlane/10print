import path from "node:path";

import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const src = path.resolve(__dirname, "./src");

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  resolve: {
    alias: {
      "@": src,
    },
  },
  environments: {
    client: {
      build: {
        rollupOptions: {
          input: {
            demo: path.resolve(__dirname, "demo.html"),
            main: path.resolve(__dirname, "index.html"),
          },
        },
      },
    },
  },
  build: {
    sourcemap: true,
  },
});
