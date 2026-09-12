import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HifzTracker, TalibeHifzItem } from "@/components/modules/hifz/hifz-tracker";

export const dynamic = "force-dynamic";

export default async function HifzPage({
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

  // Fetch all Talibes with their latest HifzProgress records
  const talibes = await prisma.talibe.findMany({
    where: { daaraId, deletedAt: null },
    include: {
      halqa: true,
      hifzRecords: {
        orderBy: { date: "desc" },
        take: 1
      }
    },
    orderBy: { lastName: "asc" }
  });

  const formattedTalibes: TalibeHifzItem[] = talibes.map((t) => {
    const latestRecord = t.hifzRecords[0];
    const hizbValidated = latestRecord ? latestRecord.hizbNumber : 0;
    const lastHizb = latestRecord ? latestRecord.hizbNumber : 1;
    const allwaStatus = latestRecord?.allwaNotes ? `Sabi: ${latestRecord.allwaNotes}` : "En apprentissage sur l'Allwa";

    return {
      id: t.id,
      matricule: t.matricule,
      name: `${t.firstName} ${t.lastName}`,
      halqa: t.halqa?.name || "Halqa Générale",
      hizbValidated,
      lastHizb,
      lastUpdate: latestRecord ? new Date(latestRecord.date).toLocaleDateString("fr-FR") : "Jamais",
      allwaStatus,
      status: t.status as "INTERNE" | "EXTERNE"
    };
  });

  return (
    <div className="space-y-6 w-full max-w-full">
      <HifzTracker initialTalibes={formattedTalibes} />
    </div>
  );
}
