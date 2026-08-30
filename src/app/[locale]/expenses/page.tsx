import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExpensesClient } from "@/components/modules/expenses/expenses-client";

export const dynamic = "force-dynamic";

export default async function ExpensesPage({
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

  // Fetch all transactions
  const transactions = await prisma.transaction.findMany({
    where: { daaraId },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <ExpensesClient 
      transactions={transactions as any}
    />
  );
}
