import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, clearAllRateLimits, resetRateLimit } from "@/lib/omniagent/auth/rate-limit";

beforeEach(() => {
  clearAllRateLimits();
});

describe("checkRateLimit", () => {
  it("allows attempts under the limit", () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit("user@test.com", 5, 60_000, 1_000 + i).allowed).toBe(true);
    }
  });

  it("blocks once the limit is reached and reports retry time", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("user@test.com", 5, 60_000, 1_000);
    }

    const blocked = checkRateLimit("user@test.com", 5, 60_000, 2_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("allows again after the window expires", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("user@test.com", 5, 60_000, 1_000);
    }

    expect(checkRateLimit("user@test.com", 5, 60_000, 62_000).allowed).toBe(true);
  });

  it("tracks keys independently and supports reset", () => {
    for (let i = 0; i < 5; i++) {
      checkRateLimit("a@test.com", 5, 60_000, 1_000);
    }

    expect(checkRateLimit("b@test.com", 5, 60_000, 1_000).allowed).toBe(true);
    expect(checkRateLimit("a@test.com", 5, 60_000, 1_500).allowed).toBe(false);

    resetRateLimit("a@test.com");
    expect(checkRateLimit("a@test.com", 5, 60_000, 1_600).allowed).toBe(true);
  });
});
