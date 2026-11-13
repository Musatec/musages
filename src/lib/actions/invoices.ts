"use server";

import { DAARA_MANAGER_ROLES, getActionContext } from "@/lib/action-context";

export async function getInvoices(_filters?: unknown) {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  if (!context) return { success: false, invoices: [], error: "Non autorisé." };
  return { success: false, invoices: [], error: "Le registre des factures n'est pas disponible : aucun modèle de facturation n'est configuré." };
}
