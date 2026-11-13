import { DonationManager } from "@/components/modules/sadaqa/donation-manager";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DAARA_MANAGER_ROLES, hasAnyRole } from "@/lib/action-context";

export default async function SadaqaPage({ params }: { params: Promise<{ locale: string }> }) {
  const session = await auth();
  const { locale } = await params;
  if (!session?.user?.id) redirect(`/${locale}/login`);
  if (!hasAnyRole(session.user.role, DAARA_MANAGER_ROLES)) redirect(`/${locale}/home`);
  if (!session.user.daaraId) redirect(`/${locale}/setup`);

  return (
    <div className="space-y-6 w-full max-w-full">
      <DonationManager />
    </div>
  );
}
