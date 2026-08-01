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

  const schoolId = session.user.schoolId || session.user.storeId || session.user.id || "school_demo_123";

  // Fetch school details
  const school = await prisma.school.findUnique({
    where: { id: schoolId }
  });

  if (!school) {
    return <div>École introuvable</div>;
  }

  return (
    <SettingsClient 
      school={school}
    />
  );
}
