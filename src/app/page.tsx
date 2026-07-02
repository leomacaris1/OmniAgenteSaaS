import { redirect } from "next/navigation";
import { SaaSBuilderWorkbench } from "@/components/omniagent/saas-builder-workbench";
import { getCurrentSession } from "@/lib/omniagent/auth/session";

export default async function Home() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return <SaaSBuilderWorkbench session={session} />;
}
