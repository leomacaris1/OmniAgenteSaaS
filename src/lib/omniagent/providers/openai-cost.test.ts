import { afterEach, describe, expect, it } from "vitest";
import {
  DEFAULT_INPUT_PRICE_PER_1M,
  DEFAULT_OUTPUT_PRICE_PER_1M,
  estimateCostUsd,
} from "@/lib/omniagent/providers/openai-cost";

afterEach(() => {
  delete process.env.OPENAI_PRICE_INPUT_PER_1M;
  delete process.env.OPENAI_PRICE_OUTPUT_PER_1M;
});

describe("estimateCostUsd", () => {
  it("returns undefined without token data", () => {
    expect(estimateCostUsd()).toBeUndefined();
  });

  it("estimates using default prices", () => {
    const cost = estimateCostUsd(1_000_000, 1_000_000);
    expect(cost).toBeCloseTo(DEFAULT_INPUT_PRICE_PER_1M + DEFAULT_OUTPUT_PRICE_PER_1M, 6);
  });

  it("honors env price overrides", () => {
    process.env.OPENAI_PRICE_INPUT_PER_1M = "1";
    process.env.OPENAI_PRICE_OUTPUT_PER_1M = "10";

    expect(estimateCostUsd(500_000, 100_000)).toBeCloseTo(0.5 + 1, 6);
  });

  it("ignores invalid env overrides", () => {
    process.env.OPENAI_PRICE_INPUT_PER_1M = "not-a-number";

    const cost = estimateCostUsd(1_000_000, 0);
    expect(cost).toBeCloseTo(DEFAULT_INPUT_PRICE_PER_1M, 6);
  });
});
