"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

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
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";
    const oustazId = session?.user?.id || null;

    if (!data.talibeId || !data.hizbNumber) {
      return { error: "Le Talibé et le numéro de Hizb sont obligatoires." };
    }

    if (data.hizbNumber < 1 || data.hizbNumber > 60) {
      return { error: "Le numéro de Hizb doit être entre 1 et 60." };
    }

    // Auto-calculate Juz if not provided (1 Juz = 2 Hizbs)
    const juzNumber = data.juzNumber || Math.ceil(data.hizbNumber / 2);

    const record = await prisma.hifzProgress.create({
      data: {
        daaraId,
        talibeId: data.talibeId,
        oustazId,
        hizbNumber: data.hizbNumber,
        juzNumber,
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
    return { error: error.message || "Erreur lors de l'enregistrement du progrès Hifz." };
  }
}

export async function getHifzHistory(talibeId: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

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
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

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
