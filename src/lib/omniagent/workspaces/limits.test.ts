import { afterEach, describe, expect, it } from "vitest";
import {
  getProjectLimitForPlan,
  getWorkspaceUsage,
  PLAN_PROJECT_LIMITS,
  workspaceCanCreateProject,
} from "@/lib/omniagent/workspaces/limits";

describe("workspace pilot limits", () => {
  it("allows project creation below the limit", () => {
    const usage = getWorkspaceUsage(2, 5);

    expect(usage.remainingProjects).toBe(3);
    expect(workspaceCanCreateProject(usage)).toBe(true);
  });

  it("blocks project creation at the limit", () => {
    const usage = getWorkspaceUsage(5, 5);

    expect(usage.remainingProjects).toBe(0);
    expect(workspaceCanCreateProject(usage)).toBe(false);
  });

  it("never returns negative remaining projects", () => {
    const usage = getWorkspaceUsage(8, 5);

    expect(usage.remainingProjects).toBe(0);
  });
});

describe("getProjectLimitForPlan", () => {
  afterEach(() => {
    delete process.env.OMNIAGENT_PRIVATE_MVP_PROJECT_LIMIT;
  });

  it("resolves the founding-pilot limit", () => {
    expect(getProjectLimitForPlan("founding-pilot")).toBe(PLAN_PROJECT_LIMITS["founding-pilot"]);
  });

  it("falls back to the default plan for unknown plans", () => {
    expect(getProjectLimitForPlan("plan-inexistente")).toBe(PLAN_PROJECT_LIMITS["founding-pilot"]);
    expect(getProjectLimitForPlan(undefined)).toBe(PLAN_PROJECT_LIMITS["founding-pilot"]);
  });

  it("lets the env var override any plan", () => {
    process.env.OMNIAGENT_PRIVATE_MVP_PROJECT_LIMIT = "3";
    expect(getProjectLimitForPlan("founding-pilot")).toBe(3);
  });
});
