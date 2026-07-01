import type { EditableArtifactKey } from "@/lib/omniagent/artifacts";
import { fileProjectRepository } from "@/lib/omniagent/storage/file-project-repository";
import type { ProjectRepository } from "@/lib/omniagent/storage/types";
import type { AgentRun, SaaSBuilderOutput } from "@/lib/omniagent/types";

export async function saveProject(
  project: SaaSBuilderOutput,
  run: Pick<AgentRun, "builder" | "provider" | "agents">,
) {
  return getProjectRepository().saveProject(project, run);
}

export async function listProjects() {
  return getProjectRepository().listProjects();
}

export async function getProject(projectId: string) {
  return getProjectRepository().getProject(projectId);
}

export async function updateProjectArtifact(
  projectId: string,
  key: EditableArtifactKey,
  content: unknown,
) {
  return getProjectRepository().updateProjectArtifact(projectId, key, content);
}

export async function listRuns() {
  return getProjectRepository().listRuns();
}

function getProjectRepository(): ProjectRepository {
  if (process.env.OMNIAGENT_STORAGE_DRIVER === "prisma") {
    return prismaRepositoryProxy;
  }

  return fileProjectRepository;
}

const prismaRepositoryProxy: ProjectRepository = {
  async saveProject(...args) {
    const { prismaProjectRepository } = await import("@/lib/omniagent/storage/prisma-project-repository");
    return prismaProjectRepository.saveProject(...args);
  },
  async listProjects() {
    const { prismaProjectRepository } = await import("@/lib/omniagent/storage/prisma-project-repository");
    return prismaProjectRepository.listProjects();
  },
  async getProject(...args) {
    const { prismaProjectRepository } = await import("@/lib/omniagent/storage/prisma-project-repository");
    return prismaProjectRepository.getProject(...args);
  },
  async updateProjectArtifact(...args) {
    const { prismaProjectRepository } = await import("@/lib/omniagent/storage/prisma-project-repository");
    return prismaProjectRepository.updateProjectArtifact(...args);
  },
  async listRuns() {
    const { prismaProjectRepository } = await import("@/lib/omniagent/storage/prisma-project-repository");
    return prismaProjectRepository.listRuns();
  },
};
