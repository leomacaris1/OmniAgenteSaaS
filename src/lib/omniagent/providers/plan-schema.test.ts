import { describe, expect, it } from "vitest";
import {
  planSchema,
  sanitizeWireSchema,
  sectionSchemas,
  toWireJsonSchema,
} from "@/lib/omniagent/providers/plan-schema";
import { localProvider } from "@/lib/omniagent/providers/local-provider";
import { editableArtifactKeys } from "@/lib/omniagent/artifacts";

describe("planSchema", () => {
  it("accepts the local provider output", async () => {
    const { plan } = await localProvider.generateSaaSPlan({
      input: { idea: "Plataforma de seguimiento comercial para agencias" },
      promptVersion: "saas-builder.v2",
      systemPrompt: "test",
    });

    expect(() => planSchema.parse(plan)).not.toThrow();
  });

  it("has a section schema for every editable artifact", () => {
    for (const key of editableArtifactKeys) {
      expect(sectionSchemas[key]).toBeDefined();
    }
  });

  it("validates local provider section content for every key", async () => {
    for (const key of editableArtifactKeys) {
      const { content } = await localProvider.regenerateSection({
        input: { idea: "Plataforma de seguimiento comercial para agencias" },
        artifactKey: key,
        currentContent: null,
        promptVersion: "saas-builder.v2",
        systemPrompt: "test",
      });

      expect(() => sectionSchemas[key].parse(content), `section ${key}`).not.toThrow();
    }
  });
});

describe("sanitizeWireSchema", () => {
  it("strips size and range keywords recursively", () => {
    const sanitized = sanitizeWireSchema({
      type: "object",
      properties: {
        score: { type: "number", minimum: 0, maximum: 100 },
        items: { type: "array", minItems: 3, items: { type: "string", minLength: 5 } },
      },
    }) as {
      properties: {
        score: Record<string, unknown>;
        items: Record<string, unknown> & { items: Record<string, unknown> };
      };
    };

    expect(sanitized.properties.score.minimum).toBeUndefined();
    expect(sanitized.properties.score.maximum).toBeUndefined();
    expect(sanitized.properties.items.minItems).toBeUndefined();
    expect(sanitized.properties.items.items.minLength).toBeUndefined();
  });

  it("produces a wire schema for the full plan without forbidden keys", () => {
    const wire = JSON.stringify(toWireJsonSchema(planSchema));

    expect(wire).not.toContain("minItems");
    expect(wire).not.toContain("minimum");
    expect(wire).not.toContain("minLength");
  });
});
