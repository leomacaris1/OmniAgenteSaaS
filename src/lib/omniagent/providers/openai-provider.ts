import OpenAI from "openai";
import { z } from "zod";
import { estimateCostUsd } from "@/lib/omniagent/providers/openai-cost";
import {
  planSchema,
  sectionSchemas,
  toWireJsonSchema,
} from "@/lib/omniagent/providers/plan-schema";
import { withRetries } from "@/lib/omniagent/providers/retry";
import type {
  GenerateSaaSPlanParams,
  ModelProvider,
  ProviderUsage,
  RegenerateSectionParams,
} from "@/lib/omniagent/providers/types";

let client: OpenAI | null = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required when OMNIAGENT_MODEL_PROVIDER=openai.");
  }

  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

function getModel() {
  return process.env.OPENAI_MODEL || "gpt-5.4-mini";
}

function toUsage(response: { usage?: { input_tokens?: number; output_tokens?: number } | null }): ProviderUsage {
  const inputTokens = response.usage?.input_tokens;
  const outputTokens = response.usage?.output_tokens;

  return {
    inputTokens,
    outputTokens,
    costUsd: estimateCostUsd(inputTokens, outputTokens),
  };
}

async function createStructuredResponse(params: {
  systemPrompt: string;
  userContent: string;
  schemaName: string;
  wireSchema: Record<string, unknown>;
}) {
  return withRetries(() =>
    getOpenAIClient().responses.create({
      model: getModel(),
      input: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userContent },
      ],
      text: {
        format: {
          type: "json_schema",
          name: params.schemaName,
          schema: params.wireSchema,
          strict: true,
        },
      },
    }),
  );
}

export const openAIProvider: ModelProvider = {
  name: "openai",

  async generateSaaSPlan({ input, systemPrompt }: GenerateSaaSPlanParams) {
    const response = await createStructuredResponse({
      systemPrompt,
      userContent: JSON.stringify({
        task: "Generate an OmniAgent SaaS Builder plan",
        input,
      }),
      schemaName: "saas_builder_plan",
      wireSchema: toWireJsonSchema(planSchema),
    });

    return {
      plan: planSchema.parse(JSON.parse(response.output_text)),
      usage: toUsage(response),
    };
  },

  async regenerateSection({ input, artifactKey, currentContent, systemPrompt }: RegenerateSectionParams) {
    const sectionSchema = sectionSchemas[artifactKey];
    // json_schema requires an object root; array sections get wrapped.
    const wrappedSchema = z.object({ content: sectionSchema });

    const response = await createStructuredResponse({
      systemPrompt,
      userContent: JSON.stringify({
        task: `Regenerate only the "${artifactKey}" section of an existing OmniAgent SaaS Builder plan. Return a materially improved version, keeping it consistent with the project input.`,
        input,
        currentContent,
      }),
      schemaName: `saas_builder_section_${artifactKey}`,
      wireSchema: toWireJsonSchema(wrappedSchema),
    });

    const parsed = wrappedSchema.parse(JSON.parse(response.output_text));

    return {
      content: parsed.content,
      usage: toUsage(response),
    };
  },
};
