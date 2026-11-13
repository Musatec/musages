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

  // Métriques du Daara / Établissement
  const daara = await fetchSafe(() => prisma.daara.findUnique({
    where: { id: daaraId }
  }), null);

  // Métriques Daara (space: "daara")
  const totalTalibes = await fetchSafe(() => prisma.talibe.count({
    where: { daaraId, space: "daara", deletedAt: null }
  }), 0);

  const totalInternes = await fetchSafe(() => prisma.talibe.count({
    where: { daaraId, space: "daara", status: "INTERNE", deletedAt: null }
  }), 0);

  const totalHalqas = await fetchSafe(() => prisma.halqa.count({
    where: { daaraId, space: "daara" }
  }), 0);

  const totalSponsorships = await fetchSafe(() => prisma.sponsorship.count({
    where: { daaraId, status: "ACTIVE" }
  }), 0);

  const hifzRecordsToday = await fetchSafe(() => prisma.hifzProgress.count({
    where: { daaraId }
  }), 0);

  const recentHifz = await fetchSafe(() => prisma.hifzProgress.findMany({
    where: { daaraId },
    include: { talibe: true },
    orderBy: { date: "desc" },
    take: 6,
  }), []);

  // Métriques École Pathé Pogne (space: "school")
  const totalSchoolStudents = await fetchSafe(() => prisma.talibe.count({
    where: { daaraId, space: "school", deletedAt: null }
  }), 0);

  const totalSchoolClasses = await fetchSafe(() => prisma.halqa.count({
    where: { daaraId, space: "school" }
  }), 0);

  const totalSchoolTeachers = await fetchSafe(() => prisma.user.count({
    where: { daaraId, space: "school", role: "OUSTAZ", deletedAt: null }
  }), 0);

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
