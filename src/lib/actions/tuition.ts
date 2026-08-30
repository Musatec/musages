"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function generateMonthlyTuitions(month: number, year: number) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide ou Daara non configuré." };

    revalidatePath("/tuition");
    return { success: true, count: 0 };
  } catch (error: any) {
    console.error("[GENERATE_TUITION_ERROR]", error);
    return { error: error.message || "Erreur lors de la génération." };
  }
}

export async function payTuitionFee(data: {
  tuitionId: string;
  amountPaid: number;
  paymentMethod: "CASH" | "WAVE" | "ORANGE_MONEY" | "CHEQUE" | "BANK_TRANSFER";
  notes?: string;
}) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };

    const transaction = await prisma.transaction.create({
      data: {
        daaraId,
        amount: Number(data.amountPaid),
        type: "INCOME",
        category: `COTISATION_${data.paymentMethod}`,
        description: data.notes || "Paiement Cotisation Daara",
      }
    });

    revalidatePath("/tuition");
    return {
      success: true,
      transaction,
      receiptUrl: `/receipts/REC-${Date.now()}`,
      whatsappMessage: `Paiement enregistré de ${data.amountPaid} FCFA. Merci !`
    };
  } catch (error: any) {
    console.error("[PAY_TUITION_ERROR]", error);
    return { error: error.message || "Erreur lors du paiement." };
  }
}
