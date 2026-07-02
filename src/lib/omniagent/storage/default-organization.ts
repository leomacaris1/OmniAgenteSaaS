import type { PrismaClient } from "@/generated/prisma/client";

const DEFAULT_ORGANIZATION_SLUG = "default";
const DEFAULT_ORGANIZATION_NAME = "Default Organization";

let cachedOrganizationId: string | null = null;

/**
 * Resolves the organization new projects should be attached to until real
 * auth/session-based org resolution lands. Prefers OMNIAGENT_DEFAULT_ORG_ID
 * when set (e.g. to point at a pre-seeded org), otherwise gets-or-creates a
 * single well-known "default" organization. Swap this out for a session-based
 * lookup once Supabase Auth is wired up — callers don't need to change.
 */
export async function getOrCreateDefaultOrganizationId(prisma: PrismaClient): Promise<string> {
  if (process.env.OMNIAGENT_DEFAULT_ORG_ID) {
    return process.env.OMNIAGENT_DEFAULT_ORG_ID;
  }

  if (cachedOrganizationId) {
    return cachedOrganizationId;
  }

  const organization = await prisma.organization.upsert({
    where: { slug: DEFAULT_ORGANIZATION_SLUG },
    create: { slug: DEFAULT_ORGANIZATION_SLUG, name: DEFAULT_ORGANIZATION_NAME },
    update: {},
  });

  cachedOrganizationId = organization.id;
  return organization.id;
}
