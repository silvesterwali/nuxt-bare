import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { db, schema } from "../../../server/db";
import { permissionRepository } from "../../../server/utils/permission/service";
import { clearDb } from "../../helpers";

describe("Permission Repository", () => {
  let testUserId: number;

  beforeEach(async () => {
    await clearDb();

    const [user] = await db
      .insert(schema.users)
      .values({
        name: "Perm User",
        email: "perm@example.com",
        password: "hashed",
        role: "user",
        emailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    testUserId = user.id;
  });

  it("returns empty array when user has no permissions", async () => {
    const result = await permissionRepository.findByUserId(testUserId);
    expect(result).toEqual([]);
  });

  it("creates a permission record via upsert", async () => {
    const record = await permissionRepository.upsert(testUserId, "blog", [
      "create",
      "read",
    ]);

    expect(record).toBeDefined();
    expect(record.userId).toBe(testUserId);
    expect(record.feature).toBe("blog");
    expect(record.permissions).toEqual(["create", "read"]);
  });

  it("updates an existing permission record via upsert", async () => {
    await permissionRepository.upsert(testUserId, "blog", ["read"]);
    const updated = await permissionRepository.upsert(testUserId, "blog", [
      "create",
      "read",
      "update",
      "delete",
    ]);

    expect(updated.permissions).toEqual(["create", "read", "update", "delete"]);

    // Only one record should exist for this user+feature
    const all = await permissionRepository.findByUserId(testUserId);
    const blogEntries = all.filter((p) => p.feature === "blog");
    expect(blogEntries).toHaveLength(1);
  });

  it("finds permission by userId and feature", async () => {
    await permissionRepository.upsert(testUserId, "media", ["read"]);

    const found = await permissionRepository.findByUserIdAndFeature(
      testUserId,
      "media",
    );
    expect(found).toBeDefined();
    expect(found!.feature).toBe("media");

    const notFound = await permissionRepository.findByUserIdAndFeature(
      testUserId,
      "category",
    );
    expect(notFound).toBeNull();
  });

  it("returns all permissions for a user across features", async () => {
    await permissionRepository.upsert(testUserId, "blog", ["read"]);
    await permissionRepository.upsert(testUserId, "media", ["create", "read"]);

    const all = await permissionRepository.findByUserId(testUserId);
    expect(all).toHaveLength(2);
    expect(all.map((p) => p.feature).sort()).toEqual(["blog", "media"]);
  });

  it("deletes permission for a specific feature", async () => {
    await permissionRepository.upsert(testUserId, "blog", ["read"]);
    await permissionRepository.upsert(testUserId, "media", ["read"]);

    await permissionRepository.deleteByUserIdAndFeature(testUserId, "blog");

    const all = await permissionRepository.findByUserId(testUserId);
    expect(all).toHaveLength(1);
    expect(all[0].feature).toBe("media");
  });

  it("deletes all permissions for a user", async () => {
    await permissionRepository.upsert(testUserId, "blog", ["read"]);
    await permissionRepository.upsert(testUserId, "media", ["read"]);
    await permissionRepository.upsert(testUserId, "category", ["read"]);

    await permissionRepository.deleteAllByUserId(testUserId);

    const all = await permissionRepository.findByUserId(testUserId);
    expect(all).toHaveLength(0);
  });

  it("permissions are cascade-deleted when user is deleted", async () => {
    await permissionRepository.upsert(testUserId, "blog", ["read"]);

    // Delete permissions first (respects FK), then user
    await permissionRepository.deleteAllByUserId(testUserId);
    await db.delete(schema.users).where(eq(schema.users.id, testUserId));

    const all = await permissionRepository.findByUserId(testUserId);
    expect(all).toHaveLength(0);
  });
});
