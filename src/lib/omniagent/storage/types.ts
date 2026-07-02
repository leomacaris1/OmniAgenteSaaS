import type { EditableArtifactKey } from "@/lib/omniagent/artifacts";
import type { AgentRun, SaaSBuilderOutput } from "@/lib/omniagent/types";

export type SaveProjectRunInput = Pick<AgentRun, "builder" | "provider" | "agents"> & {
  // Optional: callers (like runSaaSBuilder) don't have a session/org to pass
  // yet. The Prisma repository resolves a default organization when omitted;
  // once auth lands, callers should start passing the real org from session.
  organizationId?: string;
  createdByUserId?: string;
};

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
