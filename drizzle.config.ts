import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./server/db/schema.ts",
  out: "./server/db/migrations",
  dialect: "sqlite",
  dbCredentials: {
    // use a separate file when running tests to avoid overwriting dev data
    url: process.env.NODE_ENV === "test" ? "./database.test.db" : "./database.db",
  },
  verbose: true,
  strict: true,
});
