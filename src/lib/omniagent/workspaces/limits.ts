export type WorkspaceUsage = {
  projectCount: number;
  projectLimit: number;
  remainingProjects: number;
};

export const DEFAULT_PRIVATE_MVP_PROJECT_LIMIT = 5;

export function getPrivateMvpProjectLimit() {
  const parsedLimit = Number.parseInt(process.env.OMNIAGENT_PRIVATE_MVP_PROJECT_LIMIT ?? "", 10);
  return Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : DEFAULT_PRIVATE_MVP_PROJECT_LIMIT;
}

export function getWorkspaceUsage(projectCount: number, projectLimit = getPrivateMvpProjectLimit()): WorkspaceUsage {
  return {
    projectCount,
    projectLimit,
    remainingProjects: Math.max(projectLimit - projectCount, 0),
  };
}

export function workspaceCanCreateProject(usage: WorkspaceUsage) {
  return usage.projectCount < usage.projectLimit;
}
