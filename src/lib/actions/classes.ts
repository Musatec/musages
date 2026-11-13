"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { DAARA_MANAGER_ROLES, getActionContext } from "@/lib/action-context";

export interface HalqaInput {
  name: string;
  level?: string;
  oustazName?: string;
  description?: string;
  tuitionFee?: string | number;
}

export async function createHalqa(data: HalqaInput) {
  try {
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    if (!context) return { error: "Non autorisé" };

    if (!data || typeof data.name !== "string" || data.name.trim().length < 2 || data.name.trim().length > 120) {
      return { error: "Le nom de la Halqa est obligatoire." };
    }
    if ((data.level !== undefined && (typeof data.level !== "string" || data.level.length > 80)) ||
        (data.oustazName !== undefined && (typeof data.oustazName !== "string" || data.oustazName.length > 120))) {
      return { error: "Vérifiez les informations de la Halqa." };
    }

    const halqa = await prisma.halqa.create({
      data: {
        daaraId: context.daaraId,
        space: context.space,
        name: data.name.trim(),
        level: data.level || (context.space === "school" ? "PRIMAIRE" : "MÉMORISATION (Hifz)"),
        oustazName: data.oustazName || null,
      }
    });

    revalidatePath("/classes");
    return { success: true, halqa, classItem: halqa, error: undefined };
  } catch (error: any) {
    console.error("[CREATE_HALQA_ERROR]", error);
    return { error: "Erreur lors de la création de la Halqa." };
  }
}

// Aliases pour la compatibilité du composant ClassesClient
export async function addClass(formData: any): Promise<{ success?: boolean; error?: string; classItem?: any }> {
  const name = typeof formData === 'string' ? formData : formData?.name;
  const level = formData?.level || "MÉMORISATION (Hifz)";
  const res = await createHalqa({ name, level });
  if (res.error) {
    return { error: res.error };
  }
  return { success: true, classItem: res.classItem };
}

export async function deleteClass(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    if (!context) return { error: "Non autorisé" };

    const result = await prisma.halqa.deleteMany({
      where: { id, daaraId: context.daaraId, space: context.space }
    });
    if (result.count !== 1) return { error: "Halqa introuvable." };

    revalidatePath("/classes");
    return { success: true };
  } catch (error: any) {
    console.error("[DELETE_HALQA_ERROR]", error);
    return { error: "Erreur lors de la suppression de la classe." };
  }
}

export async function updateHalqa(id: string, data: Partial<HalqaInput>) {
  try {
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    if (!context) return { error: "Non autorisé" };
    if (!id || !data || typeof data !== "object" ||
        (data.name !== undefined && (typeof data.name !== "string" || data.name.trim().length < 2 || data.name.trim().length > 120)) ||
        (data.level !== undefined && (typeof data.level !== "string" || data.level.length > 80)) ||
        (data.oustazName !== undefined && (typeof data.oustazName !== "string" || data.oustazName.length > 120))) {
      return { error: "Vérifiez les informations de la Halqa." };
    }

    const result = await prisma.halqa.updateMany({
      where: { id, daaraId: context.daaraId, space: context.space },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.level ? { level: data.level } : {}),
        ...(data.oustazName !== undefined ? { oustazName: data.oustazName } : {}),
      }
    });
    if (result.count !== 1) return { error: "Halqa introuvable." };

    const updated = await prisma.halqa.findFirst({
      where: { id, daaraId: context.daaraId, space: context.space },
    });

    revalidatePath("/classes");
    return { success: true, halqa: updated };
  } catch (error: any) {
    console.error("[UPDATE_HALQA_ERROR]", error);
    return { error: "Erreur lors de la modification de la Halqa." };
  }
}

export async function getHalqas() {
  try {
    const context = await getActionContext();
    if (!context) return { halqas: [] };

    const halqas = await prisma.halqa.findMany({
      where: { daaraId: context.daaraId, space: context.space },
      include: {
        _count: {
          select: { talibes: { where: { deletedAt: null, space: context.space } } }
        }
      },
      orderBy: { name: "asc" }
    });

    return { halqas };
  } catch (error: any) {
    console.error("[GET_HALQAS_ERROR]", error);
    return { halqas: [] };
  }
}
