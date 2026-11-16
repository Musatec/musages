import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { HifzTracker, TalibeHifzItem } from "@/components/modules/hifz/hifz-tracker";
import { DAARA_STAFF_ROLES, hasAnyRole } from "@/lib/action-context";

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
  if (!hasAnyRole(session.user.role, DAARA_STAFF_ROLES)) redirect(`/${locale}/home`);

  const daaraId = session.user.daaraId;
  if (!daaraId) redirect(`/${locale}/setup`);

  // Fetch Daara info, Halqas, and Talibes concurrently in parallel
  const [daara, halqas, talibes] = await Promise.all([
    prisma.daara.findUnique({
      where: { id: daaraId },
      select: { name: true }
    }),
    prisma.halqa.findMany({
      where: { daaraId, space: "daara" },
      orderBy: { name: "asc" },
      include: {
        talibes: {
          where: { deletedAt: null, space: "daara" },
          include: {
            hifzRecords: {
              orderBy: { date: "desc" },
              take: 1
            }
          },
          orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
        }
      }
    }),
    prisma.talibe.findMany({
      where: { daaraId, space: "daara", deletedAt: null },
      include: {
        halqa: true,
        hifzRecords: {
          orderBy: { date: "desc" },
          take: 1
        }
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
    })
  ]);

  const formattedTalibes: TalibeHifzItem[] = talibes.map((t) => {
    const latestRecord = t.hifzRecords[0];
    const hizbValidated = latestRecord ? latestRecord.hizbNumber : 0;
    const lastHizb = latestRecord ? latestRecord.hizbNumber : 1;
    const allwaStatus = latestRecord?.allwaNotes ? `Sabi: ${latestRecord.allwaNotes}` : "En apprentissage sur l'Allwa";

    return {
      id: t.id,
      halqaId: t.halqaId || undefined,
      matricule: t.matricule,
      firstName: t.firstName,
      lastName: t.lastName,
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
      <HifzTracker 
        daaraName={daara?.name || "مدرسة ابن القيم الجوزية لتحفيظ القرآن الكريم والدراسات الإسلامية"}
        halqas={halqas as any}
        initialTalibes={formattedTalibes} 
      />
    </div>
  );
}
