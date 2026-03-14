import { describe, it, expect } from "vitest";
import { TranslationSchema } from "../../../shared/utils/schema/common";
import {
  CreatePostBodySchema,
  UpdatePostBodySchema,
  PublicCreatePostBodySchema,
} from "../../../shared/utils/schema/post";

describe("Post Schemas", () => {
  describe("TranslationSchema", () => {
    it("should accept valid translation records", () => {
      const validTranslations = [
        { en: "Hello" },
        { en: "Hello", fr: "Bonjour" },
        { en: "Hello", fr: "Bonjour", de: "Hallo", es: "Hola" },
        { en: "Hello", fr: "Bonjour" },
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

    it("should accept empty record", () => {
      const result = TranslationSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("CreatePostBodySchema", () => {
    const validCreatePost = {
      slug: "hello-world",
      title: "Hello World",
      content: "This is my first post",
    };

    it("should accept valid post with string fields", () => {
      const result = CreatePostBodySchema.safeParse(validCreatePost);
      expect(result.success).toBe(true);
    });

    it("should default status to draft", () => {
      const result = CreatePostBodySchema.safeParse(validCreatePost);
      expect(result.data?.status).toBe("draft");
    });

    it("should accept optional fields", () => {
      const postWithOptional = {
        ...validCreatePost,
        shortDescription: "A short description",
        status: "published",
      };

      const result = CreatePostBodySchema.safeParse(postWithOptional);
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe("published");
    });

    it("should reject invalid status", () => {
      const result = CreatePostBodySchema.safeParse({
        ...validCreatePost,
        status: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("should require slug, title, and content", () => {
      const incomplete = { title: "Hello World" };
      const result = CreatePostBodySchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });

    it("should reject translation objects and only allow strings", () => {
      const invalid = {
        slug: { en: "hello" },
        title: "Hello",
        content: "Content here",
      };
      const result = CreatePostBodySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("UpdatePostBodySchema", () => {
    it("should accept all fields optional", () => {
      const result = UpdatePostBodySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept partial update", () => {
      const result = UpdatePostBodySchema.safeParse({
        title: "Updated Title",
      });
      expect(result.success).toBe(true);
    });

    it("should accept string slug on update", () => {
      const result = UpdatePostBodySchema.safeParse({
        slug: "new-slug",
      });
      expect(result.success).toBe(true);
    });

    it("should reject translation object on update", () => {
      const result = UpdatePostBodySchema.safeParse({
        content: { en: "New content", fr: "Nouveau contenu" },
      });
      expect(result.success).toBe(false);
    });

    it("should not default status for updates", () => {
      const result = UpdatePostBodySchema.safeParse({
        title: "Updated",
      });
      expect(result.data?.status).toBeUndefined();
    });
  });

  describe("PublicCreatePostBodySchema", () => {
    const validPublicPost = {
      title: "My Post",
      content: "Post content",
      userId: 123,
    };

    it("should accept valid public post", () => {
      const result = PublicCreatePostBodySchema.safeParse(validPublicPost);
      expect(result.success).toBe(true);
    });

    it("should default published to false", () => {
      const result = PublicCreatePostBodySchema.safeParse(validPublicPost);
      expect(result.data?.published).toBe(false);
    });

    it("should accept published field", () => {
      const result = PublicCreatePostBodySchema.safeParse({
        ...validPublicPost,
        published: true,
      });
      expect(result.success).toBe(true);
      expect(result.data?.published).toBe(true);
    });

    it("should reject invalid userId (not positive integer)", () => {
      const result = PublicCreatePostBodySchema.safeParse({
        ...validPublicPost,
        userId: -1,
      });
      expect(result.success).toBe(false);
    });

    it("should enforce min/max length on title", () => {
      const tooLong = { ...validPublicPost, title: "a".repeat(101) };
      const result = PublicCreatePostBodySchema.safeParse(tooLong);
      expect(result.success).toBe(false);
    });

    it("should require non-empty content", () => {
      const result = PublicCreatePostBodySchema.safeParse({
        ...validPublicPost,
        content: "",
      });
      expect(result.success).toBe(false);
    });
  });
});
