"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function updateSchoolSettings(data: {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  ninea?: string;
  slogan?: string;
  gradingSystem?: string;
  averageBase?: number;
  reportHeaderLeft?: string;
  reportHeaderRight?: string;
}) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide ou Daara non configuré." };

    const daara = await prisma.daara.findUnique({ where: { id: daaraId } });
    const currentConfig = (daara?.config as any) || {};

    const updatedDaara = await prisma.daara.update({
      where: { id: daaraId },
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        ninea: data.ninea,
        config: {
          ...currentConfig,
          slogan: data.slogan,
          gradingSystem: data.gradingSystem || "BASE_20_COEF",
          averageBase: data.averageBase || 20,
          reportHeaderLeft: data.reportHeaderLeft || "",
          reportHeaderRight: data.reportHeaderRight || ""
        }
      }
    });

    revalidatePath("/settings");
    revalidatePath("/grades");
    revalidatePath("/tuition");
    return { success: true, school: updatedDaara, daara: updatedDaara };
  } catch (error: any) {
    console.error("[UPDATE_SETTINGS_ERROR]", error);
    return { error: error.message || "Erreur lors de la mise à jour des paramètres." };
  }
}
