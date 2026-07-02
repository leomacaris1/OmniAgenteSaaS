import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/omniagent/auth/session";
import { getEditableArtifacts, isEditableArtifactKey } from "@/lib/omniagent/artifacts";
import { updateProjectArtifact } from "@/lib/omniagent/storage/project-store";

type RouteContext = {
  params: Promise<{ projectId: string; artifactKey: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { projectId, artifactKey } = await context.params;

  if (!isEditableArtifactKey(artifactKey)) {
    return NextResponse.json({ error: "Artefacto no soportado." }, { status: 400 });
  }

  let body: { content?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalido." }, { status: 400 });
  }

  if (!("content" in body)) {
    return NextResponse.json({ error: "Falta content." }, { status: 400 });
  }

  const project = await updateProjectArtifact(projectId, artifactKey, body.content, {
    workspaceId: session.workspace.id,
  });

  if (!project) {
    return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    project,
    artifacts: getEditableArtifacts(project),
  });
}
