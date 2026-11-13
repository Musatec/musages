import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExpensesClient } from "@/components/modules/expenses/expenses-client";
import { DAARA_MANAGER_ROLES, getActiveSpace, hasAnyRole } from "@/lib/action-context";

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
  if (!hasAnyRole(session.user.role, DAARA_MANAGER_ROLES)) redirect(`/${locale}/home`);

  const daaraId = session.user.daaraId;
  if (!daaraId) redirect(`/${locale}/setup`);
  const space = await getActiveSpace();

  // Fetch all transactions for active space
  const transactions = await prisma.transaction.findMany({
    where: { daaraId, space },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <ExpensesClient 
      transactions={transactions as any}
    />
  );
}
