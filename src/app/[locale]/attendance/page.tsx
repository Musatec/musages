import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AttendanceClient } from "@/components/modules/attendance/attendance-client";

export const dynamic = "force-dynamic";

export default async function AttendancePage({
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

  // Fetch all classes and their students
  const classes = await prisma.class.findMany({
    where: { schoolId },
    orderBy: { name: "asc" },
    include: { 
      students: {
        orderBy: { firstName: "asc" }
      } 
    }
  });

  // Fetch today's attendances
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todaysAttendances = await prisma.attendance.findMany({
    where: {
      schoolId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      }
    },
    include: {
      student: { include: { class: true } }
    }
  });

  // Fetch recent absences/delays for statistics
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentIssues = await prisma.attendance.findMany({
    where: {
      schoolId,
      date: { gte: thirtyDaysAgo },
      status: { in: ["ABSENT", "RETARD"] }
    },
    include: {
      student: { include: { class: true } }
    },
    orderBy: { date: "desc" },
    take: 50
  });

  return (
    <AttendanceClient 
      classes={classes}
      todaysAttendances={todaysAttendances}
      recentIssues={recentIssues}
      schoolName={session.user.name || "École"}
    />
  );
}
