import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { updateEditableArtifact } from "@/lib/omniagent/artifacts";
import type { AgentRun, SaaSBuilderOutput } from "@/lib/omniagent/types";
import type { ProjectRepository, SaveProjectRunInput } from "@/lib/omniagent/storage/types";

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

export const fileProjectRepository: ProjectRepository = {
  async saveProject(project: SaaSBuilderOutput, run: SaveProjectRunInput) {
    const store = await readStore();
    const agentRun: AgentRun = {
      id: crypto.randomUUID(),
      projectId: project.id,
      createdAt: new Date().toISOString(),
      status: "completed",
      ...run,
    };

    store.projects = [project, ...store.projects].slice(0, 50);
    store.runs = [agentRun, ...store.runs].slice(0, 100);
    await writeStore(store);
  },

  async listProjects() {
    const store = await readStore();
    return store.projects;
  },

  async getProject(projectId: string) {
    const store = await readStore();
    return store.projects.find((project) => project.id === projectId) ?? null;
  },

  async updateProjectArtifact(projectId, key, content) {
    const store = await readStore();
    const projectIndex = store.projects.findIndex((project) => project.id === projectId);

    if (projectIndex === -1) {
      return null;
    }

    const updatedProject = updateEditableArtifact(store.projects[projectIndex], key, content);
    store.projects[projectIndex] = updatedProject;
    await writeStore(store);
    return updatedProject;
  },

  async listRuns() {
    const store = await readStore();
    return store.runs;
  },
};
