import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeachersClient } from "@/components/modules/teachers/teachers-client";

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

  const daaraId = session.user.daaraId || session.user.id || "daara_demo_123";

  // Fetch all oustaz
  const oustazList = await prisma.user.findMany({
    where: { daaraId, role: "OUSTAZ", deletedAt: null },
    orderBy: { name: "asc" }
  });

  // Fetch recent salary payments
  const recentPayments = await prisma.transaction.findMany({
    where: { 
      daaraId, 
      type: "EXPENSE",
      category: "SALAIRE_OUSTAZ"
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <TeachersClient 
      teachers={oustazList as any}
      recentPayments={recentPayments as any}
    />
  );
}
