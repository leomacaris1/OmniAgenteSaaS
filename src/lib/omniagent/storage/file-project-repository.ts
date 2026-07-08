import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { updateEditableArtifact } from "@/lib/omniagent/artifacts";
import type { AgentRun, SaaSBuilderOutput } from "@/lib/omniagent/types";
import type {
  ProjectRepository,
  ProjectScope,
  SaveProjectRunInput,
  SaveRunInput,
} from "@/lib/omniagent/storage/types";
import { requireProjectScope } from "@/lib/omniagent/storage/types";

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

function isProjectInScope(project: SaaSBuilderOutput, scope: ProjectScope) {
  return project.workspaceId === scope.workspaceId;
}

export const fileProjectRepository: ProjectRepository = {
  async saveProject(project: SaaSBuilderOutput, run: SaveProjectRunInput, scope: ProjectScope) {
    const requiredScope = requireProjectScope(scope);
    const store = await readStore();
    const scopedProject = { ...project, workspaceId: requiredScope.workspaceId };
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

  async listProjects(scope: ProjectScope) {
    const requiredScope = requireProjectScope(scope);
    const store = await readStore();
    return store.projects.filter((project) => isProjectInScope(project, requiredScope));
  },

  async countProjects(scope: ProjectScope) {
    const requiredScope = requireProjectScope(scope);
    const store = await readStore();
    return store.projects.filter((project) => isProjectInScope(project, requiredScope)).length;
  },

  async getProject(projectId: string, scope: ProjectScope) {
    const requiredScope = requireProjectScope(scope);
    const store = await readStore();
    return store.projects.find((project) => project.id === projectId && isProjectInScope(project, requiredScope)) ?? null;
  },

  async updateProjectArtifact(projectId, key, content, scope) {
    const requiredScope = requireProjectScope(scope);
    const store = await readStore();
    const projectIndex = store.projects.findIndex(
      (project) => project.id === projectId && isProjectInScope(project, requiredScope),
    );

    if (projectIndex === -1) {
      return null;
    }

    const updatedProject = updateEditableArtifact(store.projects[projectIndex], key, content);
    store.projects[projectIndex] = updatedProject;
    await writeStore(store);
    return updatedProject;
  },

  async replaceProject(projectId, project, scope) {
    const requiredScope = requireProjectScope(scope);
    const store = await readStore();
    const projectIndex = store.projects.findIndex(
      (candidate) => candidate.id === projectId && isProjectInScope(candidate, requiredScope),
    );

    if (projectIndex === -1) {
      return null;
    }

    const scopedProject = { ...project, workspaceId: requiredScope.workspaceId };
    store.projects[projectIndex] = scopedProject;
    await writeStore(store);
    return scopedProject;
  },

  async saveRun(projectId: string, run: SaveRunInput) {
    const store = await readStore();
    const agentRun: AgentRun = {
      id: crypto.randomUUID(),
      projectId,
      createdAt: new Date().toISOString(),
      ...run,
    };

    store.runs = [agentRun, ...store.runs].slice(0, 100);
    await writeStore(store);
  },

  async listRuns(scope: ProjectScope) {
    const requiredScope = requireProjectScope(scope);
    const store = await readStore();
    const projectIds = new Set(store.projects.filter((project) => isProjectInScope(project, requiredScope)).map((project) => project.id));
    return store.runs.filter((run) => projectIds.has(run.projectId));
  },
};
