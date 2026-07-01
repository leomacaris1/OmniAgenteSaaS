import { describe, expect, it } from "vitest";
import {
  getEditableArtifacts,
  updateEditableArtifact,
  type EditableArtifactKey,
} from "@/lib/omniagent/artifacts";
import type { SaaSBuilderOutput } from "@/lib/omniagent/types";

const project: SaaSBuilderOutput = {
  id: "project-1",
  createdAt: "2026-06-30T00:00:00.000Z",
  provider: "local",
  promptVersion: "saas-builder.v1",
  input: { idea: "Vertical CRM for clinics" },
  nicheValidation: {
    verdict: "promising",
    score: 80,
    summary: "Strong niche",
    marketSignals: [],
  },
  valueProposition: "Focused value proposition",
  targetUsers: ["Clinic owner"],
  mvpFeatures: [],
  technicalArchitecture: {
    stack: ["Next.js"],
    modules: ["Builder"],
    dataModel: ["Project"],
    integrations: ["OpenAI"],
  },
  backlog: [],
  landingPage: {
    headline: "Clinic CRM",
    subheadline: "Recover missed appointments",
    primaryCta: "Book demo",
    sections: [],
  },
  pricing: [],
  launchPlan7Days: [],
  firstCustomerPlan: ["Interview 10 clinics"],
  risks: ["Too broad"],
};

describe("editable artifacts", () => {
  it("returns the SaaS Builder artifacts that should become project assets", () => {
    const artifacts = getEditableArtifacts(project);

    expect(artifacts.map((artifact) => artifact.key)).toEqual([
      "validation",
      "backlog",
      "landing",
      "pricing",
      "launch",
      "customers",
    ]);
  });

  it("updates an editable artifact without mutating the original project", () => {
    const updated = updateEditableArtifact(project, "landing", {
      headline: "Clinic Growth OS",
      subheadline: "Recover revenue from missed appointments",
      primaryCta: "Start pilot",
      sections: [],
    });

    expect(updated.landingPage.headline).toBe("Clinic Growth OS");
    expect(project.landingPage.headline).toBe("Clinic CRM");
  });

  it("rejects invalid artifact keys", () => {
    expect(() =>
      updateEditableArtifact(project, "unknown" as EditableArtifactKey, {}),
    ).toThrow("Unsupported artifact key");
  });
});
