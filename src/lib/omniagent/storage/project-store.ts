import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AgentRun, SaaSBuilderOutput } from "@/lib/omniagent/types";

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

export async function saveProject(
  project: SaaSBuilderOutput,
  run: Pick<AgentRun, "builder" | "provider" | "agents">,
) {
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
}

export async function listProjects() {
  const store = await readStore();
  return store.projects;
}

export async function listRuns() {
  const store = await readStore();
  return store.runs;
}
