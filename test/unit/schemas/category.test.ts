import { describe, it, expect, vi } from "vitest";
import { TranslationSchema } from "../../../server/utils/common/schema";

vi.stubGlobal("TranslationSchema", TranslationSchema);
const { CreateCategoryBodySchema, UpdateCategoryBodySchema } =
  await import("../../../server/utils/category/schema");

describe("Category Schemas", () => {
  describe("TranslationSchema", () => {
    it("should accept valid translation records", () => {
      const validTranslations = [
        { en: "Tech" },
        { en: "Technology", fr: "Technologie" },
      ];

      validTranslations.forEach((translation) => {
        const result = TranslationSchema.safeParse(translation);
        expect(result.success).toBe(true);
      });
    });

    it("should reject non-string values", () => {
      const result = TranslationSchema.safeParse({ en: 123 });
      expect(result.success).toBe(false);
    });
  });

  describe("CreateCategoryBodySchema", () => {
    const validCategory = {
      name: "Technology",
      slug: "technology",
    };

    it("should accept valid category with string fields", () => {
      const result = CreateCategoryBodySchema.safeParse(validCategory);
      expect(result.success).toBe(true);
    });

    it("should accept valid category with string fields", () => {
      const category = {
        name: "Technology",
        slug: "technology",
      };

      const result = CreateCategoryBodySchema.safeParse(category);
      expect(result.success).toBe(true);
    });

    it("should accept optional description and color", () => {
      const categoryWithOptional = {
        ...validCategory,
        description: "All tech-related posts",
        color: "#0066cc",
      };

      const result = CreateCategoryBodySchema.safeParse(categoryWithOptional);
      expect(result.success).toBe(true);
    });

    it("should require only name (slug is auto-generated)", () => {
      const nameOnly = { name: "Technology" };
      const result = CreateCategoryBodySchema.safeParse(nameOnly);
      expect(result.success).toBe(true);
    });

    it("should reject missing name", () => {
      const noName = { slug: "tech" };
      const result = CreateCategoryBodySchema.safeParse(noName);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateCategoryBodySchema", () => {
    it("should accept all fields optional", () => {
      const result = UpdateCategoryBodySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept partial update", () => {
      const result = UpdateCategoryBodySchema.safeParse({
        name: "Updated Category",
        color: "#ff0000",
      });
      expect(result.success).toBe(true);
    });

    it("should accept only description update", () => {
      const result = UpdateCategoryBodySchema.safeParse({
        description: "Updated description",
      });
      expect(result.success).toBe(true);
    });

    it("should accept string value for partial update", () => {
      const result = UpdateCategoryBodySchema.safeParse({
        name: "New Name",
      });
      expect(result.success).toBe(true);
    });
  });
});
