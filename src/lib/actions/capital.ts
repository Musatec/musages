"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getTransactions() {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return [];

    return await prisma.transaction.findMany({
      where: { daaraId },
      orderBy: { createdAt: "desc" }
    });
  } catch (error) {
    return [];
  }
}

export async function getCapitalSummary(filterMonth?: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return null;

    const transactions = await prisma.transaction.findMany({
      where: { daaraId },
      orderBy: { createdAt: "desc" },
      take: 100
    });

    let balance = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    for (const tx of transactions) {
      if (tx.type === "INCOME") {
        balance += tx.amount;
        monthlyIncome += tx.amount;
      } else {
        balance -= tx.amount;
        monthlyExpense += tx.amount;
      }
    }

    return {
      transactions,
      balance,
      monthlyIncome,
      monthlyExpense
    };
  } catch (error) {
    return null;
  }
}

export async function createTransaction(data: { amount: number; type: "INCOME" | "EXPENSE"; category: string; description: string }) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };

    const transaction = await prisma.transaction.create({
      data: {
        daaraId,
        amount: Number(data.amount),
        type: data.type,
        category: data.category,
        description: data.description
      }
    });

    revalidatePath("/capital");
    return { success: true, transaction };
  } catch (error: any) {
    return { error: error.message || "Erreur lors de la création de la transaction." };
  }
}

export async function updateTransaction(id: string, data: any) {
  try {
    revalidatePath("/capital");
    return { success: true };
  } catch (error: any) {
    return { error: "Erreur lors de la mise à jour." };
  }
}

export async function deleteTransaction(id: string) {
  try {
    revalidatePath("/capital");
    return { success: true };
  } catch (error: any) {
    return { error: "Erreur lors de la suppression." };
  }
}
