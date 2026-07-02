import "server-only";

import { getPrismaClient } from "@/lib/omniagent/storage/prisma-client";

type CreatePilotFeedbackInput = {
  workspaceId: string;
  userId: string;
  projectId?: string;
  rating?: number;
  message: string;
};

export async function createPilotFeedback(input: CreatePilotFeedbackInput) {
  const prisma = await getPrismaClient();

  if (input.projectId) {
    const project = await prisma.project.findFirst({
      where: {
        id: input.projectId,
        workspaceId: input.workspaceId,
      },
      select: { id: true },
    });

    if (!project) {
      throw new Error("Proyecto no encontrado para este workspace.");
    }
  }

  return prisma.pilotFeedback.create({
    data: {
      workspaceId: input.workspaceId,
      userId: input.userId,
      projectId: input.projectId,
      rating: input.rating,
      message: input.message,
    },
  });
}
