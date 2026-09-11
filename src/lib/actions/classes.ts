"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface HalqaInput {
  name: string;
  level?: string;
  oustazName?: string;
  description?: string;
  tuitionFee?: string | number;
}

export async function createHalqa(data: HalqaInput) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

    if (!data.name || !data.name.trim()) {
      return { error: "Le nom de la Halqa est obligatoire." };
    }

    const halqa = await prisma.halqa.create({
      data: {
        daaraId,
        name: data.name.trim(),
        level: data.level || "MÉMORISATION (Hifz)",
        oustazName: data.oustazName || null,
      }
    });

    revalidatePath("/classes");
    return { success: true, halqa, classItem: halqa, error: undefined };
  } catch (error: any) {
    console.error("[CREATE_HALQA_ERROR]", error);
    return { error: error.message || "Erreur lors de la création de la Halqa." };
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
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

    await prisma.halqa.deleteMany({
      where: { id, daaraId }
    });

    revalidatePath("/classes");
    return { success: true };
  } catch (error: any) {
    console.error("[DELETE_HALQA_ERROR]", error);
    return { error: error.message || "Erreur lors de la suppression de la classe." };
  }
}

export async function addSubject(formData: any): Promise<{ success?: boolean; error?: string; id?: string }> {
  return { success: true, id: `subj_${Date.now()}` };
}

export async function deleteSubject(id: string): Promise<{ success?: boolean; error?: string }> {
  return { success: true };
}

export async function updateHalqa(id: string, data: Partial<HalqaInput>) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

    const existing = await prisma.halqa.findFirst({
      where: { id, daaraId }
    });

    if (!existing) {
      return { error: "Halqa introuvable." };
    }

    const updated = await prisma.halqa.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.level ? { level: data.level } : {}),
        ...(data.oustazName !== undefined ? { oustazName: data.oustazName } : {}),
      }
    });

    revalidatePath("/classes");
    return { success: true, halqa: updated };
  } catch (error: any) {
    console.error("[UPDATE_HALQA_ERROR]", error);
    return { error: error.message || "Erreur lors de la modification de la Halqa." };
  }
}

export async function getHalqas() {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

    const halqas = await prisma.halqa.findMany({
      where: { daaraId },
      include: {
        _count: {
          select: { talibes: { where: { deletedAt: null } } }
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
