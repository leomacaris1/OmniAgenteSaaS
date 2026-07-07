import { redirect } from "next/navigation";
import { SaaSBuilderWorkbench } from "@/components/omniagent/saas-builder-workbench";
import { getCurrentSession } from "@/lib/omniagent/auth/session";
import { appRoutes } from "@/lib/omniagent/navigation/routes";

export default async function AppPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect(appRoutes.login);
  }

  return <SaaSBuilderWorkbench session={session} />;
}
