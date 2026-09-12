import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TuitionClient } from "@/components/modules/tuition/tuition-client";
import { getTuitionRecords } from "@/lib/actions/tuition";

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

  const daaraId = session.user.daaraId || session.user.id || "daara_demo_123";

  // Fetch all halqas for filtering
  const halqas = await prisma.halqa.findMany({
    where: { daaraId },
    orderBy: { name: "asc" }
  });

  // Fetch all active Talibes for tuition recording
  const talibes = await prisma.talibe.findMany({
    where: { daaraId, deletedAt: null },
    include: { halqa: true },
    orderBy: { lastName: "asc" }
  });

  // Fetch tuition transactions
  const { transactions } = await getTuitionRecords();

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
        schoolName={session.user.name || "Daara.net"}
      />
    </div>
  );
}
