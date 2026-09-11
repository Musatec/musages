"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface PayTuitionInput {
  talibeId: string;
  amountPaid: number;
  month: string;
  paymentMethod: "WAVE" | "ORANGE_MONEY" | "CASH" | "CHEQUE" | "BANK_TRANSFER";
  notes?: string;
}

export async function payTuitionFee(data: PayTuitionInput) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

    if (!data.talibeId || !data.amountPaid) {
      return { error: "Le Talibé et le montant du paiement sont obligatoires." };
    }

    const talibe = await prisma.talibe.findUnique({
      where: { id: data.talibeId },
      select: { firstName: true, lastName: true, matricule: true, parentName: true, parentPhone: true }
    });

    const studentName = talibe ? `${talibe.firstName} ${talibe.lastName}` : "Talibé";
    const receiptNumber = `REC-SCOL-${Date.now().toString().slice(-6)}`;

    // Create financial transaction
    const transaction = await prisma.transaction.create({
      data: {
        daaraId,
        amount: Number(data.amountPaid),
        type: "INCOME",
        category: "SCOLARITE",
        description: `Cotisation Mensuelle (${data.month || "En cours"}) — ${studentName} (${talibe?.matricule || "N/A"}) via ${data.paymentMethod}`,
      }
    });

    revalidatePath("/tuition");
    revalidatePath("/expenses");
    revalidatePath("/dashboard");

    return {
      success: true,
      transaction,
      receiptNumber,
      talibe,
      whatsappMessage: `Assalamu alaykum ${talibe?.parentName || "Parent"}. Le Daara a bien reçu la cotisation mensuelle de ${data.amountPaid.toLocaleString()} FCFA pour ${studentName} (Reçu N° ${receiptNumber}). Baraka Allahou Feekum.`
    };
  } catch (error: any) {
    console.error("[PAY_TUITION_ERROR]", error);
    return { error: error.message || "Erreur lors de l'enregistrement du paiement." };
  }
}

export async function getTuitionRecords() {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

    // Fetch scolarité income transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        daaraId,
        type: "INCOME",
        category: "SCOLARITE"
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return { transactions };
  } catch (error: any) {
    console.error("[GET_TUITION_RECORDS_ERROR]", error);
    return { transactions: [] };
  }
}

export async function generateMonthlyTuitions(month: number, year: number) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

    revalidatePath("/tuition");
    return { success: true, count: 0 };
  } catch (error: any) {
    console.error("[GENERATE_TUITION_ERROR]", error);
    return { error: error.message || "Erreur lors de la génération." };
  }
}
