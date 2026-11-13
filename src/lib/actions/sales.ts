"use server";

import { getActionContext, DAARA_MANAGER_ROLES } from "@/lib/action-context";
const unavailable = "Le module ventes n'est pas disponible : aucun modèle de vente n'est configuré.";

export async function getDailyMetrics(_date?: unknown) {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return context ? { success: false, error: unavailable } : { success: false, error: "Non autorisé." };
}

export async function getSalePublicData(_id: string): Promise<{ success: boolean; sale?: any; error?: string }> {
  return { success: false, error: "Cette fonction n'est pas disponible." };
}

export async function getDebts(): Promise<{ success: boolean; debts: any[]; error?: string }> {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return context
    ? { success: false, debts: [], error: "Le registre des dettes n'est pas disponible : aucun modèle de dette n'est configuré." }
    : { success: false, debts: [], error: "Non autorisé." };
}

export async function registerDebtPayment(_id: string, _amount: number): Promise<{ success: boolean; error?: string }> {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return { success: false, error: context ? unavailable : "Non autorisé." };
}
