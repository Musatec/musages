"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getEmployees() {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { employees: [], metrics: { totalPayroll: 0, totalAdvances: 0, netToPay: 0, count: 0 } };

    const users = await prisma.user.findMany({
      where: { daaraId, deletedAt: null }
    });

    return {
      employees: users,
      metrics: {
        totalPayroll: 0,
        totalAdvances: 0,
        netToPay: 0,
        count: users.length
      }
    };
  } catch (error) {
    return { employees: [], metrics: { totalPayroll: 0, totalAdvances: 0, netToPay: 0, count: 0 } };
  }
}

export async function createEmployee(data: any) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };

    const user = await prisma.user.create({
      data: {
        daaraId,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email,
        email: data.email || null,
        phone: data.phone || null,
        role: "OUSTAZ"
      }
    });

    revalidatePath("/hr");
    return { success: true, employee: user };
  } catch (error: any) {
    return { error: error.message || "Erreur lors de l'enregistrement." };
  }
}

export async function giveAdvance(id?: string, amount?: number) {
  try {
    revalidatePath("/hr");
    return { success: true };
  } catch (error: any) {
    return { error: "Erreur lors de l'enregistrement de l'acompte." };
  }
}

export async function payRestSalary(id?: string) {
  try {
    revalidatePath("/hr");
    return { success: true };
  } catch (error: any) {
    return { error: "Erreur lors du règlement." };
  }
}

export async function addEmployeeAdvance(id?: string, amount?: number) {
  return giveAdvance(id, amount);
}

export async function resetEmployeeAdvances(id?: string) {
  return payRestSalary(id);
}
