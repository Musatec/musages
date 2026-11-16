"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { DAARA_MANAGER_ROLES, getActionContext } from "@/lib/action-context";

export async function getSponsorships() {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  if (!context) {
    return {
      success: false as const,
      sponsorships: [],
      totalMonthlyCommitment: 0,
      activeCount: 0,
      activeSponsorCount: 0,
      error: "Non autorisé.",
    };
  }

  try {
    const activeWhere = { daaraId: context.daaraId, status: "ACTIVE" };
    const [sponsorships, activeTotal, activeCount, activeSponsorRows] = await Promise.all([
      prisma.sponsorship.findMany({
        where: { daaraId: context.daaraId },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: {
          id: true,
          sponsorName: true,
          sponsorPhone: true,
          monthlyAmount: true,
          status: true,
          startDate: true,
          notes: true,
          talibe: { select: { id: true, firstName: true, lastName: true, matricule: true } },
        },
      }),
      prisma.sponsorship.aggregate({ where: activeWhere, _sum: { monthlyAmount: true } }),
      prisma.sponsorship.count({ where: activeWhere }),
      prisma.sponsorship.findMany({ where: activeWhere, select: { sponsorName: true } }),
    ]);

    return {
      success: true,
      sponsorships,
      totalMonthlyCommitment: activeTotal._sum.monthlyAmount || 0,
      activeCount,
      activeSponsorCount: new Set(activeSponsorRows.map((item) => item.sponsorName.trim().toLowerCase())).size,
    };
  } catch (error) {
    console.error("[GET_SPONSORSHIPS_ERROR]", error instanceof Error ? error.name : "unknown error");
    return {
      success: false as const,
      sponsorships: [],
      totalMonthlyCommitment: 0,
      activeCount: 0,
      activeSponsorCount: 0,
      error: "Impossible de charger le registre des parrainages.",
    };
  }
}

export async function getSponsorshipTalibes() {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  if (!context) return { success: false, talibes: [], error: "Non autorisé." };

  try {
    const talibes = await prisma.talibe.findMany({
      where: { daaraId: context.daaraId, space: "daara", deletedAt: null },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: { id: true, firstName: true, lastName: true, matricule: true },
    });
    return { success: true, talibes };
  } catch (error) {
    console.error("[GET_SPONSORSHIP_TALIBES_ERROR]", error instanceof Error ? error.name : "unknown error");
    return { success: false, talibes: [], error: "Impossible de charger la liste des Talibés." };
  }
}

export async function createSponsorship(data: {
  talibeId: string;
  sponsorName: string;
  sponsorPhone: string;
  monthlyAmount: number;
  notes?: string;
}) {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  if (!context) return { success: false, error: "Non autorisé." };
  if (!data || typeof data !== "object") return { success: false, error: "Les informations du parrainage ne sont pas valides." };

  const talibeId = typeof data.talibeId === "string" ? data.talibeId.trim() : "";
  const sponsorName = typeof data.sponsorName === "string" ? data.sponsorName.trim() : "";
  const sponsorPhone = typeof data.sponsorPhone === "string" ? data.sponsorPhone.trim() : "";
  const monthlyAmount = Number(data.monthlyAmount);
  const notes = typeof data.notes === "string" ? data.notes.trim() : "";
  if (!talibeId || talibeId.length > 100 || sponsorName.length < 2 || sponsorName.length > 120 ||
      !sponsorPhone || sponsorPhone.length > 40 || !Number.isFinite(monthlyAmount) || monthlyAmount <= 0 || monthlyAmount > 1_000_000_000 || notes.length > 1000) {
    return { success: false, error: "Vérifiez le Talibé, les coordonnées du parrain et le montant mensuel engagé." };
  }

  try {
    const talibe = await prisma.talibe.findFirst({
      where: { id: talibeId, daaraId: context.daaraId, space: "daara", deletedAt: null },
      select: { id: true },
    });
    if (!talibe) return { success: false, error: "Talibé introuvable dans ce Daara." };

    const sponsorship = await prisma.sponsorship.create({
      data: {
        daaraId: context.daaraId,
        talibeId,
        sponsorName,
        sponsorPhone,
        monthlyAmount,
        status: "ACTIVE",
        notes: notes || null,
        startDate: new Date(),
      },
      select: {
        id: true, sponsorName: true, sponsorPhone: true, monthlyAmount: true, status: true,
        startDate: true, notes: true,
        talibe: { select: { id: true, firstName: true, lastName: true, matricule: true } },
      },
    });

    revalidatePath("/parrainage");
    return { success: true, sponsorship };
  } catch (error) {
    console.error("[CREATE_SPONSORSHIP_ERROR]", error instanceof Error ? error.name : "unknown error");
    return { success: false, error: "Impossible d'enregistrer le parrainage." };
  }
}
