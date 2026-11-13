import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NdeyiDaaraDashboard } from "@/components/modules/parrainage/ndeyi-daara-dashboard";
import { DAARA_MANAGER_ROLES, hasAnyRole } from "@/lib/action-context";

export const dynamic = "force-dynamic";

export default async function ParrainagePage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user?.id) redirect(`/${locale}/login`);
  if (!hasAnyRole(session.user.role, DAARA_MANAGER_ROLES)) redirect(`/${locale}/home`);
  if (!session.user.daaraId) redirect(`/${locale}/setup`);

  return (
    <div className="space-y-6 w-full max-w-full">
      <NdeyiDaaraDashboard />
    </div>
  );
}
