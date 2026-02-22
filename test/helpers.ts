import { execSync } from "child_process";
import { db, schema } from "../server/db";

export async function clearDb() {
  await db.delete(schema.userTokens);
  await db.delete(schema.mediaUsage);
  await db.delete(schema.media);
  await db.delete(schema.posts);
  await db.delete(schema.passwordResets);
  await db.delete(schema.emailVerifications);
  await db.delete(schema.userProfiles);
  await db.delete(schema.users);
}

export async function setupTestDb() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("NODE_ENV must be 'test'!");
  }
  try {
    console.log("Running migrations...");
    execSync("pnpm drizzle-kit push --config=drizzle.config.ts --force", {
      stdio: "inherit",
    });
    console.log("Migrations done.");
  } catch (e) {
    console.error("Migration failed", e);
  }
}
