import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardWrapperClient } from "@/components/modules/dashboard/dashboard-wrapper-client";
import { DAARA_STAFF_ROLES, hasAnyRole } from "@/lib/action-context";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
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

  const fetchSafe = async (fn: () => Promise<any>, defaultValue: any) => {
    try {
      return await fn();
    } catch (e) {
      console.warn("[DAARA_DASHBOARD_FETCH_ERROR]", e);
      return defaultValue;
    }
  };

  // Exécution parallèle de toutes les requêtes métriques pour minimiser la latence TTFB
  const [
    daara,
    totalTalibes,
    totalInternes,
    totalHalqas,
    totalSponsorships,
    hifzRecordsToday,
    recentHifz,
    totalSchoolStudents,
    totalSchoolClasses,
    totalSchoolTeachers
  ] = await Promise.all([
    fetchSafe(() => prisma.daara.findUnique({
      where: { id: daaraId },
      select: { name: true }
    }), null),
    fetchSafe(() => prisma.talibe.count({
      where: { daaraId, space: "daara", deletedAt: null }
    }), 0),
    fetchSafe(() => prisma.talibe.count({
      where: { daaraId, space: "daara", status: "INTERNE", deletedAt: null }
    }), 0),
    fetchSafe(() => prisma.halqa.count({
      where: { daaraId, space: "daara" }
    }), 0),
    fetchSafe(() => prisma.sponsorship.count({
      where: { daaraId, status: "ACTIVE" }
    }), 0),
    fetchSafe(() => prisma.hifzProgress.count({
      where: { daaraId }
    }), 0),
    fetchSafe(() => prisma.hifzProgress.findMany({
      where: { daaraId },
      include: { talibe: true },
      orderBy: { date: "desc" },
      take: 6,
    }), []),
    fetchSafe(() => prisma.talibe.count({
      where: { daaraId, space: "school", deletedAt: null }
    }), 0),
    fetchSafe(() => prisma.halqa.count({
      where: { daaraId, space: "school" }
    }), 0),
    fetchSafe(() => prisma.user.count({
      where: { daaraId, space: "school", role: "OUSTAZ", deletedAt: null }
    }), 0),
  ]);

  return (
    <DashboardWrapperClient 
      daaraName={daara?.name || "Daara Ibnoul Khayim Al Diawziya"}
      schoolName="École Franco-Arabe Pathé Pogne"
      totalTalibes={totalTalibes}
      totalInternes={totalInternes}
      totalHalqas={totalHalqas}
      totalSchoolStudents={totalSchoolStudents}
      totalClasses={totalSchoolClasses}
      totalTeachers={totalSchoolTeachers}
      totalSponsorships={totalSponsorships}
      hifzRecordsToday={hifzRecordsToday}
      recentHifz={recentHifz}
      userRole={session.user.role}
    />
  );
}
