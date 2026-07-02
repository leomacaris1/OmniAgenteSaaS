import { PrismaPg } from "@prisma/adapter-pg";
import type { PrismaClient } from "@/generated/prisma/client";

let prismaClient: PrismaClient | null = null;

export async function getPrismaClient() {
  if (!prismaClient) {
    const { PrismaClient } = await import("@/generated/prisma/client");
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is required when OMNIAGENT_STORAGE_DRIVER=prisma.");
    }

    prismaClient = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  return prismaClient;
}
