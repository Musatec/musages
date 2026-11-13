import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GradesClient } from "@/components/modules/grades/grades-client";
import { DAARA_MANAGER_ROLES, DAARA_STAFF_ROLES, getActiveSpace, hasAnyRole } from "@/lib/action-context";

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
  if (!hasAnyRole(session.user.role, DAARA_STAFF_ROLES)) redirect(`/${locale}/home`);

  const daaraId = session.user.daaraId;
  if (!daaraId) redirect(`/${locale}/setup`);
  const space = await getActiveSpace();

  const isManager = hasAnyRole(session.user.role, DAARA_MANAGER_ROLES);

  // Fetch all halqas for active space
  const halqasRaw = await prisma.halqa.findMany({
    where: { daaraId, space },
    orderBy: { name: "asc" }
  });

  const allTalibes = await prisma.talibe.findMany({
    where: { daaraId, space, deletedAt: null },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      matricule: true,
      halqaId: true,
      status: true,
      gender: true,
      dateOfBirth: true,
      ...(isManager ? { parentName: true, parentPhone: true } : {}),
    },
    orderBy: { firstName: "asc" }
  });

  const classes = halqasRaw.map(c => ({
    ...c,
    students: allTalibes.filter(s => s.halqaId === c.id)
  }));

  return (
    <GradesClient 
      classes={classes as any}
      subjects={[]}
      recentGrades={[]}
      schoolName={session.user.name || "Daara"}
    />
  );
}
