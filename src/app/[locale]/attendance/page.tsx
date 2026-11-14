import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AttendanceClient } from "@/components/modules/attendance/attendance-client";
import { DAARA_MANAGER_ROLES, DAARA_STAFF_ROLES, getActiveSpace, hasAnyRole } from "@/lib/action-context";

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
  if (!hasAnyRole(session.user.role, DAARA_STAFF_ROLES)) redirect(`/${locale}/home`);

  const daaraId = session.user.daaraId;
  if (!daaraId) redirect(`/${locale}/setup`);
  const space = await getActiveSpace();

  const isManager = hasAnyRole(session.user.role, DAARA_MANAGER_ROLES);
  const talibeSelect = {
    id: true,
    firstName: true,
    lastName: true,
    matricule: true,
    halqaId: true,
    status: true,
    gender: true,
    dateOfBirth: true,
    ...(isManager ? { parentName: true, parentPhone: true } : {}),
  } as const;

  // Date boundaries
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Fetch halqas, today's attendances, and recent issues in parallel
  const [halqas, todaysAttendances, recentIssues] = await Promise.all([
    prisma.halqa.findMany({
      where: { daaraId, space },
      orderBy: { name: "asc" },
      include: { 
        talibes: {
          where: { deletedAt: null, space },
          select: talibeSelect,
          orderBy: { firstName: "asc" }
        } 
      }
    }),
    prisma.attendance.findMany({
      where: {
        daaraId,
        space,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        }
      },
      include: {
        talibe: {
          select: {
            ...talibeSelect,
            halqa: true,
          }
        }
      }
    }),
    prisma.attendance.findMany({
      where: {
        daaraId,
        space,
        date: { gte: thirtyDaysAgo },
        status: { in: ["ABSENT", "RETARD"] }
      },
      include: {
        talibe: {
          select: {
            ...talibeSelect,
            halqa: true,
          }
        }
      },
      orderBy: { date: "desc" },
      take: 50
    })
  ]);

  return (
    <AttendanceClient 
      classes={halqas as any}
      todaysAttendances={todaysAttendances as any}
      recentIssues={recentIssues as any}
      schoolName={session.user.name || "Daara"}
    />
  );
}
