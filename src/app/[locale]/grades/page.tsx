import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GradesClient } from "@/components/modules/grades/grades-client";

export const dynamic = "force-dynamic";

export default async function GradesPage({
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

  // Fetch all classes for filtering
  const classes = await prisma.class.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
    include: { students: true }
  });

  // Fetch all subjects
  const subjects = await prisma.subject.findMany({
    where: { schoolId },
    orderBy: { name: "asc" }
  });

  // We don't fetch all grades here as it could be huge. The client component will handle selecting a student to view/add their grades, or we fetch recent grades.
  // For now, let's fetch recent grades.
  const recentGrades = await prisma.grade.findMany({
    where: { schoolId },
    include: {
      student: { include: { class: true } },
      subject: true
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <GradesClient 
      classes={classes}
      subjects={subjects}
      recentGrades={recentGrades}
      schoolName={session.user.name || "École"}
    />
  );
}
