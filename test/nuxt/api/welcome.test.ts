import { describe, expect, it } from "vitest";
import { $fetch, setup } from "@nuxt/test-utils";

describe("Users API", async () => {
  await setup();
  it("should return a testing message", async () => {
    const response = await $fetch("/api");
    expect(response.data).toEqual({ message: "Hello from API!" });
  });
});
