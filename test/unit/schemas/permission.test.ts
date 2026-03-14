import { describe, it, expect } from "vitest";
import { z } from "zod";
import { permissionsArraySchema } from "../../../shared/utils/schema/permissions";

describe("Permission Schemas", () => {
  describe("permissionsArraySchema (POST /admin/users/:id/permissions)", () => {
    it("accepts an array with full actions", () => {
      const result = permissionsArraySchema.safeParse([
        {
          feature: "users",
          permissions: ["create", "read", "update", "delete"],
        },
      ]);
      expect(result.success).toBe(true);
    });

    it("accepts a partial actions array", () => {
      const result = permissionsArraySchema.safeParse([
        { feature: "blog", permissions: ["read"] },
      ]);
      expect(result.success).toBe(true);
    });

    it("accepts an empty permissions array (means revoke)", () => {
      const result = permissionsArraySchema.safeParse([
        { feature: "media", permissions: [] },
      ]);
      expect(result.success).toBe(true);
    });

    it("accepts multiple features in one request", () => {
      const result = permissionsArraySchema.safeParse([
        { feature: "users", permissions: ["create", "read"] },
        { feature: "blog", permissions: [] },
        { feature: "media", permissions: ["read"] },
      ]);
      expect(result.success).toBe(true);
    });

    it("accepts an empty array (no-op)", () => {
      const result = permissionsArraySchema.safeParse([]);
      expect(result.success).toBe(true);
    });

    it("rejects an unknown feature", () => {
      const result = permissionsArraySchema.safeParse([
        { feature: "invoices", permissions: ["read"] },
      ]);
      expect(result.success).toBe(false);
    });

    it("rejects an unknown action", () => {
      const result = permissionsArraySchema.safeParse([
        { feature: "blog", permissions: ["publish"] },
      ]);
      expect(result.success).toBe(false);
    });

    it("rejects an item missing feature", () => {
      const result = permissionsArraySchema.safeParse([
        { permissions: ["read"] },
      ]);
      expect(result.success).toBe(false);
    });

    it("rejects an item missing permissions", () => {
      const result = permissionsArraySchema.safeParse([{ feature: "blog" }]);
      expect(result.success).toBe(false);
    });

    it("rejects a non-array value", () => {
      const result = permissionsArraySchema.safeParse({
        feature: "blog",
        permissions: ["read"],
      });
      expect(result.success).toBe(false);
    });

    it("is usable as an optional field in a wrapper schema", () => {
      const wrapper = z.object({
        permissions: permissionsArraySchema.optional(),
      });
      expect(wrapper.safeParse({}).success).toBe(true);
      expect(
        wrapper.safeParse({
          permissions: [{ feature: "blog", permissions: ["read"] }],
        }).success,
      ).toBe(true);
    });
  });
});
