import { describe, expect, it } from "vitest";
import { localProvider } from "@/lib/omniagent/providers/local-provider";

describe("localProvider sensitive education ideas", () => {
  it("frames ADHD children content as educational support, not medical treatment", async () => {
    const { plan } = await localProvider.generateSaaSPlan({
      input: {
        idea: "Crear contenido digital e interactivo para ninos con TDAH",
        audience: "padres, docentes y psicopedagogos",
        region: "LatAm",
      },
      promptVersion: "saas-builder.v2",
      systemPrompt: "test",
    });

    const combined = [
      plan.nicheValidation.summary,
      plan.valueProposition,
      ...plan.targetUsers,
      ...plan.technicalArchitecture.modules,
      ...plan.technicalArchitecture.integrations,
      ...plan.risks,
    ].join(" ").toLowerCase();

    expect(plan.nicheValidation.verdict).toBe("needs-focus");
    expect(combined).toContain("tdah");
    expect(combined).toContain("educativo");
    expect(combined).toContain("padres");
    expect(combined).toContain("docentes");
    expect(combined).toContain("profesionales");
    expect(combined).toContain("no sustituir");
    expect(combined).toContain("tratamiento");
    expect(combined).toContain("privacidad");
  });
});
