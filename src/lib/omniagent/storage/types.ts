import type { EditableArtifactKey } from "@/lib/omniagent/artifacts";
import type { AgentRun, SaaSBuilderOutput } from "@/lib/omniagent/types";

export type SaveProjectRunInput = Pick<AgentRun, "builder" | "provider" | "agents">;

export type ProjectRepository = {
  saveProject(project: SaaSBuilderOutput, run: SaveProjectRunInput): Promise<void>;
  listProjects(): Promise<SaaSBuilderOutput[]>;
  getProject(projectId: string): Promise<SaaSBuilderOutput | null>;
  updateProjectArtifact(
    projectId: string,
    key: EditableArtifactKey,
    content: unknown,
  ): Promise<SaaSBuilderOutput | null>;
  listRuns(): Promise<AgentRun[]>;
};
