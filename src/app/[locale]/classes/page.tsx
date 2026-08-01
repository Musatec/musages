import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClassesClient } from "@/components/modules/classes/classes-client";

export const dynamic = "force-dynamic";

export default async function ClassesPage({
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

  // Fetch all classes with student count
  const classes = await prisma.class.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { students: { where: { deletedAt: null } } }
      }
    }
  });

  // Fetch all subjects
  const subjects = await prisma.subject.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { grades: true }
      }
    }
  });

  return (
    <ClassesClient 
      classes={classes}
      subjects={subjects}
    />
  );
}
