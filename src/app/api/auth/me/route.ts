import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/omniagent/auth/session";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  return NextResponse.json(session);
}
