import { execSync } from "child_process";
import { useDb, schema } from "../server/utils/db";

export async function clearDb() {
  await useDb.delete(schema.userTokens);
  await useDb.delete(schema.mediaUsage);
  await useDb.delete(schema.postTags);
  await useDb.delete(schema.postCategories);
  await useDb.delete(schema.media);
  await useDb.delete(schema.posts);
  await useDb.delete(schema.passwordResets);
  await useDb.delete(schema.emailVerifications);
  await useDb.delete(schema.userPermissions);
  await useDb.delete(schema.userProfiles);
  await useDb.delete(schema.users);
}

export async function setupTestDb() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("NODE_ENV must be 'test'!");
  }
  try {
    console.log("Running migrations...");
    execSync("pnpm drizzle-kit migrate", {
      stdio: "inherit",
      env: { ...process.env, NODE_ENV: "test" },
    });
    console.log("Migrations done.");
  } catch (e) {
    console.error("Migration failed", e);
  }
}
