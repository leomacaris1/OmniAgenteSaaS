import { localProvider } from "@/lib/omniagent/providers/local-provider";
import type { ModelProvider } from "@/lib/omniagent/providers/types";

export async function getModelProvider(): Promise<ModelProvider> {
  if (process.env.OMNIAGENT_MODEL_PROVIDER === "openai") {
    const { openAIProvider } = await import("@/lib/omniagent/providers/openai-provider");
    return openAIProvider;
  }

  return localProvider;
}
