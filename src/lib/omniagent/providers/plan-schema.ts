import { z } from "zod";
import type { EditableArtifactKey } from "@/lib/omniagent/artifacts";

const agentRoleSchema = z.enum([
  "ceo",
  "research",
  "business-analyst",
  "developer",
  "design",
  "marketing",
  "copywriter",
  "sales",
  "automation",
  "qa",
]);

const marketSignalSchema = z.object({
  label: z.string().min(3),
  strength: z.enum(["low", "medium", "high"]),
  rationale: z.string().min(20),
});

export const nicheValidationSchema = z.object({
  verdict: z.enum(["promising", "needs-focus", "risky"]),
  score: z.number().min(0).max(100),
  summary: z.string().min(40),
  marketSignals: z.array(marketSignalSchema).min(3),
});

const mvpFeatureSchema = z.object({
  name: z.string().min(3),
  priority: z.enum(["P0", "P1", "P2"]),
  owner: agentRoleSchema,
  outcome: z.string().min(10),
});

const backlogItemSchema = z.object({
  id: z.string().min(3),
  title: z.string().min(5),
  agent: agentRoleSchema,
  estimateDays: z.number().min(0.5).max(30),
  acceptanceCriteria: z.array(z.string().min(5)).min(2),
});

const landingPageSchema = z.object({
  headline: z.string().min(5),
  subheadline: z.string().min(10),
  primaryCta: z.string().min(3),
  sections: z.array(z.object({ title: z.string().min(3), body: z.string().min(20) })).min(3),
});

const pricingPlanSchema = z.object({
  name: z.string().min(2),
  price: z.string().min(2),
  target: z.string().min(5),
  includes: z.array(z.string().min(3)).min(2),
});

const launchStepSchema = z.object({
  day: z.number().min(1).max(7),
  goal: z.string().min(5),
  actions: z.array(z.string().min(5)).min(2),
});

const customersSectionSchema = z.object({
  firstCustomerPlan: z.array(z.string().min(10)).min(3),
  risks: z.array(z.string().min(10)).min(2),
});

export const planSchema = z.object({
  nicheValidation: nicheValidationSchema,
  valueProposition: z.string().min(30),
  targetUsers: z.array(z.string().min(5)).min(2),
  mvpFeatures: z.array(mvpFeatureSchema).min(3),
  technicalArchitecture: z.object({
    stack: z.array(z.string()).min(3),
    modules: z.array(z.string()).min(3),
    dataModel: z.array(z.string()).min(2),
    integrations: z.array(z.string()).min(1),
  }),
  backlog: z.array(backlogItemSchema).min(3),
  landingPage: landingPageSchema,
  pricing: z.array(pricingPlanSchema).min(2),
  launchPlan7Days: z.array(launchStepSchema).min(5).max(7),
  firstCustomerPlan: z.array(z.string().min(10)).min(3),
  risks: z.array(z.string().min(10)).min(2),
});

export const sectionSchemas: Record<EditableArtifactKey, z.ZodType> = {
  validation: nicheValidationSchema,
  backlog: z.array(backlogItemSchema).min(3),
  landing: landingPageSchema,
  pricing: z.array(pricingPlanSchema).min(2),
  launch: z.array(launchStepSchema).min(5).max(7),
  customers: customersSectionSchema,
};

// OpenAI structured outputs accept a JSON Schema subset; size/range keywords
// can be rejected by the API. We strip them from the wire schema and enforce
// them app-side by parsing the response with the full zod schema instead.
const UNSUPPORTED_WIRE_KEYS = [
  "minItems",
  "maxItems",
  "minimum",
  "maximum",
  "exclusiveMinimum",
  "exclusiveMaximum",
  "minLength",
  "maxLength",
];

export function sanitizeWireSchema(node: unknown): unknown {
  if (Array.isArray(node)) {
    return node.map(sanitizeWireSchema);
  }

  if (node && typeof node === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      if (UNSUPPORTED_WIRE_KEYS.includes(key)) {
        continue;
      }
      result[key] = sanitizeWireSchema(value);
    }
    return result;
  }

  return node;
}

export function toWireJsonSchema(schema: z.ZodType) {
  return sanitizeWireSchema(z.toJSONSchema(schema)) as Record<string, unknown>;
}
