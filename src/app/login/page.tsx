import { redirect } from "next/navigation";
import { AuthForm } from "@/components/omniagent/auth-form";
import { getCurrentSession } from "@/lib/omniagent/auth/session";
import { appRoutes } from "@/lib/omniagent/navigation/routes";

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect(appRoutes.commandCenter);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-foreground">
      <AuthForm />
    </main>
  );
}
