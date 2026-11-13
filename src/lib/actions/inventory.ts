"use server";

import { getActionContext, DAARA_MANAGER_ROLES } from "@/lib/action-context";

const unavailable = "Le module inventaire n'est pas disponible : aucun modèle de produit ou de stock n'est configuré.";

export async function getProducts(_data?: unknown) {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return context ? { success: false, products: [], error: unavailable } : { success: false, products: [], error: "Non autorisé." };
}

export async function createProduct(_data?: unknown): Promise<{ success: boolean; error?: string }> {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return { success: false, error: context ? unavailable : "Non autorisé." };
}

export async function updateStock(_data?: unknown): Promise<{ success: boolean; error?: string }> {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return { success: false, error: context ? unavailable : "Non autorisé." };
}

export async function deleteProduct(_id?: string): Promise<{ success: boolean; error?: string }> {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return { success: false, error: context ? unavailable : "Non autorisé." };
}

export async function bulkCreateProducts(_products?: unknown[]): Promise<{ success: boolean; count?: number; error?: string }> {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return { success: false, error: context ? unavailable : "Non autorisé." };
}
