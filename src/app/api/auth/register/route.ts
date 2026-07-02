import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "@/lib/omniagent/auth/repository";
import { createSession } from "@/lib/omniagent/auth/session";

const registerSchema = z.object({
  email: z.email("Ingresa un email valido.").trim().toLowerCase(),
  password: z.string().min(8, "La clave debe tener al menos 8 caracteres."),
  name: z.string().trim().optional(),
});

export async function POST(request: Request) {
  try {
    const payload = registerSchema.parse(await request.json());
    const { user, workspace, role } = await registerUser(payload);

    await createSession(user.id);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
      workspace: { id: workspace.id, name: workspace.name, role },
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("Unique constraint")
        ? "Ya existe una cuenta con ese email."
        : error instanceof Error
          ? error.message
          : "No se pudo crear la cuenta.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
