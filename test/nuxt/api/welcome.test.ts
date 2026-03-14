import { describe, expect, it, vi } from "vitest";
import { createEvent, defineEventHandler } from "h3";
import { jsonResponse } from "../../../server/utils/common/response";

// Stub Nitro server auto-imports used by the route handler
vi.stubGlobal("defineEventHandler", defineEventHandler);
vi.stubGlobal("jsonResponse", jsonResponse);

describe("Users API", () => {
  it("should return a testing message", async () => {
    const { default: handler } = await import(
      "../../../server/api/index.get"
    );
    const event = createEvent(new Request("http://localhost/api"));
    const response = await handler(event);
    expect(response.data).toEqual({ message: "Hello from API!" });
  });
});
