import { describe, expect, it } from "vitest";
import { generatePlanWithFallback } from "@/lib/omniagent/providers/fallback";
import { localProvider } from "@/lib/omniagent/providers/local-provider";
import type { GenerateSaaSPlanParams, ModelProvider } from "@/lib/omniagent/providers/types";

const params: GenerateSaaSPlanParams = {
  input: { idea: "CRM vertical para clinicas dentales" },
  promptVersion: "saas-builder.v2",
  systemPrompt: "test prompt",
};

function failingOpenAIProvider(error: Error): ModelProvider {
  return {
    name: "openai",
    async generateSaaSPlan() {
      throw error;
    },
    async regenerateSection() {
      throw error;
    },
  };
}

describe("generatePlanWithFallback", () => {
  it("uses the primary provider result when it succeeds", async () => {
    const execution = await generatePlanWithFallback(localProvider, () => localProvider, params);

    expect(execution.provider).toBe("local");
    expect(execution.plan.nicheValidation.score).toBeGreaterThan(0);
    expect(execution.telemetry.fallbackFrom).toBeUndefined();
  });

  it("falls back to local when openai fails and records the fallback", async () => {
    const failure = new Error("OpenAI API unavailable");
    const execution = await generatePlanWithFallback(
      failingOpenAIProvider(failure),
      () => localProvider,
      params,
    );

    expect(execution.provider).toBe("local");
    expect(execution.plan.landingPage.headline.length).toBeGreaterThan(0);
    expect(execution.telemetry.fallbackFrom).toBe("openai");
    expect(execution.telemetry.errorMessage).toContain("OpenAI API unavailable");
  });

  it("rethrows when the primary already is the fallback provider", async () => {
    const brokenLocal: ModelProvider = {
      name: "local",
      async generateSaaSPlan() {
        throw new Error("disk full");
      },
      async regenerateSection() {
        throw new Error("disk full");
      },
    };

    await expect(
      generatePlanWithFallback(brokenLocal, () => localProvider, params),
    ).rejects.toThrow("disk full");
  });
});
