import fs from "node:fs";
import path from "node:path";

import { defineConfig, type Plugin } from "vite";

const src = path.resolve(__dirname, "./src");

/**
 * Generates stable-URL shim files that re-export from content-hashed bundles,
 * and a `_headers` file with appropriate cache rules for both.
 */
function embeddableShimsPlugin(): Plugin {
  let outDir: string;

  return {
    name: "embeddable-shims",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    writeBundle(_options, bundle) {
      const shimEntries: { stable: string; hashed: string }[] = [];

      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== "chunk" || !chunk.isEntry) continue;

        const stableFilename = `${chunk.name}.js`;
        const hashedFilename = chunk.fileName;

        const shimContent =
          chunk.exports.length > 0
            ? `export * from "./${hashedFilename}";\n`
            : `import "./${hashedFilename}";\n`;

        fs.writeFileSync(path.join(outDir, stableFilename), shimContent);
        shimEntries.push({ stable: stableFilename, hashed: hashedFilename });
      }

      const headersLines: string[] = [];

      for (const { stable, hashed } of shimEntries) {
        headersLines.push(
          `/${stable}`,
          "  Access-Control-Allow-Origin: *",
          "  Cache-Control: no-cache",
          "",
          `/${hashed}`,
          "  Access-Control-Allow-Origin: *",
          "  Cache-Control: public, max-age=31536000, immutable",
          "",
        );
      }

      fs.writeFileSync(path.join(outDir, "_headers"), headersLines.join("\n"));
    },
  };
}

export default defineConfig({
  resolve: {
    alias: {
      "@": src,
    },
  },
  plugins: [embeddableShimsPlugin()],
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
        entryFileNames: "[name]-[hash].js",
        minifyInternalExports: false,
      },
    },
    outDir: "dist/client",
    emptyOutDir: false,
    sourcemap: true,
  },
});
