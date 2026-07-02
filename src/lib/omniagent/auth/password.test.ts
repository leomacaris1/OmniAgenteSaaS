import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/omniagent/auth/password";

describe("password hashing", () => {
  it("verifies the original password", async () => {
    const hash = await hashPassword("StrongPass123!");

    await expect(verifyPassword("StrongPass123!", hash)).resolves.toBe(true);
  });

  it("rejects a different password", async () => {
    const hash = await hashPassword("StrongPass123!");

    await expect(verifyPassword("WrongPass123!", hash)).resolves.toBe(false);
  });
});
