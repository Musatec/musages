"use server";

import { DonationType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DAARA_MANAGER_ROLES, getActionContext } from "@/lib/action-context";

type RecordDonationInput = {
  donorName: string;
  donorPhone?: string;
  type: DonationType;
  amount?: number;
  natureDetails?: string;
  paymentMethod?: "CASH" | "CHEQUE" | "VIREMENT";
  notes?: string;
};

export async function getDonations() {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  if (!context) {
    return {
      success: false as const,
      donations: [],
      totalFinancial: 0,
      natureCount: 0,
      error: "Non autorisé.",
    };
  }

  try {
    const [donations, financialTotal, natureCount] = await Promise.all([
      prisma.donation.findMany({
        where: { daaraId: context.daaraId },
        orderBy: { date: "desc" },
        take: 100,
        select: {
          id: true, donorName: true, donorPhone: true, type: true, amount: true,
          natureDetails: true, paymentMethod: true, receiptNumber: true, notes: true, date: true,
        },
      }),
      prisma.donation.aggregate({
        where: { daaraId: context.daaraId, type: DonationType.FINANCIER },
        _sum: { amount: true },
      }),
      prisma.donation.count({ where: { daaraId: context.daaraId, type: DonationType.DON_NATURE } }),
    ]);

    return {
      success: true,
      donations,
      totalFinancial: financialTotal._sum.amount || 0,
      natureCount,
    };
  } catch (error) {
    console.error("[GET_DONATIONS_ERROR]", error instanceof Error ? error.name : "unknown error");
    return {
      success: false as const,
      donations: [],
      totalFinancial: 0,
      natureCount: 0,
      error: "Impossible de charger le registre des dons.",
    };
  }
}

export async function recordDonation(data: RecordDonationInput) {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  if (!context) return { success: false, error: "Non autorisé." };
  if (!data || typeof data !== "object") return { success: false, error: "Les informations du don ne sont pas valides." };

  const donorName = typeof data?.donorName === "string" ? data.donorName.trim() : "";
  const donorPhone = typeof data?.donorPhone === "string" ? data.donorPhone.trim() : "";
  const notes = typeof data?.notes === "string" ? data.notes.trim() : "";
  const natureDetails = typeof data?.natureDetails === "string" ? data.natureDetails.trim() : "";
  const amount = data?.amount === undefined ? undefined : Number(data.amount);
  const allowedMethods = ["CASH", "CHEQUE", "VIREMENT"] as const;

  if (!donorName || donorName.length > 120 || donorPhone.length > 40 || notes.length > 500) {
    return { success: false, error: "Vérifiez le nom, le téléphone et les notes du donateur." };
  }
  if (data.type === DonationType.FINANCIER) {
    if (!Number.isFinite(amount) || (amount ?? 0) <= 0 || (amount ?? 0) > 1_000_000_000 ||
        !allowedMethods.includes(data.paymentMethod as (typeof allowedMethods)[number])) {
      return { success: false, error: "Le montant et le mode de réception du don financier sont requis." };
    }
  } else if (data.type === DonationType.DON_NATURE) {
    if (!natureDetails || natureDetails.length > 500) {
      return { success: false, error: "Décrivez le don en nature reçu." };
    }
  } else {
    return { success: false, error: "Le type de don n'est pas valide." };
  }

  try {
    const donation = await prisma.$transaction(async (tx) => {
      const created = await tx.donation.create({
        data: {
          daaraId: context.daaraId,
          donorName,
          donorPhone: donorPhone || null,
          type: data.type,
          amount: data.type === DonationType.FINANCIER ? amount : null,
          natureDetails: data.type === DonationType.DON_NATURE ? natureDetails : null,
          paymentMethod: data.type === DonationType.FINANCIER ? data.paymentMethod : null,
          receiptNumber: `REC-SADAQA-${Date.now()}`,
          notes: notes || null,
          date: new Date(),
        },
        select: {
          id: true, donorName: true, donorPhone: true, type: true, amount: true,
          natureDetails: true, paymentMethod: true, receiptNumber: true, notes: true, date: true,
        },
      });

      if (data.type === DonationType.FINANCIER && amount !== undefined) {
        await tx.transaction.create({
          data: {
            daaraId: context.daaraId,
            amount,
            type: "INCOME",
            category: "SADAQA",
            description: `Don de ${donorName} (${data.paymentMethod})`,
          },
        });
      }
      return created;
    });

    revalidatePath("/sadaqa");
    revalidatePath("/reports");
    revalidatePath("/dashboard");
    return { success: true, donation };
  } catch (error) {
    console.error("[RECORD_DONATION_ERROR]", error instanceof Error ? error.name : "unknown error");
    return { success: false, error: "Impossible d'enregistrer ce don." };
  }
}
