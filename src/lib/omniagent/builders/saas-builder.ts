import {
  SAAS_BUILDER_AGENT_SEQUENCE,
  SAAS_BUILDER_PROMPT_VERSION,
  SAAS_BUILDER_SYSTEM_PROMPT,
} from "@/lib/omniagent/prompts/saas-builder.v2";
import { getModelProvider } from "@/lib/omniagent/providers";
import { generatePlanWithFallback } from "@/lib/omniagent/providers/fallback";
import { localProvider } from "@/lib/omniagent/providers/local-provider";
import { saveProject } from "@/lib/omniagent/storage/project-store";
import type { SaaSBuilderInput, SaaSBuilderOutput } from "@/lib/omniagent/types";

type SaaSBuilderContext = {
  workspaceId?: string;
};

export async function runSaaSBuilder(
  input: SaaSBuilderInput,
  context: SaaSBuilderContext = {},
): Promise<SaaSBuilderOutput> {
  const primary = await getModelProvider();
  const execution = await generatePlanWithFallback(primary, () => localProvider, {
    input,
    promptVersion: SAAS_BUILDER_PROMPT_VERSION,
    systemPrompt: SAAS_BUILDER_SYSTEM_PROMPT,
  });

  const project: SaaSBuilderOutput = {
    ...execution.plan,
    id: crypto.randomUUID(),
    workspaceId: context.workspaceId,
    createdAt: new Date().toISOString(),
    provider: execution.provider,
    promptVersion: SAAS_BUILDER_PROMPT_VERSION,
    input,
  };

  await saveProject(
    project,
    {
      builder: "saas",
      provider: execution.provider,
      agents: SAAS_BUILDER_AGENT_SEQUENCE,
      ...execution.telemetry,
    },
    { workspaceId: context.workspaceId },
  );

  return project;
}
