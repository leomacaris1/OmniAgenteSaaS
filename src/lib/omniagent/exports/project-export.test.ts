import { describe, expect, it } from "vitest";
import {
  formatBacklogCopy,
  formatLandingCopy,
  formatProjectMarkdown,
} from "@/lib/omniagent/exports/project-export";
import type { SaaSBuilderOutput } from "@/lib/omniagent/types";

const project: SaaSBuilderOutput = {
  id: "project-1",
  workspaceId: "workspace-1",
  createdAt: "2026-07-02T20:00:00.000Z",
  provider: "local",
  promptVersion: "saas-builder.v1",
  input: {
    idea: "SaaS para estudios contables",
    audience: "Estudios contables pequenos",
    region: "LatAm",
    constraints: "MVP en 7 dias",
  },
  nicheValidation: {
    verdict: "promising",
    score: 82,
    summary: "Hay dolor claro y comprador definido.",
    marketSignals: [
      { label: "Dolor recurrente", strength: "high", rationale: "Seguimiento manual repetitivo." },
    ],
  },
  valueProposition: "Automatiza seguimiento y documentacion mensual.",
  targetUsers: ["Contadores", "Duenos de estudios"],
  mvpFeatures: [
    { name: "Panel de clientes", priority: "P0", owner: "developer", outcome: "Centralizar seguimiento." },
  ],
  technicalArchitecture: {
    stack: ["Next.js", "Supabase"],
    modules: ["Auth", "Projects"],
    dataModel: ["Workspace", "Project"],
    integrations: ["Email"],
  },
  backlog: [
    {
      id: "OA-1",
      title: "Crear panel inicial",
      agent: "developer",
      estimateDays: 1,
      acceptanceCriteria: ["Lista clientes", "Filtra pendientes"],
    },
  ],
  landingPage: {
    headline: "Seguimiento contable sin friccion",
    subheadline: "Organiza documentos y recordatorios.",
    primaryCta: "Solicitar demo",
    sections: [{ title: "Control", body: "Visibilidad semanal." }],
  },
  pricing: [{ name: "Pilot", price: "USD 99", target: "Primeros usuarios", includes: ["Setup"] }],
  launchPlan7Days: [{ day: 1, goal: "Validar", actions: ["Contactar 10 estudios"] }],
  firstCustomerPlan: ["Lista de prospectos", "Oferta piloto"],
  risks: ["Integraciones contables"],
};

describe("project export", () => {
  it("formats a project into a useful markdown asset", () => {
    const markdown = formatProjectMarkdown(project);

    expect(markdown).toContain("# Seguimiento contable sin friccion");
    expect(markdown).toContain("## Backlog MVP");
    expect(markdown).toContain("- **OA-1** Crear panel inicial");
    expect(markdown).toContain("## Pricing");
    expect(markdown).toContain("USD 99");
  });

  it("formats landing copy as plain sales text", () => {
    const copy = formatLandingCopy(project.landingPage);

    expect(copy).toContain("Seguimiento contable sin friccion");
    expect(copy).toContain("[Solicitar demo]");
    expect(copy).toContain("## Control");
    expect(copy).not.toContain("Headline:");
  });

  it("formats backlog copy ready for a task manager", () => {
    const copy = formatBacklogCopy(project.backlog);

    expect(copy).toContain("OA-1 — Crear panel inicial (1d, developer)");
    expect(copy).toContain("  - Lista clientes");
  });
});
