"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TransactionType } from "@prisma/client";
import { DAARA_MANAGER_ROLES, getActionContext } from "@/lib/action-context";

export async function addExpense(data: {
  amount: number;
  category: string;
  description: string;
}) {
  try {
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    if (!context) return { error: "Non autorisé." };

    const amount = Number(data?.amount);
    const category = typeof data?.category === "string" ? data.category.trim() : "";
    const description = typeof data?.description === "string" ? data.description.trim() : "";
    if (!Number.isFinite(amount) || amount <= 0 || !category || category.length > 100 || !description || description.length > 1000) {
      return { error: "Vérifiez le montant, la catégorie et la description." };
    }

    const transaction = await prisma.transaction.create({
      data: {
        daaraId: context.daaraId,
        space: context.space,
        amount,
        type: TransactionType.EXPENSE,
        category,
        description,
      }
    });

    revalidatePath("/expenses");
    return { success: true, transaction };
  } catch (error: any) {
    console.error("[ADD_EXPENSE_ERROR]", error);
    return { error: "Erreur lors de l'enregistrement de la dépense." };
  }
}

export const createExpense = addExpense;

export async function deleteTransaction(id: string) {
  try {
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    if (!context) return { error: "Non autorisé." };

    const result = await prisma.transaction.deleteMany({
      where: { id, daaraId: context.daaraId, space: context.space }
    });
    if (result.count !== 1) return { error: "Transaction introuvable." };

    revalidatePath("/expenses");
    return { success: true };
  } catch {
    return { error: "Impossible de supprimer la transaction." };
  }
}
