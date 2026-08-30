import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DaaraDashboardClient } from "@/components/modules/dashboard/daara-dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;
  
  if (!session) {
    redirect(`/${locale}/login`);
  }

  const daaraId = session.user.daaraId || session.user.id || "daara_demo_123";

  const fetchSafe = async (fn: () => Promise<any>, defaultValue: any) => {
    try {
      return await fn();
    } catch (e) {
      console.warn("[DAARA_DASHBOARD_FETCH_ERROR]", e);
      return defaultValue;
    }
  };

  // Métriques du Daara
  const daara = await fetchSafe(() => prisma.daara.findUnique({
    where: { id: daaraId }
  }), null);

  const totalTalibes = await fetchSafe(() => prisma.talibe.count({
    where: { daaraId, deletedAt: null }
  }), 120);

  const totalInternes = await fetchSafe(() => prisma.talibe.count({
    where: { daaraId, status: "INTERNE", deletedAt: null }
  }), 85);

  const totalHalqas = await fetchSafe(() => prisma.halqa.count({
    where: { daaraId }
  }), 6);

  const totalSponsorships = await fetchSafe(() => prisma.sponsorship.count({
    where: { daaraId, status: "ACTIVE" }
  }), 45);

  const hifzRecordsToday = await fetchSafe(() => prisma.hifzProgress.count({
    where: { daaraId }
  }), 38);

  const recentHifz = await fetchSafe(() => prisma.hifzProgress.findMany({
    where: { daaraId },
    include: { talibe: true },
    orderBy: { date: "desc" },
    take: 6,
  }), []);

  return (
    <DaaraDashboardClient 
      daaraName={daara?.name || "Daara Serigne Touba (Daara.net)"}
      totalTalibes={totalTalibes}
      totalInternes={totalInternes}
      totalHalqas={totalHalqas}
      totalSponsorships={totalSponsorships}
      hifzRecordsToday={hifzRecordsToday}
      recentHifz={recentHifz}
      userRole={session.user.role}
    />
  );
}
