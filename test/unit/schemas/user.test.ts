import { describe, it, expect } from "vitest";
import { CreateUserBodySchema } from "../../../shared/utils/schema/user";

describe("User Schemas", () => {
  describe("CreateUserBodySchema", () => {
    const validUser = {
      name: "John Doe",
      email: "john@example.com",
    };

    it("should accept valid user", () => {
      const result = CreateUserBodySchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it("should enforce name length constraints", () => {
      const tooLongName = { ...validUser, name: "a".repeat(101) };
      const result = CreateUserBodySchema.safeParse(tooLongName);
      expect(result.success).toBe(false);
    });

    it("should require non-empty name", () => {
      const emptyName = { ...validUser, name: "" };
      const result = CreateUserBodySchema.safeParse(emptyName);
      expect(result.success).toBe(false);
    });

    it("should validate email format", () => {
      const invalidEmails = [
        "not-an-email",
        "missing@domain",
        "missing.domain@",
        "@nodomain.com",
      ];

      invalidEmails.forEach((email) => {
        const result = CreateUserBodySchema.safeParse({
          ...validUser,
          email,
        });
        expect(result.success).toBe(false);
      });
    });

    it("should accept valid email formats", () => {
      const validEmails = [
        "user@example.com",
        "user+tag@example.com",
        "user.name@example.co.uk",
        "user_name@example.com",
      ];

      validEmails.forEach((email) => {
        const result = CreateUserBodySchema.safeParse({
          ...validUser,
          email,
        });
        expect(result.success).toBe(true);
      });
    });

    it("should require both name and email", () => {
      const result1 = CreateUserBodySchema.safeParse({ name: "John" });
      const result2 = CreateUserBodySchema.safeParse({
        email: "john@example.com",
      });

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });
  });
});
