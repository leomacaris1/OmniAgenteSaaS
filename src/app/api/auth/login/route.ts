import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateUser } from "@/lib/omniagent/auth/repository";
import { createSession } from "@/lib/omniagent/auth/session";

const loginSchema = z.object({
  email: z.email("Ingresa un email valido.").trim().toLowerCase(),
  password: z.string().min(1, "Ingresa tu clave."),
});

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());
    const account = await authenticateUser(payload.email, payload.password);

    if (!account) {
      return NextResponse.json({ error: "Email o clave incorrectos." }, { status: 401 });
    }

    await createSession(account.user.id);

    return NextResponse.json({
      user: { id: account.user.id, email: account.user.email, name: account.user.name },
      workspace: { id: account.workspace.id, name: account.workspace.name, role: account.role },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo iniciar sesion.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
