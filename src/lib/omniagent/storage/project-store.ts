import type { EditableArtifactKey } from "@/lib/omniagent/artifacts";
import { fileProjectRepository } from "@/lib/omniagent/storage/file-project-repository";
import type { ProjectRepository, ProjectScope } from "@/lib/omniagent/storage/types";
import type { AgentRun, SaaSBuilderOutput } from "@/lib/omniagent/types";

export async function saveProject(
  project: SaaSBuilderOutput,
  run: Pick<AgentRun, "builder" | "provider" | "agents">,
  scope?: ProjectScope,
) {
  return getProjectRepository().saveProject(project, run, scope);
}

export async function listProjects(scope?: ProjectScope) {
  return getProjectRepository().listProjects(scope);
}

export async function countProjects(scope?: ProjectScope) {
  return getProjectRepository().countProjects(scope);
}

export async function getProject(projectId: string, scope?: ProjectScope) {
  return getProjectRepository().getProject(projectId, scope);
}

export async function updateProjectArtifact(
  projectId: string,
  key: EditableArtifactKey,
  content: unknown,
  scope?: ProjectScope,
) {
  return getProjectRepository().updateProjectArtifact(projectId, key, content, scope);
}

export async function listRuns(scope?: ProjectScope) {
  return getProjectRepository().listRuns(scope);
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
  async listProjects(...args) {
    const { prismaProjectRepository } = await import("@/lib/omniagent/storage/prisma-project-repository");
    return prismaProjectRepository.listProjects(...args);
  },
  async countProjects(...args) {
    const { prismaProjectRepository } = await import("@/lib/omniagent/storage/prisma-project-repository");
    return prismaProjectRepository.countProjects(...args);
  },
  async getProject(...args) {
    const { prismaProjectRepository } = await import("@/lib/omniagent/storage/prisma-project-repository");
    return prismaProjectRepository.getProject(...args);
  },
  async updateProjectArtifact(...args) {
    const { prismaProjectRepository } = await import("@/lib/omniagent/storage/prisma-project-repository");
    return prismaProjectRepository.updateProjectArtifact(...args);
  },
  async listRuns(...args) {
    const { prismaProjectRepository } = await import("@/lib/omniagent/storage/prisma-project-repository");
    return prismaProjectRepository.listRuns(...args);
  },
};
