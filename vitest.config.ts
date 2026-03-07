import * as path from "node:path";

import { defineConfig } from "vitest/config";

const alias = { "@": path.resolve(__dirname, "./src") };

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
    },
    globals: true,
    projects: [
      {
        test: {
          name: "unit",
          environment: "jsdom",
          include: ["src/**/*.test.{ts,tsx}"],
          exclude: ["src/**/*.browser.test.{ts,tsx}"],
          alias,
        },
      },
      "./vitest.browser.config.ts",
    ],
  },
});
