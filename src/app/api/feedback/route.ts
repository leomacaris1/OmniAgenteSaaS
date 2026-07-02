import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/omniagent/auth/session";
import { createPilotFeedback } from "@/lib/omniagent/feedback/repository";

const feedbackSchema = z.object({
  projectId: z.string().trim().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  message: z.string().trim().min(10, "Describe el feedback con al menos 10 caracteres."),
});

export async function POST(request: Request) {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    const payload = feedbackSchema.parse(await request.json());
    const feedback = await createPilotFeedback({
      workspaceId: session.workspace.id,
      userId: session.user.id,
      projectId: payload.projectId,
      rating: payload.rating,
      message: payload.message,
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo guardar el feedback.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
