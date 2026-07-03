import type {
  GeneratedSaaSPlan,
  GenerateSaaSPlanParams,
  ModelProvider,
  ProviderUsage,
  RegenerateSectionParams,
} from "@/lib/omniagent/providers/types";
import type { ProviderName, RunTelemetry } from "@/lib/omniagent/types";

export type PlanExecution = {
  provider: ProviderName;
  plan: GeneratedSaaSPlan;
  telemetry: RunTelemetry;
};

export type SectionExecution = {
  provider: ProviderName;
  content: unknown;
  telemetry: RunTelemetry;
};

function usageToTelemetry(usage?: ProviderUsage): RunTelemetry {
  return {
    inputTokens: usage?.inputTokens,
    outputTokens: usage?.outputTokens,
    costUsd: usage?.costUsd,
  };
}

function toErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.slice(0, 500);
}

/**
 * Runs the primary provider; if it fails and a distinct fallback exists, runs
 * the fallback and records where the run fell back from. The local provider
 * has no further fallback — its errors propagate.
 */
export async function generatePlanWithFallback(
  primary: ModelProvider,
  resolveFallback: () => ModelProvider | Promise<ModelProvider>,
  params: GenerateSaaSPlanParams,
): Promise<PlanExecution> {
  try {
    const result = await primary.generateSaaSPlan(params);
    return {
      provider: primary.name,
      plan: result.plan,
      telemetry: usageToTelemetry(result.usage),
    };
  } catch (error) {
    const fallback = await resolveFallback();

    if (fallback.name === primary.name) {
      throw error;
    }

    const result = await fallback.generateSaaSPlan(params);

    return {
      provider: fallback.name,
      plan: result.plan,
      telemetry: {
        ...usageToTelemetry(result.usage),
        fallbackFrom: primary.name,
        errorMessage: toErrorMessage(error),
      },
    };
  }
}

export async function regenerateSectionWithFallback(
  primary: ModelProvider,
  resolveFallback: () => ModelProvider | Promise<ModelProvider>,
  params: RegenerateSectionParams,
): Promise<SectionExecution> {
  try {
    const result = await primary.regenerateSection(params);
    return {
      provider: primary.name,
      content: result.content,
      telemetry: usageToTelemetry(result.usage),
    };
  } catch (error) {
    const fallback = await resolveFallback();

    if (fallback.name === primary.name) {
      throw error;
    }

    const result = await fallback.regenerateSection(params);

    return {
      provider: fallback.name,
      content: result.content,
      telemetry: {
        ...usageToTelemetry(result.usage),
        fallbackFrom: primary.name,
        errorMessage: toErrorMessage(error),
      },
    };
  }
}
