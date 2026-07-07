import type { EditableArtifactKey } from "@/lib/omniagent/artifacts";
import type { AgentRun, RunTelemetry, SaaSBuilderOutput } from "@/lib/omniagent/types";

export type SaveProjectRunInput = Pick<AgentRun, "builder" | "provider" | "agents"> & RunTelemetry;

export type SaveRunInput = SaveProjectRunInput & {
  status: AgentRun["status"];
};

export type ProjectScope = {
  workspaceId: string;
};

export function requireProjectScope(scope?: Partial<ProjectScope>): ProjectScope {
  if (!scope?.workspaceId) {
    throw new Error("workspace scope is required");
  }

  return { workspaceId: scope.workspaceId };
}

export type ProjectRepository = {
  saveProject(project: SaaSBuilderOutput, run: SaveProjectRunInput, scope: ProjectScope): Promise<void>;
  listProjects(scope: ProjectScope): Promise<SaaSBuilderOutput[]>;
  countProjects(scope: ProjectScope): Promise<number>;
  getProject(projectId: string, scope: ProjectScope): Promise<SaaSBuilderOutput | null>;
  updateProjectArtifact(
    projectId: string,
    key: EditableArtifactKey,
    content: unknown,
    scope: ProjectScope,
  ): Promise<SaaSBuilderOutput | null>;
  /** Rewrites a project's full output (used when input/idea and a section change together). */
  replaceProject(
    projectId: string,
    project: SaaSBuilderOutput,
    scope: ProjectScope,
  ): Promise<SaaSBuilderOutput | null>;
  /** Records an additional run (e.g. a section regeneration) for an existing project. */
  saveRun(projectId: string, run: SaveRunInput): Promise<void>;
  listRuns(scope: ProjectScope): Promise<AgentRun[]>;
};
