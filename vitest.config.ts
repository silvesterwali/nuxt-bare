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
        },
      },
      await defineVitestProject({
        test: {
          name: "nuxt",
          include: ["test/nuxt/**/*.{test,spec}.ts"],
          environment: "nuxt",
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
