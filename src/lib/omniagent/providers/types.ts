import type { EditableArtifactKey } from "@/lib/omniagent/artifacts";
import type { SaaSBuilderInput, SaaSBuilderOutput } from "@/lib/omniagent/types";

export type GeneratedSaaSPlan = Omit<
  SaaSBuilderOutput,
  "id" | "workspaceId" | "createdAt" | "provider" | "promptVersion" | "input"
>;

export type ProviderUsage = {
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
};

export type GenerateSaaSPlanParams = {
  input: SaaSBuilderInput;
  promptVersion: string;
  systemPrompt: string;
};

export type GenerateSaaSPlanResult = {
  plan: GeneratedSaaSPlan;
  usage?: ProviderUsage;
};

export type RegenerateSectionParams = {
  input: SaaSBuilderInput;
  artifactKey: EditableArtifactKey;
  currentContent: unknown;
  promptVersion: string;
  systemPrompt: string;
};

export type RegenerateSectionResult = {
  content: unknown;
  usage?: ProviderUsage;
};

export type ModelProvider = {
  name: "local" | "openai";
  generateSaaSPlan(params: GenerateSaaSPlanParams): Promise<GenerateSaaSPlanResult>;
  regenerateSection(params: RegenerateSectionParams): Promise<RegenerateSectionResult>;
};
