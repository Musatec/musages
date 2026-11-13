"use server";

import { getActionContext, DAARA_MANAGER_ROLES } from "@/lib/action-context";

export async function getDebts() {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return context
    ? { success: false, debts: [], error: "Le registre des dettes n'est pas disponible : aucun modèle de dette n'est configuré." }
    : { success: false, debts: [], error: "Non autorisé." };
}

export async function registerDebtPayment() {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return context ? { success: false, error: "Le registre des dettes n'est pas encore disponible." } : { success: false, error: "Non autorise." };
}
