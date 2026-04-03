"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Récupère tous les employés avec leurs métriques financières
 */
export async function getEmployees() {
    const session = await auth();
    if (!session?.user?.storeId) return { employees: [], metrics: null };

    const storeId = session.user.storeId;

    try {
        const employees = await prisma.employee.findMany({
            where: { storeId, deletedAt: null },
            orderBy: { firstName: "asc" }
        });

        const totalPayroll = employees.reduce((acc, e) => acc + e.salary, 0);
        const totalAdvances = employees.reduce((acc, e) => acc + e.advances, 0);

        return {
            employees,
            metrics: {
                totalPayroll,
                totalAdvances,
                netToPay: totalPayroll - totalAdvances,
                count: employees.length
            }
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[HR] Fetch Error:", message);
        return { employees: [], metrics: null };
    }
}

/**
 * Recruter un nouvel employé
 */
export async function createEmployee(data: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    salary: number;
}) {
    const session = await auth();
    if (!session?.user?.storeId) return { error: "Non autorisé" };

    try {
        const employee = await prisma.employee.create({
            data: {
                ...data,
                storeId: session.user.storeId,
            }
        });

        revalidatePath("/hr");
        return { success: true, employee };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[HR] Create Error:", message);
        return { error: "Impossible de créer l'employé" };
    }
}

/**
 * Accorder un acompte sur salaire
 */
export async function giveAdvance(employeeId: string, amount: number) {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.storeId) return { error: "Non autorisé" };

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Augmenter l'acompte de l'employé
            const employee = await tx.employee.update({
                where: { id: employeeId },
                data: { advances: { increment: amount } }
            });

            // 2. Créer une transaction de sortie (EXPENSE)
            await tx.transaction.create({
                data: {
                    storeId: session.user.storeId as string,
                    userId: session.user.id,
                    type: "EXPENSE",
                    amount: amount,
                    category: "SALARES / RH",
                    description: `Acompte versé à ${employee.firstName} ${employee.lastName}`,
                }
            });
        });

        revalidatePath("/hr");
        revalidatePath("/capital");
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[HR] Advance Error:", message);
        return { error: "Erreur lors du versement de l'acompte" };
    }
}

/**
 * Payer le solde du salaire (Fin de mois)
 */
export async function payRestSalary(employeeId: string) {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.storeId) return { error: "Non autorisé" };

    try {
        await prisma.$transaction(async (tx) => {
            const employee = await tx.employee.findUnique({ where: { id: employeeId } });
            if (!employee) throw new Error("Employé introuvable");

            const netToPay = employee.salary - employee.advances;
            if (netToPay <= 0) throw new Error("Rien à payer ce mois-ci");

            // 1. Créer la transaction finale
            await tx.transaction.create({
                data: {
                    storeId: session.user.storeId as string,
                    userId: session.user.id,
                    type: "EXPENSE",
                    amount: netToPay,
                    category: "SALARES / RH",
                    description: `Paiement Salaire (Solde) - ${employee.firstName} ${employee.lastName}`,
                }
            });

            // 2. Remettre les acomptes à 0 pour le mois suivant
            await tx.employee.update({
                where: { id: employeeId },
                data: { advances: 0 }
            });
        });

        revalidatePath("/hr");
        revalidatePath("/capital");
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[HR] Pay Error:", message);
        return { error: message };
    }
}

// Compatibilité avec les anciens composants
export { giveAdvance as addEmployeeAdvance, payRestSalary as resetEmployeeAdvances };
