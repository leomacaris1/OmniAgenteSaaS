import { NextResponse } from "next/server";
import { listProjects, listRuns } from "@/lib/omniagent/storage/project-store";

export async function GET() {
  const [projects, runs] = await Promise.all([listProjects(), listRuns()]);
  return NextResponse.json({ projects, runs });
}
