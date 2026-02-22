import { describe, expect, it, vi, beforeEach } from "vitest";
import type { H3Event } from "h3";
import { defineEventHandler, getQuery, createError } from "h3";
import { userRepository } from "../../../server/utils/user/repository";
import {
  validatePaginationParams,
  createPaginationResponse,
} from "../../../server/utils/common/pagination";
import { listResponse, jsonResponse } from "../../../server/utils/common/response";

// Mock globals used in API handlers
vi.stubGlobal("defineEventHandler", defineEventHandler);
vi.stubGlobal("getQuery", getQuery);
vi.stubGlobal("createError", createError);
vi.stubGlobal("userRepository", userRepository);
vi.stubGlobal("validatePaginationParams", validatePaginationParams);
vi.stubGlobal("createPaginationResponse", createPaginationResponse);
vi.stubGlobal("listResponse", listResponse);
vi.stubGlobal("jsonResponse", jsonResponse);

// Mock auto-imports that are not services/repos but composables/utils
// Usually getQuery and createError are globally available in nuxt test env
// but if they fail, we can stub them.

// Mock h3-zod for POST handler
vi.mock("h3-zod", () => ({
  useValidatedBody: vi.fn(async (event: any, schema: any) => {
    // In our test, we attach body to event._body for convenience
    const body = event._body || {};
    return schema.parse(body);
  }),
}));

describe("API: /api/users", () => {
  let usersGetHandler: any;
  let usersPostHandler: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Dynamic import to allow globals to be stubbed first
    usersGetHandler = (await import("../../../server/api/users/index.get")).default;
    usersPostHandler = (await import("../../../server/api/users/index.post")).default;
  });

  // Simple event factory
  const createMockEvent = (
    options: {
      method?: string;
      query?: Record<string, string>;
      body?: any;
    } = {},
  ) => {
    const event = {
      node: {
        req: {
          method: options.method || "GET",
          url: options.query ? `/?${new URLSearchParams(options.query).toString()}` : "/",
        },
      },
      // Basic h3 event properties needed
      path: options.query ? `/?${new URLSearchParams(options.query).toString()}` : "/",
      method: options.method || "GET",
      // Custom property for our mocked useValidatedBody
      _body: options.body,
    } as unknown as H3Event;

    return event;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/users", () => {
    it("returns list of users successfully", async () => {
      // Arrange
      const mockUsers = [
        {
          id: 1,
          name: "Test User",
          email: "test@example.com",
          role: "user",
          createdAt: new Date(),
          emailVerified: false,
          avatarUrl: null,
          password: "hash",
        },
      ];
      const mockTotal = 1;

      // Spy on repository methods
      // Since we stubbed the global with the imported object, spying on the imported object works
      vi.spyOn(userRepository, "findAll").mockResolvedValue(mockUsers as any);
      vi.spyOn(userRepository, "count").mockResolvedValue(mockTotal);

      const event = createMockEvent({ query: { page: "1", limit: "10" } });

      // Act
      // We invoke the handler directly.
      // Note: In Nuxt 3, export default defineEventHandler(...) returns the handler
      // It is wrapped by `toEventHandler`, so strictly speadking it's (event) => Promise<any>
      const result = await usersGetHandler(event);

      // Assert
      expect(userRepository.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual({
        data: mockUsers,
        message: "",
        meta: expect.objectContaining({
          total: mockTotal,
          page: 1,
          per_page: 10,
        }),
      });
    });
  });

  describe("POST /api/users", () => {
    it("creates a user successfully", async () => {
      // Arrange
      const newUser = { name: "New User", email: "new@example.com" };
      const createdUser = {
        id: 2,
        ...newUser,
        createdAt: new Date(),
        role: "user",
        emailVerified: false,
        avatarUrl: null,
        password: "hash",
      };

      vi.spyOn(userRepository, "create").mockResolvedValue(createdUser as any);

      const event = createMockEvent({
        method: "POST",
        body: newUser,
      });

      // Act
      const result = await usersPostHandler(event);

      // Assert
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: newUser.name,
          email: newUser.email,
        }),
      );
      expect(result).toEqual({
        data: createdUser,
        message: "User created",
      });
    });
  });
});
