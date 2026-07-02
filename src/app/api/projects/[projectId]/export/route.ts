import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/omniagent/auth/session";
import { formatProjectMarkdown } from "@/lib/omniagent/exports/project-export";
import { getProject } from "@/lib/omniagent/storage/project-store";

type RouteContext = {
  params: Promise<{ projectId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { projectId } = await context.params;
  const project = await getProject(projectId, { workspaceId: session.workspace.id });

  if (!project) {
    return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format") ?? "markdown";

  if (format === "json") {
    return new NextResponse(JSON.stringify(project, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="omniagent-${project.id}.json"`,
      },
    });
  }

  if (format !== "markdown") {
    return NextResponse.json({ error: "Formato no soportado." }, { status: 400 });
  }

  return new NextResponse(formatProjectMarkdown(project), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="omniagent-${project.id}.md"`,
    },
  });
}
