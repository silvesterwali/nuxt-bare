import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export default async function setup() {
  process.env.NODE_ENV = "test";

  // Delete existing test database to start fresh
  const dbPath = "./database.test.db";
  for (const suffix of ["", "-wal", "-shm"]) {
    const file = `${dbPath}${suffix}`;
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }

  try {
    console.log("[test-setup] Running migrations on test database…");
    execSync("pnpm drizzle-kit migrate", {
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "test" },
    });
    console.log("[test-setup] Migrations completed successfully");
  } catch (error) {
    console.error("[test-setup] Migration failed:", error);
    throw error;
  }
}
