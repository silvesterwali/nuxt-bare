import { describe, expect, it, vi } from "vitest";
import {
  validatePaginationParams,
  calculatePagination,
  createPaginationResponse,
} from "../../server/utils/common/pagination";
import { jsonResponse, listResponse } from "../../server/utils/common/response";
import { passwordService } from "../../server/utils/auth/password";

// Mock nuxt-auth-utils functions
vi.stubGlobal("hashPassword", async (p: string) => `mock-hash:${p}`);
vi.stubGlobal("verifyPassword", async (h: string, p: string) => h === `mock-hash:${p}`);

describe("pagination utilities", () => {
  it("should validate default params", () => {
    const params = validatePaginationParams({});
    expect(params.page).toBe(1);
    expect(params.limit).toBeGreaterThan(0);
  });

  it("should clamp limits", () => {
    const params = validatePaginationParams({ page: "-5", limit: "9999" });
    expect(params.page).toBe(1);
    expect(params.limit).toBeLessThanOrEqual(100);
  });

  it("calculates pagination correctly", () => {
    const info = calculatePagination(50, 2, 10);
    expect(info.totalPages).toBe(5);
    expect(info.offset).toBe(10);
    expect(info.hasNextPage).toBe(true);
    expect(info.hasPreviousPage).toBe(true);
  });

  it("creates standard list responses", () => {
    const resp = createPaginationResponse([1, 2, 3], 3, 1, 3, "ok");
    expect(resp.message).toBe("ok");
    expect(resp.meta.page).toBe(1);
    expect(resp.meta.total).toBe(3);
  });
});

describe("response helpers", () => {
  it("jsonResponse wraps object", () => {
    const data = { foo: "bar" };
    const resp = jsonResponse(data, "hello");
    expect(resp.data).toEqual(data);
    expect(resp.message).toBe("hello");
  });

  it("listResponse builds meta", () => {
    const arr = [1, 2];
    const resp = listResponse(arr, 2, 1, 2, "list");
    expect(resp.meta.per_page).toBe(2);
    expect(resp.data).toEqual(arr);
    expect(resp.message).toBe("list");
  });
});

describe("auth utilities", () => {
  it("hash/verify password works", async () => {
    const pw = "secret123";
    const hash = await passwordService.hash(pw);
    expect(hash).toContain(":");
    const check = await passwordService.verify(pw, hash);
    expect(check).toBe(true);
    const fail = await passwordService.verify("wrong", hash);
    expect(fail).toBe(false);
  });
});
