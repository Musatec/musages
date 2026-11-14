import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TuitionClient } from "@/components/modules/tuition/tuition-client";
import { getTuitionRecords } from "@/lib/actions/tuition";
import { DAARA_MANAGER_ROLES, getActiveSpace, hasAnyRole } from "@/lib/action-context";

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
  if (!hasAnyRole(session.user.role, DAARA_MANAGER_ROLES)) redirect(`/${locale}/home`);

  const daaraId = session.user.daaraId;
  if (!daaraId) redirect(`/${locale}/setup`);
  const space = await getActiveSpace();

  // Fetch halqas, talibes, and tuition records in parallel
  const [halqas, talibes, { transactions }] = await Promise.all([
    prisma.halqa.findMany({
      where: { daaraId, space },
      orderBy: { name: "asc" }
    }),
    prisma.talibe.findMany({
      where: { daaraId, space, deletedAt: null },
      include: { halqa: true },
      orderBy: { lastName: "asc" }
    }),
    getTuitionRecords()
  ]);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6 w-full max-w-full">
      <TuitionClient 
        tuitions={transactions as any} 
        talibeList={talibes as any}
        classes={halqas as any}
        currentMonth={currentMonth}
        currentYear={currentYear}
        schoolName={session.user.name || "Daara Ibnoul Khayim Al Diawziya"}
      />
    </div>
  );
}
