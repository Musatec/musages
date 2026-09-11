"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getSocialCases() {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

    // Récupération des Talibés marqués comme Cas Sociaux
    const socialTalibes = await prisma.talibe.findMany({
      where: {
        daaraId,
        deletedAt: null,
        isSocialCase: true,
      },
      include: {
        halqa: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Statistiques global Daara
    const totalTalibes = await prisma.talibe.count({
      where: { daaraId, deletedAt: null },
    });

    const totalSocialCases = socialTalibes.length;
    const totalInternesExempted = socialTalibes.filter(t => t.status === "INTERNE").length;

    return {
      success: true,
      socialCases: socialTalibes,
      stats: {
        totalTalibes,
        totalSocialCases,
        totalInternesExempted,
      },
    };
  } catch (error: any) {
    console.error("[GET_SOCIAL_CASES_ERROR]", error);
    return {
      success: false,
      socialCases: [],
      stats: { totalTalibes: 0, totalSocialCases: 0, totalInternesExempted: 0 },
      error: error.message || "Erreur lors du chargement des cas sociaux.",
    };
  }
}

export async function getAvailableTalibesForSocialCase() {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

    const available = await prisma.talibe.findMany({
      where: {
        daaraId,
        deletedAt: null,
        isSocialCase: false,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        matricule: true,
        parentName: true,
        parentPhone: true,
        createdAt: true,
        status: true,
      },
      orderBy: {
        lastName: "asc",
      },
    });

    return { success: true, talibes: available };
  } catch (error: any) {
    console.error("[GET_AVAILABLE_TALIBES_ERROR]", error);
    return { success: false, talibes: [] };
  }
}

export async function toggleSocialCase(
  talibeId: string,
  isSocialCase: boolean,
  socialNotes?: string
) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

    const existing = await prisma.talibe.findFirst({
      where: { id: talibeId, daaraId, deletedAt: null },
    });

    if (!existing) {
      return { error: "Talibé introuvable dans ce Daara." };
    }

    const updated = await prisma.talibe.update({
      where: { id: talibeId },
      data: {
        isSocialCase,
        socialNotes: isSocialCase ? (socialNotes || "Prise en charge cas social") : null,
      },
    });

    revalidatePath("/cas-sociaux");
    revalidatePath("/parrainage");
    revalidatePath("/students");
    revalidatePath("/tuition");

    return { success: true, talibe: updated };
  } catch (error: any) {
    console.error("[TOGGLE_SOCIAL_CASE_ERROR]", error);
    return { error: error.message || "Erreur lors de la mise à jour." };
  }
}
