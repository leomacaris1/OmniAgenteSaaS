import {
  SAAS_BUILDER_AGENT_SEQUENCE,
  SAAS_BUILDER_PROMPT_VERSION,
  SAAS_BUILDER_SYSTEM_PROMPT,
} from "@/lib/omniagent/prompts/saas-builder.v1";
import { getModelProvider } from "@/lib/omniagent/providers";
import { saveProject } from "@/lib/omniagent/storage/project-store";
import type { SaaSBuilderInput, SaaSBuilderOutput } from "@/lib/omniagent/types";

export async function runSaaSBuilder(input: SaaSBuilderInput): Promise<SaaSBuilderOutput> {
  const provider = await getModelProvider();
  const generated = await provider.generateSaaSPlan({
    input,
    promptVersion: SAAS_BUILDER_PROMPT_VERSION,
    systemPrompt: SAAS_BUILDER_SYSTEM_PROMPT,
  });

  const project: SaaSBuilderOutput = {
    ...generated,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    provider: provider.name,
    promptVersion: SAAS_BUILDER_PROMPT_VERSION,
    input,
  };

  await saveProject(project, {
    builder: "saas",
    provider: provider.name,
    agents: SAAS_BUILDER_AGENT_SEQUENCE,
  });

  return project;
}
