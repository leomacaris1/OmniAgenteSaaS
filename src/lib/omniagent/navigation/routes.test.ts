import { describe, expect, it } from "vitest";
import { appRoutes, isPublicRoute } from "@/lib/omniagent/navigation/routes";

describe("appRoutes", () => {
  it("keeps the marketing site public and the command center private", () => {
    expect(appRoutes.marketing).toBe("/");
    expect(appRoutes.commandCenter).toBe("/app");
    expect(appRoutes.login).toBe("/login");
  });

  it("only treats the marketing and login routes as public", () => {
    expect(isPublicRoute("/")).toBe(true);
    expect(isPublicRoute("/login")).toBe(true);
    expect(isPublicRoute("/app")).toBe(false);
    expect(isPublicRoute("/projects/demo")).toBe(false);
  });
});
