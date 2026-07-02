import "server-only";

import { hashPassword, verifyPassword } from "@/lib/omniagent/auth/password";
import { getPrismaClient } from "@/lib/omniagent/storage/prisma-client";

type RegisterUserInput = {
  email: string;
  password: string;
  name?: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function workspaceNameFromEmail(email: string) {
  const handle = email.split("@")[0]?.trim();
  return handle ? `${handle} Workspace` : "OmniAgent Workspace";
}

export async function registerUser(input: RegisterUserInput) {
  const prisma = await getPrismaClient();
  const email = normalizeEmail(input.email);
  const passwordHash = await hashPassword(input.password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.appUser.create({
      data: {
        email,
        passwordHash,
        name: input.name?.trim() || null,
      },
    });
    const workspace = await tx.workspace.create({
      data: {
        name: workspaceNameFromEmail(email),
      },
    });
    const membership = await tx.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: "owner",
      },
    });

    return { user, workspace, role: membership.role };
  });
}

export async function authenticateUser(emailInput: string, password: string) {
  const prisma = await getPrismaClient();
  const email = normalizeEmail(emailInput);
  const user = await prisma.appUser.findUnique({
    where: { email },
    include: {
      memberships: {
        include: { workspace: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return null;
  }

  const membership = user.memberships[0];

  if (!membership) {
    return null;
  }

  return {
    user,
    workspace: membership.workspace,
    role: membership.role,
  };
}
