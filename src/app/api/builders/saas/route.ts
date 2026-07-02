import { NextResponse } from "next/server";
import { z } from "zod";
import { runSaaSBuilder } from "@/lib/omniagent/builders/saas-builder";
import { getCurrentSession } from "@/lib/omniagent/auth/session";

const inputSchema = z.object({
  idea: z.string().trim().min(10, "Describe la idea con al menos 10 caracteres."),
  audience: z.string().trim().optional(),
  region: z.string().trim().optional(),
  constraints: z.string().trim().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    const payload = inputSchema.parse(await request.json());
    const project = await runSaaSBuilder(payload, { workspaceId: session.workspace.id });
    return NextResponse.json(project);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo ejecutar SaaS Builder.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
