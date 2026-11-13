"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DAARA_MANAGER_ROLES, getActionContext } from "@/lib/action-context";

export interface RecordTuitionInput {
  talibeId: string;
  amountPaid: number;
  month: string;
  paymentMethod: "CASH" | "CHEQUE";
  notes?: string;
}

export async function recordTuitionPayment(data: RecordTuitionInput) {
  try {
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    const daaraId = context?.daaraId;
    if (!context || !daaraId) return { error: "Non autorisé" };

    const amountPaid = Number(data?.amountPaid);
    if (!data?.talibeId || !Number.isFinite(amountPaid) || amountPaid <= 0) {
      return { error: "Le Talibé et le montant du paiement sont obligatoires." };
    }
    if (typeof data.month !== "string" || data.month.length > 40) {
      return { error: "La période indiquée n'est pas valide." };
    }

    if (data.paymentMethod !== "CASH" && data.paymentMethod !== "CHEQUE") {
      return { error: "Seuls les règlements reçus physiquement peuvent être enregistrés ici." };
    }

    const talibe = await prisma.talibe.findFirst({
      where: { id: data.talibeId, daaraId, space: context.space, deletedAt: null },
      select: { firstName: true, lastName: true, matricule: true, parentName: true, parentPhone: true }
    });
    if (!talibe) return { error: "Apprenant introuvable dans cet espace." };

    const studentName = talibe ? `${talibe.firstName} ${talibe.lastName}` : "Talibé";
    const receiptNumber = `REC-SCOL-${Date.now().toString().slice(-6)}`;

    // Create financial transaction
    const transaction = await prisma.transaction.create({
      data: {
        daaraId,
        space: context.space,
        amount: amountPaid,
        type: "INCOME",
        category: "SCOLARITE",
        description: `${context.space === "school" ? "Écolage Mensuel" : "Cotisation Mensuelle"} (${data.month || "En cours"}) — ${studentName} (${talibe?.matricule || "N/A"}) via ${data.paymentMethod}`,
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
      whatsappMessage: `Assalamu alaykum ${talibe.parentName || "Parent"}. Le Daara a bien reçu la cotisation mensuelle de ${amountPaid.toLocaleString()} FCFA pour ${studentName} (Reçu N° ${receiptNumber}). Baraka Allahou Feekum.`
    };
  } catch (error: any) {
    console.error("[RECORD_TUITION_ERROR]", error);
    return { error: "Erreur lors de l'enregistrement du paiement." };
  }
}

export async function getTuitionRecords() {
  try {
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    const daaraId = context?.daaraId;
    if (!context || !daaraId) return { transactions: [] };

    // Fetch scolarité income transactions for active space
    const transactions = await prisma.transaction.findMany({
      where: {
        daaraId,
        space: context.space,
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

export async function generateMonthlyTuitions(
  _month: number,
  _year: number
): Promise<{ success?: boolean; count?: number; error?: string }> {
  try {
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    const daaraId = context?.daaraId;
    if (!context || !daaraId) return { error: "Non autorisé" };

    return { error: "La génération automatique des cotisations n'est pas encore disponible." };
  } catch (error: any) {
    console.error("[GENERATE_TUITION_ERROR]", error);
    return { error: "Erreur lors de la génération." };
  }
}
