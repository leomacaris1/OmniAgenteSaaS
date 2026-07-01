import { NextResponse } from "next/server";
import { getEditableArtifacts } from "@/lib/omniagent/artifacts";
import { getProject } from "@/lib/omniagent/storage/project-store";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { projectId } = await context.params;
  const project = await getProject(projectId);

  if (!project) {
    return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    project,
    artifacts: getEditableArtifacts(project),
  });
}
