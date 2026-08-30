import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/modules/settings/settings-client";

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

  const daaraId = session.user.daaraId || session.user.id || "daara_demo_123";

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
