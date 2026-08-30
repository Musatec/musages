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

  const daaraId = session.user.daaraId || session.user.id || "daara_demo_123";

  // Fetch all halqas and their talibes
  const halqas = await prisma.halqa.findMany({
    where: { daaraId },
    orderBy: { name: "asc" },
    include: { 
      talibes: {
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
      daaraId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      }
    },
    include: {
      talibe: { include: { halqa: true } }
    }
  });

  // Fetch recent absences/delays for statistics
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentIssues = await prisma.attendance.findMany({
    where: {
      daaraId,
      date: { gte: thirtyDaysAgo },
      status: { in: ["ABSENT", "RETARD"] }
    },
    include: {
      talibe: { include: { halqa: true } }
    },
    orderBy: { date: "desc" },
    take: 50
  });

  return (
    <AttendanceClient 
      classes={halqas as any}
      todaysAttendances={todaysAttendances as any}
      recentIssues={recentIssues as any}
      schoolName={session.user.name || "Daara"}
    />
  );
}
