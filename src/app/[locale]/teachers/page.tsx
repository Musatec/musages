import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeachersClient } from "@/components/modules/teachers/teachers-client";

export const dynamic = "force-dynamic";

export default async function TeachersPage({
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

  // Fetch all teachers
  const teachers = await prisma.teacher.findMany({
    where: { schoolId, deletedAt: null },
    orderBy: { lastName: "asc" }
  });

  // Fetch recent salary payments
  const recentPayments = await prisma.transaction.findMany({
    where: { 
      schoolId, 
      type: "EXPENSE",
      category: "SALAIRE_ENSEIGNANT"
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <TeachersClient 
      teachers={teachers}
      recentPayments={recentPayments}
    />
  );
}
