"use server";

import { getActionContext, DAARA_MANAGER_ROLES } from "@/lib/action-context";
const unavailable = "Le module fournisseurs n'est pas encore disponible.";

export async function getSuppliers(_data?: unknown): Promise<{ success: boolean; suppliers?: any[]; error?: string }> {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return context
    ? { success: false, suppliers: [], error: "Le registre des fournisseurs n'est pas disponible : aucun modèle de fournisseur n'est configuré." }
    : { success: false, suppliers: [], error: "Non autorisé." };
}

export async function createSupplier(_data: unknown): Promise<{ success: boolean; error?: string }> {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return context ? { success: false, error: unavailable } : { success: false, error: "Non autorise." };
}

export async function processPurchase(_data: unknown): Promise<{ success: boolean; error?: string }> {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return context ? { success: false, error: unavailable } : { success: false, error: "Non autorise." };
}
