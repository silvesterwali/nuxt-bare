import { execSync } from "child_process";

export async function setup() {
  process.env.NODE_ENV = "test";
  // Run migrations on test DB
  execSync("pnpm drizzle-kit push:sqlite --config=drizzle.config.ts");
}
