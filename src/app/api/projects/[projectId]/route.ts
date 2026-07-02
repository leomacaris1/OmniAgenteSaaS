import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/omniagent/auth/session";
import { getEditableArtifacts } from "@/lib/omniagent/artifacts";
import { getProject } from "@/lib/omniagent/storage/project-store";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { projectId } = await context.params;
  const project = await getProject(projectId, { workspaceId: session.workspace.id });

  if (!project) {
    return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    project,
    artifacts: getEditableArtifacts(project),
  });
}
