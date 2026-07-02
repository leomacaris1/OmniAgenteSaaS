import { updateEditableArtifact, type EditableArtifactKey } from "@/lib/omniagent/artifacts";
import type { AgentRun, SaaSBuilderOutput } from "@/lib/omniagent/types";
import type { ProjectRepository, SaveProjectRunInput } from "@/lib/omniagent/storage/types";
import { getOrCreateDefaultOrganizationId } from "@/lib/omniagent/storage/default-organization";
import type { ProjectRepository, ProjectScope, SaveProjectRunInput } from "@/lib/omniagent/storage/types";
import { getPrismaClient } from "@/lib/omniagent/storage/prisma-client";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";

function projectTitle(project: SaaSBuilderOutput) {
  return project.landingPage.headline || project.input.idea.slice(0, 80);
}

function toProject(record: { output: unknown }) {
  return record.output as SaaSBuilderOutput;
}

function toRun(record: {
  id: string;
  projectId: string;
  builder: string;
  provider: string;
  agents: string[];
  status: string;
  createdAt: Date;
}): AgentRun {
  return {
    id: record.id,
    projectId: record.projectId,
    builder: record.builder as AgentRun["builder"],
    provider: record.provider as AgentRun["provider"],
    agents: record.agents as AgentRun["agents"],
    status: record.status as AgentRun["status"],
    createdAt: record.createdAt.toISOString(),
  };
}

function toInputJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function workspaceWhere(projectId: string, scope?: ProjectScope) {
  return scope?.workspaceId ? { id: projectId, workspaceId: scope.workspaceId } : { id: projectId };
}

async function writeArtifacts(
  projectId: string,
  project: SaaSBuilderOutput,
  prisma: PrismaClient,
) {
  const { getEditableArtifacts } = await import("@/lib/omniagent/artifacts");
  const artifacts = getEditableArtifacts(project);

  await prisma.generatedArtifact.deleteMany({ where: { projectId } });
  await prisma.generatedArtifact.createMany({
    data: artifacts.map((artifact) => ({
      projectId,
      type: artifact.key,
      title: artifact.title,
      content: toInputJson(artifact.content),
    })),
  });
}

export const prismaProjectRepository: ProjectRepository = {
  async saveProject(project: SaaSBuilderOutput, run: SaveProjectRunInput, scope?: ProjectScope) {
    const prisma = await getPrismaClient();
    const organizationId = run.organizationId ?? (await getOrCreateDefaultOrganizationId(prisma));
    const workspaceId = scope?.workspaceId ?? project.workspaceId;
    const scopedProject = workspaceId ? { ...project, workspaceId } : project;

    await prisma.$transaction(async (tx) => {
      await tx.project.create({
        data: {
          id: project.id,
          organizationId,
          createdByUserId: run.createdByUserId,
          title: projectTitle(project),
          idea: project.input.idea,
          audience: project.input.audience,
          region: project.input.region,
          constraints: project.input.constraints,
          provider: project.provider,
          promptVersion: project.promptVersion,
          output: toInputJson(project),
          id: scopedProject.id,
          workspaceId,
          title: projectTitle(scopedProject),
          idea: scopedProject.input.idea,
          audience: scopedProject.input.audience,
          region: scopedProject.input.region,
          constraints: scopedProject.input.constraints,
          provider: scopedProject.provider,
          promptVersion: scopedProject.promptVersion,
          output: toInputJson(scopedProject),
          runs: {
            create: {
              id: crypto.randomUUID(),
              builder: run.builder,
              provider: run.provider,
              agents: run.agents,
              status: "completed",
            },
          },
        },
      });
    });

    await writeArtifacts(scopedProject.id, scopedProject, prisma);
  },

  async listProjects(scope?: ProjectScope) {
    const prisma = await getPrismaClient();
    const projects = await prisma.project.findMany({
      where: scope?.workspaceId ? { workspaceId: scope.workspaceId } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { output: true },
    });

    return projects.map(toProject);
  },

  async countProjects(scope?: ProjectScope) {
    const prisma = await getPrismaClient();

    return prisma.project.count({
      where: scope?.workspaceId ? { workspaceId: scope.workspaceId } : undefined,
    });
  },

  async getProject(projectId: string, scope?: ProjectScope) {
    const prisma = await getPrismaClient();
    const project = await prisma.project.findFirst({
      where: workspaceWhere(projectId, scope),
      select: { output: true },
    });

    return project ? toProject(project) : null;
  },

  async updateProjectArtifact(
    projectId: string,
    key: EditableArtifactKey,
    content: unknown,
    scope?: ProjectScope,
  ) {
    const prisma = await getPrismaClient();
    const existing = await prisma.project.findFirst({
      where: workspaceWhere(projectId, scope),
      select: { output: true },
    });

    if (!existing) {
      return null;
    }

    const updatedProject = updateEditableArtifact(toProject(existing), key, content);

    await prisma.project.update({
      where: { id: projectId },
      data: {
        title: projectTitle(updatedProject),
        output: toInputJson(updatedProject),
        artifacts: {
          deleteMany: { type: key },
          create: {
            type: key,
            title: key,
            content: toInputJson(content),
          },
        },
      },
    });

    return updatedProject;
  },

  async listRuns(scope?: ProjectScope) {
    const prisma = await getPrismaClient();
    const runs = await prisma.agentRun.findMany({
      where: scope?.workspaceId ? { project: { workspaceId: scope.workspaceId } } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return runs.map(toRun);
  },
};
