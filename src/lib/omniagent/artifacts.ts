import type { SaaSBuilderOutput } from "@/lib/omniagent/types";

export type EditableArtifactKey =
  | "validation"
  | "backlog"
  | "landing"
  | "pricing"
  | "launch"
  | "customers";

export type EditableArtifact = {
  key: EditableArtifactKey;
  title: string;
  description: string;
  content: unknown;
};

export const editableArtifactKeys: EditableArtifactKey[] = [
  "validation",
  "backlog",
  "landing",
  "pricing",
  "launch",
  "customers",
];

const artifactMeta: Record<EditableArtifactKey, Pick<EditableArtifact, "title" | "description">> = {
  validation: {
    title: "Validacion del nicho",
    description: "Score, senales de mercado, riesgos y resumen comercial.",
  },
  backlog: {
    title: "Backlog MVP",
    description: "Tareas de construccion con responsables y criterios de aceptacion.",
  },
  landing: {
    title: "Landing page",
    description: "Headline, subheadline, CTA y secciones iniciales.",
  },
  pricing: {
    title: "Pricing",
    description: "Planes, precio, segmento objetivo e inclusiones.",
  },
  launch: {
    title: "Plan de lanzamiento",
    description: "Acciones dia por dia para conseguir senales en 7 dias.",
  },
  customers: {
    title: "Primeros clientes",
    description: "Plan de prospeccion y riesgos principales.",
  },
};

export function getEditableArtifacts(project: SaaSBuilderOutput): EditableArtifact[] {
  return editableArtifactKeys.map((key) => ({
    key,
    ...artifactMeta[key],
    content: getArtifactContent(project, key),
  }));
}

/// The subset of plan fields artifacts are extracted from — satisfied both by
/// a persisted SaaSBuilderOutput and by a provider's freshly generated plan.
export type ArtifactSource = Pick<
  SaaSBuilderOutput,
  "nicheValidation" | "backlog" | "landingPage" | "pricing" | "launchPlan7Days" | "firstCustomerPlan" | "risks"
>;

export function getArtifactContent(project: ArtifactSource, key: EditableArtifactKey) {
  switch (key) {
    case "validation":
      return project.nicheValidation;
    case "backlog":
      return project.backlog;
    case "landing":
      return project.landingPage;
    case "pricing":
      return project.pricing;
    case "launch":
      return project.launchPlan7Days;
    case "customers":
      return {
        firstCustomerPlan: project.firstCustomerPlan,
        risks: project.risks,
      };
    default:
      throw new Error("Unsupported artifact key");
  }
}

export function updateEditableArtifact(
  project: SaaSBuilderOutput,
  key: EditableArtifactKey,
  content: unknown,
): SaaSBuilderOutput {
  switch (key) {
    case "validation":
      return { ...project, nicheValidation: content as SaaSBuilderOutput["nicheValidation"] };
    case "backlog":
      return { ...project, backlog: content as SaaSBuilderOutput["backlog"] };
    case "landing":
      return { ...project, landingPage: content as SaaSBuilderOutput["landingPage"] };
    case "pricing":
      return { ...project, pricing: content as SaaSBuilderOutput["pricing"] };
    case "launch":
      return { ...project, launchPlan7Days: content as SaaSBuilderOutput["launchPlan7Days"] };
    case "customers": {
      const customerContent = content as Pick<SaaSBuilderOutput, "firstCustomerPlan" | "risks">;
      return {
        ...project,
        firstCustomerPlan: customerContent.firstCustomerPlan,
        risks: customerContent.risks,
      };
    }
    default:
      throw new Error("Unsupported artifact key");
  }
}

export function isEditableArtifactKey(key: string): key is EditableArtifactKey {
  return editableArtifactKeys.includes(key as EditableArtifactKey);
}
