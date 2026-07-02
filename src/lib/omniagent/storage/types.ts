import type { EditableArtifactKey } from "@/lib/omniagent/artifacts";
import type { AgentRun, SaaSBuilderOutput } from "@/lib/omniagent/types";

export type SaveProjectRunInput = Pick<AgentRun, "builder" | "provider" | "agents">;
export type ProjectScope = {
  workspaceId?: string;
};

export type ProjectRepository = {
  saveProject(project: SaaSBuilderOutput, run: SaveProjectRunInput, scope?: ProjectScope): Promise<void>;
  listProjects(scope?: ProjectScope): Promise<SaaSBuilderOutput[]>;
  countProjects(scope?: ProjectScope): Promise<number>;
  getProject(projectId: string, scope?: ProjectScope): Promise<SaaSBuilderOutput | null>;
  updateProjectArtifact(
    projectId: string,
    key: EditableArtifactKey,
    content: unknown,
    scope?: ProjectScope,
  ): Promise<SaaSBuilderOutput | null>;
  listRuns(scope?: ProjectScope): Promise<AgentRun[]>;
};
