import { describe, it, expect, vi } from "vitest";
import { TranslationSchema } from "../../../server/utils/common/schema";
vi.stubGlobal("TranslationSchema", TranslationSchema);
const { CreateTagBodySchema, UpdateTagBodySchema } =
  await import("../../../server/utils/tag/schema");

describe("Tag Schemas", () => {
  describe("TranslationSchema", () => {
    it("should accept valid translation records", () => {
      const valid = { en: "English", fr: "Français" };
      const result = TranslationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject non-string values", () => {
      const invalid = { en: "English", fr: 123 };
      const result = TranslationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should accept empty records", () => {
      const result = TranslationSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("CreateTagBodySchema", () => {
    const validTag = {
      name: "Technology",
      slug: "tech",
    };

    it("should accept valid tag with string fields", () => {
      const result = CreateTagBodySchema.safeParse(validTag);
      expect(result.success).toBe(true);
    });

    it("should accept optional color field", () => {
      const tag = {
        ...validTag,
        color: "#FF5733",
      };
      const result = CreateTagBodySchema.safeParse(tag);
      expect(result.success).toBe(true);
    });

    it("should require only name (slug is auto-generated)", () => {
      const nameOnly = { name: "Technology" };
      const result = CreateTagBodySchema.safeParse(nameOnly);
      expect(result.success).toBe(true);
    });

    it("should reject missing name", () => {
      const noName = { slug: "tech" };
      const result = CreateTagBodySchema.safeParse(noName);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateTagBodySchema", () => {
    it("should accept all optional fields", () => {
      const result = UpdateTagBodySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept partial update with only name", () => {
      const update = { name: "Updated" };
      const result = UpdateTagBodySchema.safeParse(update);
      expect(result.success).toBe(true);
    });

    it("should accept string values in partial update", () => {
      const update = {
        name: "Tech",
        slug: "technology",
      };
      const result = UpdateTagBodySchema.safeParse(update);
      expect(result.success).toBe(true);
    });
  });
});
