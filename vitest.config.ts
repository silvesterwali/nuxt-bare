import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { fileURLToPath } from "node:url";
import path from "node:path";
export default defineConfig({
  test: {
    globals: true,
    globalSetup: ["test/setup.ts"],
    alias: {
      "#auth-utils": path.resolve(
        __dirname,
        "./node_modules/nuxt-auth-utils/dist/runtime/server/utils/index.mjs",
      ),
    },
    projects: [
      {
        test: {
          name: "unit",
          include: ["test/unit/**/*.{test,spec}.ts"],
          environment: "node",
          globals: true,
          isolate: false,
          fileParallelism: false,
          sequence: { groupOrder: 1 },
        },
      },
      await defineVitestProject({
        plugins: [
          {
            // bun:test is a Bun built-in that @nuxt/test-utils imports conditionally.
            // Vite fails trying to bundle it in the client environment, so stub it out.
            name: "stub-bun-test",
            enforce: "pre",
            resolveId(id) {
              if (id === "bun:test") return "\0bun-test-stub";
            },
            load(id) {
              if (id === "\0bun-test-stub") return "export default {};";
            },
          },
        ],
        test: {
          name: "nuxt",
          include: ["test/nuxt/**/*.{test,spec}.ts"],
          environment: "nuxt",
          sequence: { groupOrder: 2 },
          environmentOptions: {
            nuxt: {
              rootDir: fileURLToPath(new URL("./", import.meta.url)),
            },
          },
        },
      }),
    ],
  },
});
