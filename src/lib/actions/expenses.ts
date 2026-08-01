"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { TransactionType } from "@prisma/client";

export async function addExpense(data: {
  amount: number;
  category: string;
  description: string;
}) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return { error: "Session non valide." };

    const transaction = await prisma.transaction.create({
      data: {
        schoolId,
        amount: Number(data.amount),
        type: TransactionType.EXPENSE,
        category: data.category,
        description: data.description,
      }
    });

    revalidatePath("/expenses");
    return { success: true, transaction };
  } catch (error: any) {
    console.error("[ADD_EXPENSE_ERROR]", error);
    return { error: "Erreur lors de l'enregistrement de la dépense." };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return { error: "Session non valide." };

    await prisma.transaction.delete({
      where: { id, schoolId }
    });

    revalidatePath("/expenses");
    return { success: true };
  } catch (error: any) {
    return { error: "Impossible de supprimer la transaction." };
  }
}
