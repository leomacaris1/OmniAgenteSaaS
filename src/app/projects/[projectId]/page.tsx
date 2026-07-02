import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Boxes, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProjectArtifactEditor } from "@/components/omniagent/project-artifact-editor";
import { getCurrentSession } from "@/lib/omniagent/auth/session";
import { getEditableArtifacts } from "@/lib/omniagent/artifacts";
import { getProject } from "@/lib/omniagent/storage/project-store";

type ProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const { projectId } = await params;
  const project = await getProject(projectId, { workspaceId: session.workspace.id });

  if (!project) {
    notFound();
  }

  const artifacts = getEditableArtifacts(project);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-border pb-5">
          <Button asChild variant="ghost" className="w-fit gap-2 px-0">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Command Center
            </Link>
          </Button>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="secondary">Proyecto</Badge>
                <Badge variant="outline">{project.provider}</Badge>
                <Badge variant="outline">{project.promptVersion}</Badge>
              </div>
              <h1 className="max-w-4xl text-2xl font-semibold tracking-normal sm:text-3xl">
                {project.landingPage.headline}
              </h1>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
                {project.valueProposition}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <ProjectMetric label="Score" value={project.nicheValidation.score.toString()} />
              <ProjectMetric label="Backlog" value={project.backlog.length.toString()} />
              <ProjectMetric label="Artefactos" value={artifacts.length.toString()} />
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4" />
                Contexto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Idea original</p>
                <p className="mt-1 leading-6">{project.input.idea}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground">Usuarios objetivo</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.targetUsers.map((user) => (
                    <Badge key={user} variant="outline">{user}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Boxes className="h-4 w-4" />
                Artefactos editables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectArtifactEditor projectId={project.id} initialArtifacts={artifacts} />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function ProjectMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-24 rounded-md border border-border px-3 py-2 text-right">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
