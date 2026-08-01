import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentsClient } from "@/components/modules/students/students-client";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
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

  // Fetch all classes
  const classes = await prisma.class.findMany({
    where: { schoolId },
    orderBy: { name: "asc" }
  });

  // Fetch all students (in a real app you'd paginate this)
  const students = await prisma.student.findMany({
    where: { schoolId, deletedAt: null },
    include: { class: true },
    orderBy: [
      { class: { name: "asc" } },
      { lastName: "asc" }
    ]
  });

  return (
    <StudentsClient 
      classes={classes}
      students={students}
    />
  );
}
