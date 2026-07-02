import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/omniagent/auth/session";
import { countProjects, listProjects, listRuns } from "@/lib/omniagent/storage/project-store";
import { getWorkspaceUsage } from "@/lib/omniagent/workspaces/limits";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const scope = { workspaceId: session.workspace.id };
  const [projects, runs, projectCount] = await Promise.all([
    listProjects(scope),
    listRuns(scope),
    countProjects(scope),
  ]);

  return NextResponse.json({ projects, runs, usage: getWorkspaceUsage(projectCount) });
}
