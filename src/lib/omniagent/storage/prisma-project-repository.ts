import { updateEditableArtifact, type EditableArtifactKey } from "@/lib/omniagent/artifacts";
import type { AgentRun, SaaSBuilderOutput } from "@/lib/omniagent/types";
import type { ProjectRepository, SaveProjectRunInput } from "@/lib/omniagent/storage/types";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";

let prismaClient: PrismaClient | null = null;

async function getPrismaClient() {
  if (!prismaClient) {
    const { PrismaClient } = await import("@/generated/prisma/client");
    prismaClient = new PrismaClient();
  }

  return prismaClient;
}

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
  async saveProject(project: SaaSBuilderOutput, run: SaveProjectRunInput) {
    const prisma = await getPrismaClient();

    await prisma.$transaction(async (tx) => {
      await tx.project.create({
        data: {
          id: project.id,
          title: projectTitle(project),
          idea: project.input.idea,
          audience: project.input.audience,
          region: project.input.region,
          constraints: project.input.constraints,
          provider: project.provider,
          promptVersion: project.promptVersion,
          output: toInputJson(project),
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

    await writeArtifacts(project.id, project, prisma);
  },

  async listProjects() {
    const prisma = await getPrismaClient();
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { output: true },
    });

    return projects.map(toProject);
  },

  async getProject(projectId: string) {
    const prisma = await getPrismaClient();
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { output: true },
    });

    return project ? toProject(project) : null;
  },

  async updateProjectArtifact(projectId: string, key: EditableArtifactKey, content: unknown) {
    const prisma = await getPrismaClient();
    const existing = await prisma.project.findUnique({
      where: { id: projectId },
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

  async listRuns() {
    const prisma = await getPrismaClient();
    const runs = await prisma.agentRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return runs.map(toRun);
  },
};
