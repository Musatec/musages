"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DAARA_MANAGER_ROLES, getActionContext } from "@/lib/action-context";
import { createSchool as createSchoolRecord } from "@/lib/actions/schools";

export async function createSchool(data: { name: string; address?: string; phone?: string; email?: string; ninea?: string }) {
  return createSchoolRecord(data);
}

export async function createClass(data: { name: string; level?: string; monthlyFee?: number }) {
  try {
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    if (!context) return { error: "Non autorise." };
    if (typeof data?.name !== "string" || !data.name.trim()) return { error: "Le nom de la classe est obligatoire." };

    const halqa = await prisma.halqa.create({
      data: {
        daaraId: context.daaraId,
        name: data.name.trim(),
        level: data.level?.trim() || "MEMORISATION",
      },
    });
    revalidatePath("/classes");
    return { success: true, class: halqa };
  } catch (error) {
    console.error("[CREATE_CLASS_ERROR]", error);
    return { error: "Erreur lors de la creation de la classe." };
  }
}

export async function createSubject(_data: { name: string; coefficient?: number; code?: string }) {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  if (!context) return { error: "Non autorise." };
  return { error: "La gestion des matieres n'est pas encore disponible." };
}
