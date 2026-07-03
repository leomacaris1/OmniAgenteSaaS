import { PublicLanding } from "@/components/omniagent/public-landing";
import { SaaSBuilderWorkbench } from "@/components/omniagent/saas-builder-workbench";
import { getCurrentSession } from "@/lib/omniagent/auth/session";

export default async function Home() {
  const session = await getCurrentSession();

  if (!session) {
    return <PublicLanding />;
  }

  return <SaaSBuilderWorkbench session={session} />;
}
