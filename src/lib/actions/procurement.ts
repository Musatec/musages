"use server";

import { getActionContext, DAARA_MANAGER_ROLES } from "@/lib/action-context";
const unavailable = { error: "Le module achats n'est pas encore disponible." };

export async function getSuppliers() {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return context
    ? { success: false, suppliers: [], error: "Le registre des fournisseurs n'est pas disponible : aucun modèle de fournisseur n'est configuré." }
    : { success: false, suppliers: [], error: "Non autorisé." };
}

export async function processPurchase() {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return { success: false, error: context ? unavailable.error : "Non autorisé." };
}

export async function createSupplier() {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return { success: false, error: context ? unavailable.error : "Non autorisé." };
}
