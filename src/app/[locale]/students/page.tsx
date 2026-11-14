import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentsClient } from "@/components/modules/students/students-client";
import { DAARA_MANAGER_ROLES, DAARA_STAFF_ROLES, getActiveSpace, hasAnyRole } from "@/lib/action-context";

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
  if (!hasAnyRole(session.user.role, DAARA_STAFF_ROLES)) redirect(`/${locale}/home`);

  const daaraId = session.user.daaraId;
  if (!daaraId) redirect(`/${locale}/setup`);
  const space = await getActiveSpace();

  // Fetch halqas and talibes concurrently in parallel
  const talibeWhere = { daaraId, space, deletedAt: null };
  const [halqas, talibes] = await Promise.all([
    prisma.halqa.findMany({
      where: { daaraId, space },
      orderBy: { name: "asc" }
    }),
    hasAnyRole(session.user.role, DAARA_MANAGER_ROLES)
      ? prisma.talibe.findMany({
          where: talibeWhere,
          include: { halqa: true },
          orderBy: { lastName: "asc" },
        })
      : prisma.talibe.findMany({
          where: talibeWhere,
          select: {
            id: true, matricule: true, firstName: true, lastName: true, gender: true,
            status: true, halqaId: true, parentName: true, parentPhone: true, createdAt: true,
            halqa: { select: { id: true, name: true, level: true, oustazName: true } },
          },
          orderBy: { lastName: "asc" },
        })
  ]);

  return (
    <StudentsClient 
      classes={halqas as any}
      students={talibes as any}
    />
  );
}
