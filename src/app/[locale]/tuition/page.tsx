import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TuitionClient } from "@/components/modules/tuition/tuition-client";

export const dynamic = "force-dynamic";

export default async function TuitionPage({
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
    orderBy: { name: "asc" }
  });

  // Fetch all tuitions (you would typically paginate this)
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const tuitions = await prisma.tuitionFee.findMany({
    where: { schoolId },
    include: {
      student: {
        include: { class: true }
      }
    },
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { student: { firstName: 'asc' } }
    ],
    take: 500, // Limit for performance
  });

  return (
    <TuitionClient 
      tuitions={tuitions} 
      classes={classes}
      currentMonth={currentMonth}
      currentYear={currentYear}
      schoolName={session.user.name || "École"}
    />
  );
}
