import { defineConfig } from "drizzle-kit";

// Database URL is the single source of truth — also used by server/db/index.ts.
// When NODE_ENV=test we point at an isolated file so the test suite never
// touches the primary database.
const dbUrl =
  process.env.NODE_ENV === "test" ? "./database.test.db" : "./database.db";

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./server/db/migrations",
  dialect: "sqlite",
  dbCredentials: { url: dbUrl },
  verbose: true,
  strict: true,
});
