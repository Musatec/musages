"use server";

import { prisma } from "@/lib/prisma";
import { DAARA_MANAGER_ROLES, getActionContext } from "@/lib/action-context";

export async function getEmployees() {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  if (!context) return { success: false, employees: [], error: "Non autorisé." };
  return {
    success: false,
    employees: [],
    error: "Le registre RH et de paie n'est pas configuré. Les salaires et acomptes ne sont pas enregistrés.",
  };
}

export async function createEmployee(_data: unknown) {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  if (!context) return { success: false, error: "Non autorisé." };
  return { success: false, error: "Le registre RH n'est pas configuré. Utilisez le module Oustazs pour gérer les enseignants." };
}

export async function giveAdvance(id?: string, amount?: number): Promise<{ success: boolean; error?: string }> {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  if (!context) return { success: false, error: "Non autorise." };
  if (!id || !Number.isFinite(amount) || (amount ?? 0) <= 0) return { success: false, error: "Acompte invalide." };
  const employee = await prisma.user.findFirst({
    where: { id, daaraId: context.daaraId, space: context.space, role: "OUSTAZ", deletedAt: null },
    select: { id: true },
  });
  if (!employee) return { success: false, error: "Employe introuvable." };
  return { success: false, error: "L'enregistrement des acomptes sera disponible apres la mise en place du registre de paie." };
}

export async function payRestSalary(id?: string): Promise<{ success: boolean; error?: string }> {
  const context = await getActionContext(DAARA_MANAGER_ROLES);
  if (!context) return { success: false, error: "Non autorise." };
  if (!id) return { success: false, error: "Employe introuvable." };
  const employee = await prisma.user.findFirst({
    where: { id, daaraId: context.daaraId, space: context.space, role: "OUSTAZ", deletedAt: null },
    select: { id: true },
  });
  if (!employee) return { success: false, error: "Employe introuvable." };
  return { success: false, error: "Le registre de paie n'est pas encore configure." };
}

export async function addEmployeeAdvance(id?: string, amount?: number): Promise<{ success: boolean; error?: string }> {
  return giveAdvance(id, amount);
}

export async function resetEmployeeAdvances(id?: string): Promise<{ success: boolean; error?: string }> {
  return payRestSalary(id);
}
