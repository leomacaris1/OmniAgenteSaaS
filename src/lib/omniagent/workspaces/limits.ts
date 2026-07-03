export type WorkspaceUsage = {
  projectCount: number;
  projectLimit: number;
  remainingProjects: number;
};

export const DEFAULT_PLAN = "founding-pilot";

// Límite de proyectos por plan comercial. Sin billing todavía: todo workspace
// nace como founding-pilot. OMNIAGENT_PRIVATE_MVP_PROJECT_LIMIT (env) pisa a
// cualquier plan — pensado para desarrollo y pruebas, no para producción.
export const PLAN_PROJECT_LIMITS: Record<string, number> = {
  "founding-pilot": 20,
};

export const DEFAULT_PRIVATE_MVP_PROJECT_LIMIT = PLAN_PROJECT_LIMITS[DEFAULT_PLAN];

export function getProjectLimitForPlan(plan?: string) {
  const envOverride = Number.parseInt(process.env.OMNIAGENT_PRIVATE_MVP_PROJECT_LIMIT ?? "", 10);

  if (Number.isFinite(envOverride) && envOverride > 0) {
    return envOverride;
  }

  return PLAN_PROJECT_LIMITS[plan ?? DEFAULT_PLAN] ?? PLAN_PROJECT_LIMITS[DEFAULT_PLAN];
}

export function getWorkspaceUsage(
  projectCount: number,
  projectLimit = getProjectLimitForPlan(),
): WorkspaceUsage {
  return {
    projectCount,
    projectLimit,
    remainingProjects: Math.max(projectLimit - projectCount, 0),
  };
}

export function workspaceCanCreateProject(usage: WorkspaceUsage) {
  return usage.projectCount < usage.projectLimit;
}
