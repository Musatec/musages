import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeachersClient } from "@/components/modules/teachers/teachers-client";
import { DAARA_MANAGER_ROLES, getActiveSpace, hasAnyRole } from "@/lib/action-context";

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
  if (!hasAnyRole(session.user.role, DAARA_MANAGER_ROLES)) redirect(`/${locale}/home`);

  const daaraId = session.user.daaraId;
  if (!daaraId) redirect(`/${locale}/setup`);
  const space = await getActiveSpace();

  // Fetch oustaz / teachers and payments in parallel
  const [oustazList, recentPayments] = await Promise.all([
    prisma.user.findMany({
      where: { daaraId, space, role: "OUSTAZ", deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    }),
    prisma.transaction.findMany({
      where: { 
        daaraId, 
        space,
        type: "EXPENSE",
        category: "SALAIRE_OUSTAZ"
      },
      orderBy: { createdAt: "desc" },
      take: 50
    })
  ]);

  return (
    <TeachersClient 
      teachers={oustazList as any}
      recentPayments={recentPayments as any}
    />
  );
}
