import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";

export default defineConfig({
  test: {
    globals: true,
    globalSetup: ["test/setup.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
    teardownTimeout: 10000,
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
              rootDir: fileURLToPath(new URL(".", import.meta.url)),
              domEnvironment: "happy-dom",
            },
          },
          globals: true,
        },
      }),
    ],
  },
});
