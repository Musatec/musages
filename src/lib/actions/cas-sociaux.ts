"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { DAARA_MANAGER_ROLES, getActiveSpace } from "@/lib/action-context";

export async function getSocialCases() {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { success: false, socialCases: [], stats: { totalTalibes: 0, totalSocialCases: 0, totalInternesExempted: 0 }, error: "Non autorisé" };
    if (!DAARA_MANAGER_ROLES.includes(session.user.role)) return { success: false, socialCases: [], stats: { totalTalibes: 0, totalSocialCases: 0, totalInternesExempted: 0 }, error: "Non autorisé" };

    const space = await getActiveSpace();

    // Récupération des Talibés / Élèves marqués comme Cas Sociaux
    const socialTalibes = await prisma.talibe.findMany({
      where: {
        daaraId,
        space,
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

    // Statistiques global espace actif
    const totalTalibes = await prisma.talibe.count({
      where: { daaraId, space, deletedAt: null },
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
      error: "Erreur lors du chargement des cas sociaux.",
    };
  }
}

export async function getAvailableTalibesForSocialCase() {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { success: false, talibes: [] };
    if (!DAARA_MANAGER_ROLES.includes(session.user.role)) return { success: false, talibes: [] };

    const space = await getActiveSpace();
    const available = await prisma.talibe.findMany({
      where: {
        daaraId,
        space,
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
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { error: "Non autorisé" };
    if (!DAARA_MANAGER_ROLES.includes(session.user.role)) return { error: "Non autorisé" };
    if (typeof talibeId !== "string" || !talibeId || typeof isSocialCase !== "boolean" ||
        (socialNotes !== undefined && (typeof socialNotes !== "string" || socialNotes.length > 1000))) {
      return { error: "Les informations du dossier social ne sont pas valides." };
    }

    const space = await getActiveSpace();
    const existing = await prisma.talibe.findFirst({
      where: { id: talibeId, daaraId, space, deletedAt: null },
    });

    if (!existing) {
      return { error: "Apprenant introuvable dans cet espace." };
    }

    const result = await prisma.talibe.updateMany({
      where: { id: talibeId, daaraId, space, deletedAt: null },
      data: {
        isSocialCase,
        socialNotes: isSocialCase ? (socialNotes || "Prise en charge cas social") : null,
      },
    });
    if (result.count !== 1) return { error: "Talibé introuvable dans ce Daara." };
    const updated = await prisma.talibe.findFirst({ where: { id: talibeId, daaraId, deletedAt: null } });

    revalidatePath("/cas-sociaux");
    revalidatePath("/parrainage");
    revalidatePath("/students");
    revalidatePath("/tuition");

    return { success: true, talibe: updated };
  } catch (error: any) {
    console.error("[TOGGLE_SOCIAL_CASE_ERROR]", error);
    return { error: "Erreur lors de la mise à jour." };
  }
}
