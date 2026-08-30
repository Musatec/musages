"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// --- ACTIONS POUR LES HALQAS (CLASSES/CERCLES D'ÉTUDE) ---

export async function addClass(data: {
  name: string;
  description?: string;
  level?: string;
  oustazName?: string;
}) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide ou Daara non configuré." };

    const newHalqa = await prisma.halqa.create({
      data: {
        daaraId,
        name: data.name,
        level: data.level,
        oustazName: data.oustazName,
      }
    });

    revalidatePath("/classes");
    return { success: true, class: newHalqa };
  } catch (error: any) {
    console.error("[ADD_HALQA_ERROR]", error);
    return { error: error.message || "Erreur lors de la création de la Halqa." };
  }
}

export async function deleteClass(id: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };

    const halqaWithTalibes = await prisma.halqa.findUnique({
      where: { id },
      include: { talibes: true }
    });

    if (halqaWithTalibes && halqaWithTalibes.talibes.length > 0) {
      return { error: "Impossible de supprimer cette Halqa car elle contient des Talibés." };
    }

    await prisma.halqa.delete({
      where: { id }
    });

    revalidatePath("/classes");
    return { success: true };
  } catch (error: any) {
    return { error: "Erreur lors de la suppression de la Halqa." };
  }
}

// --- ACTIONS POUR LES MATIÈRES / ENSEIGNEMENTS ---

export async function addSubject(data: {
  name: string;
  code?: string;
  coefficient?: number;
}) {
  try {
    return { success: true, subject: { id: "default", name: data.name } };
  } catch (error: any) {
    return { error: "Erreur lors de l'ajout." };
  }
}

export async function deleteSubject(id: string) {
  try {
    return { success: true };
  } catch (error: any) {
    return { error: "Erreur lors de la suppression." };
  }
}
