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
}) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return { error: "Session non valide ou école non configurée." };

    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    const currentConfig = school?.config as any || {};

    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: {
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        ninea: data.ninea,
        config: {
          ...currentConfig,
          slogan: data.slogan
        }
      }
    });

    revalidatePath("/settings");
    revalidatePath("/grades"); // Le bulletin utilise ces infos
    revalidatePath("/tuition"); // Les reçus utilisent ces infos
    return { success: true, school: updatedSchool };
  } catch (error: any) {
    console.error("[UPDATE_SETTINGS_ERROR]", error);
    return { error: error.message || "Erreur lors de la mise à jour des paramètres." };
  }
}
