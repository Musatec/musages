"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { DAARA_STAFF_ROLES } from "@/lib/action-context";

export interface CreateKhatmInput {
  talibeId: string;
  qiraatVersion: string;
  oustazName: string;
  completionDate?: string;
  notes?: string;
}

export async function createKhatmRecord(data: CreateKhatmInput) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { error: "Non autorisé" };
    if (!DAARA_STAFF_ROLES.includes(session.user.role)) return { error: "Non autorisé" };

    if (!data || typeof data.talibeId !== "string" || !data.talibeId || typeof data.oustazName !== "string" || !data.oustazName.trim()) {
      return { error: "Le Talibé et le nom de l'Oustaz sont obligatoires." };
    }
    if (data.completionDate !== undefined && typeof data.completionDate !== "string") {
      return { error: "La date de complétion n'est pas valide." };
    }
    const completionDate = data.completionDate ? new Date(data.completionDate) : new Date();
    if (Number.isNaN(completionDate.getTime()) || completionDate > new Date() || data.oustazName.trim().length > 120 ||
        typeof data.qiraatVersion !== "string" || data.qiraatVersion.length > 120 ||
        (data.notes !== undefined && (typeof data.notes !== "string" || data.notes.length > 1000))) {
      return { error: "Vérifiez la date et les informations du Khatm." };
    }

    const talibe = await prisma.talibe.findFirst({
      where: { id: data.talibeId, daaraId, space: "daara", deletedAt: null },
      select: { id: true },
    });
    if (!talibe) return { error: "Talibé introuvable dans ce Daara." };

    const khatm = await prisma.khatmRecord.create({
      data: {
        daaraId,
        talibeId: data.talibeId,
        qiraatVersion: data.qiraatVersion.trim() || "Warsh 'an Nafi'",
        oustazName: data.oustazName.trim(),
        completionDate,
        notes: data.notes || null,
      },
      include: {
        talibe: true
      }
    });

    revalidatePath("/khatm");
    revalidatePath("/hifz");

    return { success: true, khatm };
  } catch (error: any) {
    console.error("[CREATE_KHATM_ERROR]", error);
    return { error: "Erreur lors de la création du diplôme de Khatm." };
  }
}

export async function getKhatmRecords() {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { records: [], daara: null };
    if (!DAARA_STAFF_ROLES.includes(session.user.role)) return { records: [], daara: null };

    const records = await prisma.khatmRecord.findMany({
      where: { daaraId },
      include: {
        talibe: {
          include: {
            halqa: true
          }
        }
      },
      orderBy: { completionDate: "desc" }
    });

    const daara = await prisma.daara.findUnique({
      where: { id: daaraId },
      select: { name: true, city: true, logo: true, ninea: true }
    });

    return { records, daara };
  } catch (error: any) {
    console.error("[GET_KHATM_RECORDS_ERROR]", error);
    return { records: [], daara: null };
  }
}
