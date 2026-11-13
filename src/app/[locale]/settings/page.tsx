import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/modules/settings/settings-client";
import { DAARA_MANAGER_ROLES, hasAnyRole } from "@/lib/action-context";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;
  
  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }
  if (!hasAnyRole(session.user.role, DAARA_MANAGER_ROLES)) redirect(`/${locale}/home`);

  const daaraId = session.user.daaraId;
  if (!daaraId) redirect(`/${locale}/setup`);

  // Fetch daara details
  const daara = await prisma.daara.findUnique({
    where: { id: daaraId }
  });

  if (!daara) {
    return <div>Daara introuvable</div>;
  }

  return (
    <SettingsClient 
      school={daara as any}
    />
  );
}
