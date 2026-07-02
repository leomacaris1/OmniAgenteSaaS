import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { updateEditableArtifact } from "@/lib/omniagent/artifacts";
import type { AgentRun, SaaSBuilderOutput } from "@/lib/omniagent/types";
import type { ProjectRepository, ProjectScope, SaveProjectRunInput } from "@/lib/omniagent/storage/types";

type OmniAgentStore = {
  projects: SaaSBuilderOutput[];
  runs: AgentRun[];
};

const dataDir = path.join(process.cwd(), "data");
const storePath = path.join(dataDir, "omniagent.json");

async function readStore(): Promise<OmniAgentStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    return JSON.parse(raw) as OmniAgentStore;
  } catch {
    return { projects: [], runs: [] };
  }
}

async function writeStore(store: OmniAgentStore) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

function isProjectInScope(project: SaaSBuilderOutput, scope?: ProjectScope) {
  return !scope?.workspaceId || project.workspaceId === scope.workspaceId;
}

export const fileProjectRepository: ProjectRepository = {
  async saveProject(project: SaaSBuilderOutput, run: SaveProjectRunInput, scope?: ProjectScope) {
    const store = await readStore();
    const scopedProject = scope?.workspaceId ? { ...project, workspaceId: scope.workspaceId } : project;
    const agentRun: AgentRun = {
      id: crypto.randomUUID(),
      projectId: scopedProject.id,
      createdAt: new Date().toISOString(),
      status: "completed",
      ...run,
    };

    store.projects = [scopedProject, ...store.projects].slice(0, 50);
    store.runs = [agentRun, ...store.runs].slice(0, 100);
    await writeStore(store);
  },

  async listProjects(scope?: ProjectScope) {
    const store = await readStore();
    return store.projects.filter((project) => isProjectInScope(project, scope));
  },

  async getProject(projectId: string, scope?: ProjectScope) {
    const store = await readStore();
    return store.projects.find((project) => project.id === projectId && isProjectInScope(project, scope)) ?? null;
  },

  async updateProjectArtifact(projectId, key, content, scope) {
    const store = await readStore();
    const projectIndex = store.projects.findIndex(
      (project) => project.id === projectId && isProjectInScope(project, scope),
    );

    if (projectIndex === -1) {
      return null;
    }

    const updatedProject = updateEditableArtifact(store.projects[projectIndex], key, content);
    store.projects[projectIndex] = updatedProject;
    await writeStore(store);
    return updatedProject;
  },

  async listRuns(scope?: ProjectScope) {
    const store = await readStore();
    if (!scope?.workspaceId) {
      return store.runs;
    }

    const projectIds = new Set(store.projects.filter((project) => isProjectInScope(project, scope)).map((project) => project.id));
    return store.runs.filter((run) => projectIds.has(run.projectId));
  },
};
