import OpenAI from "openai";
import { z } from "zod";
import type { ModelProvider } from "@/lib/omniagent/providers/types";

const planSchema = z.object({
  nicheValidation: z.object({
    verdict: z.enum(["promising", "needs-focus", "risky"]),
    score: z.number().min(0).max(100),
    summary: z.string(),
    marketSignals: z.array(z.object({
      label: z.string(),
      strength: z.enum(["low", "medium", "high"]),
      rationale: z.string(),
    })),
  }),
  valueProposition: z.string(),
  targetUsers: z.array(z.string()),
  mvpFeatures: z.array(z.object({
    name: z.string(),
    priority: z.enum(["P0", "P1", "P2"]),
    owner: z.enum(["ceo", "research", "business-analyst", "developer", "design", "marketing", "copywriter", "sales", "automation", "qa"]),
    outcome: z.string(),
  })),
  technicalArchitecture: z.object({
    stack: z.array(z.string()),
    modules: z.array(z.string()),
    dataModel: z.array(z.string()),
    integrations: z.array(z.string()),
  }),
  backlog: z.array(z.object({
    id: z.string(),
    title: z.string(),
    agent: z.enum(["ceo", "research", "business-analyst", "developer", "design", "marketing", "copywriter", "sales", "automation", "qa"]),
    estimateDays: z.number(),
    acceptanceCriteria: z.array(z.string()),
  })),
  landingPage: z.object({
    headline: z.string(),
    subheadline: z.string(),
    primaryCta: z.string(),
    sections: z.array(z.object({ title: z.string(), body: z.string() })),
  }),
  pricing: z.array(z.object({
    name: z.string(),
    price: z.string(),
    target: z.string(),
    includes: z.array(z.string()),
  })),
  launchPlan7Days: z.array(z.object({
    day: z.number(),
    goal: z.string(),
    actions: z.array(z.string()),
  })),
  firstCustomerPlan: z.array(z.string()),
  risks: z.array(z.string()),
});

let client: OpenAI | null = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required when OMNIAGENT_MODEL_PROVIDER=openai.");
  }

  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

export const openAIProvider: ModelProvider = {
  name: "openai",
  async generateSaaSPlan({ input, systemPrompt }) {
    const response = await getOpenAIClient().responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      input: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            task: "Generate an OmniAgent SaaS Builder plan",
            input,
          }),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "saas_builder_plan",
          schema: z.toJSONSchema(planSchema),
          strict: true,
        },
      },
    });

    return planSchema.parse(JSON.parse(response.output_text));
  },
};
