"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DAARA_MANAGER_ROLES, getActionContext } from "@/lib/action-context";

type TransactionInput = {
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string;
  date?: string;
};

function revalidateFinancePages() {
  revalidatePath("/capital");
  revalidatePath("/expenses");
}

export async function getTransactions() {
  try {
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    if (!context) return [];

    return await prisma.transaction.findMany({
      where: { daaraId: context.daaraId },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getCapitalSummary(filterMonth?: string) {
  try {
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    if (!context) return null;

    const monthMatch = filterMonth?.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
    if (filterMonth && !monthMatch) return null;

    const monthStart = monthMatch ? new Date(Number(monthMatch[1]), Number(monthMatch[2]) - 1, 1) : undefined;
    const monthEnd = monthMatch ? new Date(Number(monthMatch[1]), Number(monthMatch[2]), 1) : undefined;
    const baseWhere = { daaraId: context.daaraId };
    const monthWhere = monthStart && monthEnd
      ? { ...baseWhere, createdAt: { gte: monthStart, lt: monthEnd } }
      : baseWhere;

    const [transactions, income, expenses, monthlyIncome, monthlyExpense] = await Promise.all([
      prisma.transaction.findMany({ where: baseWhere, orderBy: { createdAt: "desc" }, take: 100 }),
      prisma.transaction.aggregate({ where: { ...baseWhere, type: "INCOME" }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { ...baseWhere, type: "EXPENSE" }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { ...monthWhere, type: "INCOME" }, _sum: { amount: true } }),
      prisma.transaction.aggregate({ where: { ...monthWhere, type: "EXPENSE" }, _sum: { amount: true } }),
    ]);

    const totalIncome = income._sum.amount ?? 0;
    const totalExpenses = expenses._sum.amount ?? 0;
    return {
      transactions,
      balance: totalIncome - totalExpenses,
      monthlyIncome: monthlyIncome._sum.amount ?? 0,
      monthlyExpense: monthlyExpense._sum.amount ?? 0,
    };
  } catch {
    return null;
  }
}

export async function createTransaction(data: TransactionInput) {
  try {
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    if (!context) return { error: "Non autorise." };

    const amount = Number(data?.amount);
    const category = typeof data?.category === "string" ? data.category.trim() : "";
    const description = typeof data?.description === "string" ? data.description.trim() : "";
    const date = data?.date ? new Date(data.date) : undefined;
    if (!Number.isFinite(amount) || amount <= 0 || !category || !description) {
      return { error: "Verifiez le montant, la categorie et la description." };
    }
    if (!(data.type === "INCOME" || data.type === "EXPENSE") || category.length > 100 || description.length > 1000 || (date && Number.isNaN(date.getTime()))) {
      return { error: "Verifiez les informations de la transaction." };
    }

    const transaction = await prisma.transaction.create({
      data: {
        daaraId: context.daaraId,
        amount,
        type: data.type,
        category,
        description,
        ...(date ? { createdAt: date } : {}),
      },
    });

    revalidateFinancePages();
    return { success: true, transaction };
  } catch (error) {
    console.error("[CREATE_TRANSACTION_ERROR]", error);
    return { error: "Erreur lors de la creation de la transaction." };
  }
}

export async function updateTransaction(id: string, data: TransactionInput) {
  try {
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    if (!context) return { error: "Non autorise." };

    const amount = Number(data?.amount);
    const category = typeof data?.category === "string" ? data.category.trim() : "";
    const description = typeof data?.description === "string" ? data.description.trim() : "";
    const date = data?.date ? new Date(data.date) : undefined;
    if (!id || !Number.isFinite(amount) || amount <= 0 || !category || !description ||
        !(data.type === "INCOME" || data.type === "EXPENSE") || category.length > 100 || description.length > 1000 ||
        (date && Number.isNaN(date.getTime()))) {
      return { error: "Verifiez les informations de la transaction." };
    }

    const result = await prisma.transaction.updateMany({
      where: { id, daaraId: context.daaraId },
      data: {
        amount,
        type: data.type,
        category,
        description,
        ...(date ? { createdAt: date } : {}),
      },
    });
    if (result.count !== 1) return { error: "Transaction introuvable." };

    revalidateFinancePages();
    return { success: true };
  } catch (error) {
    console.error("[UPDATE_TRANSACTION_ERROR]", error);
    return { error: "Erreur lors de la mise a jour." };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    if (!context) return { error: "Non autorise." };
    if (!id) return { error: "Transaction introuvable." };

    const result = await prisma.transaction.deleteMany({
      where: { id, daaraId: context.daaraId },
    });
    if (result.count !== 1) return { error: "Transaction introuvable." };

    revalidateFinancePages();
    return { success: true };
  } catch (error) {
    console.error("[DELETE_TRANSACTION_ERROR]", error);
    return { error: "Erreur lors de la suppression." };
  }
}
