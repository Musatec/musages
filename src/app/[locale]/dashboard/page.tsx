import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JanguDashboardClient } from "@/components/modules/dashboard/jangu-dashboard-client";

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

  const schoolId = session.user.schoolId || session.user.storeId || session.user.id || "school_demo_123";

  const fetchSafe = async (fn: () => Promise<any>, defaultValue: any) => {
    try {
      return await fn();
    } catch (e) {
      console.warn("[DASHBOARD_FETCH_ERROR]", e);
      return defaultValue;
    }
  };

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Métriques de l'école
  const school = await fetchSafe(() => prisma.school.findUnique({
    where: { id: schoolId }
  }), null);

  const totalStudents = await fetchSafe(() => prisma.student.count({
    where: { schoolId, deletedAt: null }
  }), 0);

  const totalClasses = await fetchSafe(() => prisma.class.count({
    where: { schoolId }
  }), 0);

  const totalTeachers = await fetchSafe(() => prisma.teacher.count({
    where: { schoolId, deletedAt: null }
  }), 0);

  // Écolages du mois en cours
  const tuitionsMonth = await fetchSafe(() => prisma.tuitionFee.aggregate({
    where: { schoolId, month: currentMonth, year: currentYear },
    _sum: { amount: true, amountPaid: true }
  }), { _sum: { amount: 0, amountPaid: 0 } });

  const paidTuitionsCount = await fetchSafe(() => prisma.tuitionFee.count({
    where: { schoolId, month: currentMonth, year: currentYear, status: "PAID" }
  }), 0);

  const totalTuitionsCount = await fetchSafe(() => prisma.tuitionFee.count({
    where: { schoolId, month: currentMonth, year: currentYear }
  }), 0);

  const recentTuitions = await fetchSafe(() => prisma.tuitionFee.findMany({
    where: { schoolId },
    include: { student: { include: { class: true } } },
    orderBy: { updatedAt: "desc" },
    take: 6,
  }), []);

  const totalAmountDue = tuitionsMonth._sum.amount || 0;
  const totalAmountPaid = tuitionsMonth._sum.amountPaid || 0;
  const collectionRate = totalTuitionsCount > 0 ? Math.round((paidTuitionsCount / totalTuitionsCount) * 100) : 0;

  return (
    <JanguDashboardClient 
      schoolName={school?.name || "Mon Établissement"}
      totalStudents={totalStudents}
      totalClasses={totalClasses}
      totalTeachers={totalTeachers}
      totalAmountDue={totalAmountDue}
      totalAmountPaid={totalAmountPaid}
      collectionRate={collectionRate}
      recentTuitions={recentTuitions}
      currentMonth={currentMonth}
      currentYear={currentYear}
      userRole={session.user.role}
    />
  );
}
