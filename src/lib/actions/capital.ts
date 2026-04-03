"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const TransactionSchema = z.object({
  amount: z.number().min(0.01, "Le montant doit être supérieur à 0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "La catégorie est requise"),
  description: z.string().optional(),
  date: z.string().optional(), // On utilisera createdAt par défaut si vide
});

export async function getCapitalSummary(month?: string) {
  const session = await auth();
  if (!session?.user?.storeId) return null;

  const storeId = session.user.storeId;
  const targetDate = month ? new Date(`${month}-01`) : new Date();
  const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

  try {
      const [totalIncome, totalExpense, monthlyIncome, monthlyExpense, recentTransactions] = await Promise.all([
        // Total Balance Calculations
        prisma.transaction.aggregate({ where: { storeId, type: "INCOME" }, _sum: { amount: true } }),
        prisma.transaction.aggregate({ where: { storeId, type: "EXPENSE" }, _sum: { amount: true } }),
        // Monthly View
        prisma.transaction.aggregate({ 
          where: { storeId, type: "INCOME", createdAt: { gte: startOfMonth, lte: endOfMonth } }, 
          _sum: { amount: true } 
        }),
        prisma.transaction.aggregate({ 
          where: { storeId, type: "EXPENSE", createdAt: { gte: startOfMonth, lte: endOfMonth } }, 
          _sum: { amount: true } 
        }),
        // Paginated / Recent Transactions
        prisma.transaction.findMany({
          where: { storeId, createdAt: { gte: startOfMonth, lte: endOfMonth } },
          orderBy: { createdAt: "desc" },
          take: 50
        })
      ]);

      return {
        balance: (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0),
        monthlyIncome: monthlyIncome._sum.amount || 0,
        monthlyExpense: monthlyExpense._sum.amount || 0,
        transactions: recentTransactions
      };
  } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      console.error("[CAPITAL] getCapitalSummary Error:", message);
      return null;
  }
}

export async function getTransactions(month?: string) {
  const session = await auth();
  if (!session?.user?.storeId) return [];

  const storeId = session.user.storeId;
  
  let dateFilter = {};
  if (month) {
    const start = new Date(`${month}-01`);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);

    dateFilter = {
      createdAt: {
        gte: start,
        lt: end,
      },
    };
  }

  try {
      return await prisma.transaction.findMany({
        where: {
          storeId,
          ...dateFilter,
        },
        orderBy: { createdAt: "desc" },
        take: 100 // Protection against large fetches
      });
  } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      console.error("[CAPITAL] getTransactions Error:", message);
      return [];
  }
}

export async function createTransaction(data: z.infer<typeof TransactionSchema>) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "Non autorisé" };

  const storeId = session.user.storeId;
  const validatedFields = TransactionSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Données invalides" };
  }

  try {
    const { amount, type, category, description, date } = validatedFields.data;

    const transaction = await prisma.transaction.create({
      data: {
        storeId,
        amount,
        type,
        category,
        description: description || "",
        createdAt: date ? new Date(date) : undefined,
      },
    });

    revalidatePath("/capital");
    return { success: true, id: transaction.id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[CAPITAL] Error creating transaction:", message);
    return { error: "Erreur lors de l'enregistrement" };
  }
}

export async function updateTransaction(id: string, data: z.infer<typeof TransactionSchema>) {
    const session = await auth();
    if (!session?.user?.storeId) return { error: "Non autorisé" };

    try {
        const { amount, type, category, description, date } = data;
        await prisma.transaction.update({
            where: { id, storeId: session.user.storeId },
            data: {
                amount,
                type,
                category,
                description: description || "",
                createdAt: date ? new Date(date) : undefined,
            }
        });
        revalidatePath("/capital");
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[CAPITAL] Update Error:", message);
        return { error: "Erreur lors de la modification" };
    }
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "Non autorisé" };

  try {
    await prisma.transaction.delete({
      where: { id, storeId: session.user.storeId },
    });
    revalidatePath("/capital");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[CAPITAL] Delete Error:", message);
    return { error: "Erreur lors de la suppression" };
  }
}
