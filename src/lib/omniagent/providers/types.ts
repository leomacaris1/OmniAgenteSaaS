import type { SaaSBuilderInput, SaaSBuilderOutput } from "@/lib/omniagent/types";

export type GenerateSaaSPlanParams = {
  input: SaaSBuilderInput;
  promptVersion: string;
  systemPrompt: string;
};

export type ModelProvider = {
  name: "local" | "openai";
  generateSaaSPlan(params: GenerateSaaSPlanParams): Promise<Omit<SaaSBuilderOutput, "id" | "createdAt" | "provider" | "promptVersion" | "input">>;
};
