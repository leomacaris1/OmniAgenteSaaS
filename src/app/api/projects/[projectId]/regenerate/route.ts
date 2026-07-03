import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/omniagent/auth/session";
import {
  getEditableArtifacts,
  isEditableArtifactKey,
  updateEditableArtifact,
  type EditableArtifactKey,
} from "@/lib/omniagent/artifacts";
import {
  SAAS_BUILDER_PROMPT_VERSION,
  SAAS_BUILDER_SYSTEM_PROMPT,
} from "@/lib/omniagent/prompts/saas-builder.v2";
import { getModelProvider } from "@/lib/omniagent/providers";
import { regenerateSectionWithFallback } from "@/lib/omniagent/providers/fallback";
import { localProvider } from "@/lib/omniagent/providers/local-provider";
import { getProject, replaceProject, saveRun } from "@/lib/omniagent/storage/project-store";
import type { AgentRole } from "@/lib/omniagent/types";

const bodySchema = z.object({
  artifactKey: z.string(),
  idea: z.string().trim().min(10, "Describe la idea con al menos 10 caracteres.").optional(),
});

const sectionAgent: Record<EditableArtifactKey, AgentRole> = {
  validation: "research",
  backlog: "developer",
  landing: "copywriter",
  pricing: "business-analyst",
  launch: "marketing",
  customers: "sales",
};

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    const { projectId } = await context.params;
    const payload = bodySchema.parse(await request.json());

    if (!isEditableArtifactKey(payload.artifactKey)) {
      return NextResponse.json({ error: "Artefacto no soportado." }, { status: 400 });
    }

    const scope = { workspaceId: session.workspace.id };
    const project = await getProject(projectId, scope);

    if (!project) {
      return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
    }

    const input = { ...project.input, idea: payload.idea ?? project.input.idea };
    const primary = await getModelProvider();
    const execution = await regenerateSectionWithFallback(primary, () => localProvider, {
      input,
      artifactKey: payload.artifactKey,
      currentContent: getEditableArtifacts(project).find(
        (artifact) => artifact.key === payload.artifactKey,
      )?.content,
      promptVersion: SAAS_BUILDER_PROMPT_VERSION,
      systemPrompt: SAAS_BUILDER_SYSTEM_PROMPT,
    });

    const updatedProject = updateEditableArtifact(
      { ...project, input, provider: execution.provider },
      payload.artifactKey,
      execution.content,
    );

    const persisted = await replaceProject(projectId, updatedProject, scope);

    if (!persisted) {
      return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
    }

    await saveRun(projectId, {
      builder: "saas",
      provider: execution.provider,
      agents: [sectionAgent[payload.artifactKey]],
      status: "completed",
      ...execution.telemetry,
    });

    return NextResponse.json({
      project: persisted,
      artifacts: getEditableArtifacts(persisted),
      run: {
        provider: execution.provider,
        ...execution.telemetry,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo regenerar la seccion.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
