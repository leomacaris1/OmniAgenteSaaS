import { describe, expect, it } from "vitest";
import { requireProjectScope } from "@/lib/omniagent/storage/types";

describe("requireProjectScope", () => {
  it("returns a valid workspace scope", () => {
    expect(requireProjectScope({ workspaceId: "workspace-1" })).toEqual({
      workspaceId: "workspace-1",
    });
  });

  it("rejects missing workspace scopes", () => {
    expect(() => requireProjectScope()).toThrow("workspace scope is required");
    expect(() => requireProjectScope({ workspaceId: "" })).toThrow("workspace scope is required");
  });
});
