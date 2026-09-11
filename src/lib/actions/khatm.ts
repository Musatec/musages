"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

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
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

    if (!data.talibeId || !data.oustazName) {
      return { error: "Le Talibé et le nom de l'Oustaz sont obligatoires." };
    }

    const khatm = await prisma.khatmRecord.create({
      data: {
        daaraId,
        talibeId: data.talibeId,
        qiraatVersion: data.qiraatVersion || "Warsh 'an Nafi'",
        oustazName: data.oustazName,
        completionDate: data.completionDate ? new Date(data.completionDate) : new Date(),
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
    return { error: error.message || "Erreur lors de la création du diplôme de Khatm." };
  }
}

export async function getKhatmRecords() {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

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
