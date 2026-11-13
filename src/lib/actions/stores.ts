"use server";

import { getActionContext, DAARA_MANAGER_ROLES } from "@/lib/action-context";
const unavailable = { success: false, error: "La gestion des boutiques n'est pas encore disponible." };

export async function getUserStores() {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  if (!context) return { success: false, ownedStores: [], currentStore: null, error: "Non autorisé." };
  return {
    success: false,
    ownedStores: [],
    currentStore: null,
    error: "La gestion des boutiques n'est pas disponible : aucun modèle de boutique n'est configuré.",
  };
}

export async function createStore(_name?: string) {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return context ? unavailable : { success: false, error: "Non autorise." };
}

export async function createSubStoreManager(_data?: unknown) {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return context ? unavailable : { success: false, error: "Non autorise." };
}

export async function switchStore(_id?: string) {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  return context ? unavailable : { success: false, error: "Non autorise." };
}
