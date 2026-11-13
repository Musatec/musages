"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { DAARA_STAFF_ROLES } from "@/lib/action-context";

export interface HifzRecordInput {
  talibeId: string;
  hizbNumber: number;
  juzNumber?: number;
  surahName?: string;
  surahNumber?: number;
  ayahStart?: number;
  ayahEnd?: number;
  allwaBoard?: string;
  grade?: "MUMTAZ" | "JAYYID_JIDDAN" | "JAYYID" | "A_REVISER";
  notes?: string;
}

export async function addHifzRecord(data: HifzRecordInput) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { error: "Non autorisé" };
    if (!DAARA_STAFF_ROLES.includes(session.user.role)) return { error: "Non autorisé" };
    const oustazId = session?.user?.id || null;

    if (!data || typeof data.talibeId !== "string" || !data.talibeId || !Number.isInteger(data.hizbNumber)) {
      return { error: "Le Talibé et le numéro de Hizb sont obligatoires." };
    }

    if (data.hizbNumber < 1 || data.hizbNumber > 60) {
      return { error: "Le numéro de Hizb doit être entre 1 et 60." };
    }
    if ((data.juzNumber !== undefined && (!Number.isInteger(data.juzNumber) || data.juzNumber < 1 || data.juzNumber > 30)) ||
        (data.surahNumber !== undefined && (!Number.isInteger(data.surahNumber) || data.surahNumber < 1 || data.surahNumber > 114)) ||
        (data.ayahStart !== undefined && (!Number.isInteger(data.ayahStart) || data.ayahStart < 1)) ||
        (data.ayahEnd !== undefined && (!Number.isInteger(data.ayahEnd) || data.ayahEnd < 1)) ||
        (data.ayahStart !== undefined && data.ayahEnd !== undefined && data.ayahEnd < data.ayahStart) ||
        (data.grade !== undefined && !["MUMTAZ", "JAYYID_JIDDAN", "JAYYID", "A_REVISER"].includes(data.grade)) ||
        [data.surahName, data.allwaBoard, data.notes].some((value) => typeof value === "string" && value.length > 500)) {
      return { error: "Vérifiez les détails de la progression Hifz." };
    }

    const talibe = await prisma.talibe.findFirst({
      where: { id: data.talibeId, daaraId, deletedAt: null },
      select: { id: true },
    });
    if (!talibe) return { error: "Talibé introuvable dans ce Daara." };

    // Auto-calculate Juz if not provided (1 Juz = 2 Hizbs)
    const juzNumber = data.juzNumber || Math.ceil(data.hizbNumber / 2);

    const record = await prisma.hifzProgress.create({
      data: {
        daaraId,
        talibeId: data.talibeId,
        oustazId,
        hizbNumber: data.hizbNumber,
        juzNumber,
        evaluation: data.grade || "JAYYID",
        surahName: data.surahName || null,
        surahNumber: data.surahNumber || null,
        ayahStart: data.ayahStart || null,
        ayahEnd: data.ayahEnd || null,
        allwaNotes: data.allwaBoard || null,
        comments: data.notes || null,
      }
    });

    revalidatePath("/hifz");
    revalidatePath(`/students/${data.talibeId}`);

    return { success: true, record };
  } catch (error: any) {
    console.error("[ADD_HIFZ_RECORD_ERROR]", error);
    return { error: "Erreur lors de l'enregistrement du progrès Hifz." };
  }
}

export async function getHifzHistory(talibeId: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { records: [] };
    if (!DAARA_STAFF_ROLES.includes(session.user.role)) return { records: [] };

    const records = await prisma.hifzProgress.findMany({
      where: {
        daaraId,
        talibeId,
      },
      include: {
        oustaz: {
          select: { name: true, email: true }
        }
      },
      orderBy: { date: "desc" },
      take: 50
    });

    return { records };
  } catch (error: any) {
    console.error("[GET_HIFZ_HISTORY_ERROR]", error);
    return { records: [] };
  }
}

export async function getDaaraHifzStats() {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { totalTalibes: 0, recentRecords: [] };
    if (!DAARA_STAFF_ROLES.includes(session.user.role)) return { totalTalibes: 0, recentRecords: [] };

    const totalTalibes = await prisma.talibe.count({
      where: { daaraId, deletedAt: null }
    });

    const recentRecords = await prisma.hifzProgress.findMany({
      where: { daaraId },
      orderBy: { date: "desc" },
      take: 10,
      include: {
        talibe: {
          select: { firstName: true, lastName: true, matricule: true }
        }
      }
    });

    return {
      totalTalibes,
      recentRecords,
    };
  } catch (error: any) {
    console.error("[GET_HIFZ_STATS_ERROR]", error);
    return { totalTalibes: 0, recentRecords: [] };
  }
}
