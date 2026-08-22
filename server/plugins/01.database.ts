import { execSync } from "node:child_process";

/**
 * Nitro plugin — runs drizzle-kit migrate on dev startup so the database schema
 * is always in sync with the codebase, mirroring the automatic-migration
 * behaviour that atidone gets from NuxtHub.
 *
 * Uses `migrate` (not `push`) so we get proper versioned migration files
 * and can safely apply the same migrations in production.
 *
 * Only fires in development (NODE_ENV !== "production") and only when the
 * server is the main process (skip during tests).
 */
export default defineNitroPlugin(async () => {
  if (import.meta.dev && process.env.NODE_ENV !== "test") {
    try {
      console.log("[db] Running pending migrations…");
      execSync("pnpm drizzle-kit migrate", {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      console.log("[db] Migrations applied ✓");
    } catch (error) {
      console.error("[db] Migration failed:", error);
    }
  }
});
