"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createSchool(data: { name: string; address?: string; phone?: string; email?: string; ninea?: string }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { error: "Vous devez être connecté." };
    }

    const daara = await prisma.daara.create({
      data: {
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        ninea: data.ninea || null,
        ownerId: userId,
      },
    });

    // Assigner l'utilisateur comme SERIGNE_DAARA de ce Daara
    await prisma.user.update({
      where: { id: userId },
      data: {
        daaraId: daara.id,
        role: "SERIGNE_DAARA",
        hasSeenOnboarding: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, school: daara, daara };
  } catch (error: any) {
    console.error("[CREATE_DAARA_ERROR]", error);
    return { error: error.message || "Erreur lors de la création du Daara." };
  }
}

export async function createClass(data: { name: string; level?: string; monthlyFee?: number }) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) {
      return { error: "Aucun établissement configuré." };
    }

    const newHalqa = await prisma.halqa.create({
      data: {
        daaraId,
        name: data.name,
        level: data.level || "MÉMORISATION (Hifz)",
      },
    });

    revalidatePath("/classes");
    return { success: true, class: newHalqa };
  } catch (error: any) {
    console.error("[CREATE_HALQA_ERROR]", error);
    return { error: error.message || "Erreur lors de la création de la Halqa." };
  }
}

export async function createSubject(data: { name: string; coefficient?: number; code?: string }) {
  try {
    return { success: true, subject: { id: "default", name: data.name } };
  } catch (error: any) {
    return { error: "Erreur lors de la création." };
  }
}
