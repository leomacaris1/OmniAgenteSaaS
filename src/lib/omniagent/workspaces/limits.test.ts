import { describe, expect, it } from "vitest";
import { getWorkspaceUsage, workspaceCanCreateProject } from "@/lib/omniagent/workspaces/limits";

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
