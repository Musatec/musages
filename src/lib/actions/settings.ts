"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { DAARA_MANAGER_ROLES } from "@/lib/action-context";
import { z } from "zod";

const updateSettingsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().max(250).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  ninea: z.string().trim().max(60).optional(),
  slogan: z.string().trim().max(200).optional(),
  gradingSystem: z.string().trim().max(50).optional(),
  averageBase: z.number().min(1).max(100).optional(),
  reportHeaderLeft: z.string().trim().max(300).optional(),
  reportHeaderRight: z.string().trim().max(300).optional(),
});

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
    if (!session?.user?.id || !DAARA_MANAGER_ROLES.includes(session.user.role)) return { error: "Non autorisé." };

    const parsed = updateSettingsSchema.safeParse(data);
    if (!parsed.success) {
      return { error: "Vérifiez les paramètres saisis." };
    }
    const payload = parsed.data;

    const daara = await prisma.daara.findUnique({ where: { id: daaraId } });
    const currentConfig = (daara?.config as any) || {};

    const updatedDaara = await prisma.daara.update({
      where: { id: daaraId },
      data: {
        name: payload.name,
        address: payload.address || null,
        phone: payload.phone || null,
        email: payload.email || null,
        ninea: payload.ninea || null,
        config: {
          ...currentConfig,
          slogan: payload.slogan,
          gradingSystem: payload.gradingSystem || "BASE_20_COEF",
          averageBase: payload.averageBase || 20,
          reportHeaderLeft: payload.reportHeaderLeft || "",
          reportHeaderRight: payload.reportHeaderRight || ""
        }
      }
    });

    revalidatePath("/settings");
    revalidatePath("/grades");
    revalidatePath("/tuition");
    return { success: true, school: updatedDaara, daara: updatedDaara };
  } catch (error: any) {
    console.error("[UPDATE_SETTINGS_ERROR]", error);
    return { error: "Erreur lors de la mise à jour des paramètres." };
  }
}
