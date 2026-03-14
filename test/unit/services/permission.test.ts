import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { eq } from "drizzle-orm";
import { db, schema } from "../../../server/db";
import { AllPermissions } from "../../../shared/utils/permissions";
import {
  grantPermissionByEmail,
  revokePermissionByEmail,
  permissionRepository,
} from "../../../server/utils/permission/service";
import { userRepository } from "../../../server/utils/user/repository";
import { clearDb } from "../../helpers";

// userRepository is used as a Nuxt global auto-import in permission/service.ts
vi.stubGlobal("userRepository", userRepository);

describe("Permission Service", () => {
  beforeEach(async () => {
    await clearDb();
  });

  describe("AllPermissions()", () => {
    it("returns all four features each with four CRUD actions", () => {
      const all = AllPermissions();
      const features = Object.keys(all);
      expect(features.sort()).toEqual(
        ["blog", "category", "media", "tags", "users"].sort(),
      );
      for (const actions of Object.values(all)) {
        expect(actions.sort()).toEqual(
          ["create", "delete", "read", "update"].sort(),
        );
      }
    });
  });

  describe("grantPermissionByEmail()", () => {
    it("grants all actions for a feature to an existing user", async () => {
      const user = await userRepository.create({
        name: "Grant User",
        email: "grant@example.com",
        password: "hashed",
      });

      const record = await grantPermissionByEmail("grant@example.com", "blog");

      expect(record).toBeDefined();
      expect(record!.userId).toBe(user.id);
      expect(record!.feature).toBe("blog");
      expect((record!.permissions as string[]).sort()).toEqual(
        ["create", "delete", "read", "update"].sort(),
      );
    });

    it("grants permissions idempotently when called twice", async () => {
      await userRepository.create({
        name: "Idempotent User",
        email: "idempotent@example.com",
        password: "hashed",
      });

      await grantPermissionByEmail("idempotent@example.com", "media");
      await grantPermissionByEmail("idempotent@example.com", "media");

      const found = await userRepository.findByEmail("idempotent@example.com");
      const all = await permissionRepository.findByUserId(found!.id);
      const mediaEntries = all.filter((p) => p.feature === "media");
      expect(mediaEntries).toHaveLength(1);
    });

    it("throws when user does not exist", async () => {
      await expect(
        grantPermissionByEmail("ghost@example.com", "blog"),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe("revokePermissionByEmail()", () => {
    it("removes the feature permission for an existing user", async () => {
      const user = await userRepository.create({
        name: "Revoke User",
        email: "revoke@example.com",
        password: "hashed",
      });

      await permissionRepository.upsert(user.id, "users", [
        "create",
        "read",
        "update",
        "delete",
      ]);

      await revokePermissionByEmail("revoke@example.com", "users");

      const remaining = await permissionRepository.findByUserId(user.id);
      expect(remaining).toHaveLength(0);
    });

    it("does not throw when revoking a permission that does not exist", async () => {
      await userRepository.create({
        name: "No Perm User",
        email: "noperm@example.com",
        password: "hashed",
      });

      await expect(
        revokePermissionByEmail("noperm@example.com", "blog"),
      ).resolves.not.toThrow();
    });

    it("throws when user does not exist", async () => {
      await expect(
        revokePermissionByEmail("ghost2@example.com", "blog"),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("only removes the specified feature, leaving others intact", async () => {
      const user = await userRepository.create({
        name: "Selective Revoke",
        email: "selective@example.com",
        password: "hashed",
      });

      await permissionRepository.upsert(user.id, "blog", ["read"]);
      await permissionRepository.upsert(user.id, "media", ["read"]);

      await revokePermissionByEmail("selective@example.com", "blog");

      const remaining = await permissionRepository.findByUserId(user.id);
      expect(remaining).toHaveLength(1);
      expect(remaining[0].feature).toBe("media");
    });
  });
});
