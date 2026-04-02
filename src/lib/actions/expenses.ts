"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Récupère les dépenses pour la journée avec les auteurs réels (Dynamic)
 */
export async function getDailyExpenses(dateStr: string) {
    const session = await auth();
    if (!session?.user?.storeId) return { expenses: [], total: 0, dateLabel: "" };

    const storeId = session.user.storeId;
    const date = new Date(dateStr);
    
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

    try {
        const expenses = await prisma.transaction.findMany({
            where: {
                storeId,
                type: "EXPENSE",
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: {
                user: { select: { name: true } } // On récupère dynamiquement le nom de l'auteur connecte
            },
            orderBy: { createdAt: "desc" }
        });

        const total = expenses.reduce((acc, exp) => acc + exp.amount, 0);
        
        const dateLabel = date.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "2-digit",
            month: "short",
        });

        return { expenses, total, dateLabel };
    } catch (error) {
        console.error("[EXPENSES] Sync Error:", error);
        return { expenses: [], total: 0, dateLabel: "" };
    }
}

/**
 * Enregistre une dépense liée à l'utilisateur connecté (No hardcode)
 */
export async function createExpense(data: {
    amount: number;
    category: string;
    description: string;
    author?: string; // Information optionnelle sur le bénéficiaire
}) {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.storeId) return { error: "Non autorisé" };

    try {
        // On combine la description et le beneficiaire si présent
        const finalDesc = data.author 
            ? `${data.description} (Pour: ${data.author})` 
            : data.description;

        await prisma.transaction.create({
            data: {
                storeId: session.user.storeId,
                userId: session.user.id, // Liaison réelle avec l'utilisateur connecte
                amount: data.amount,
                type: "EXPENSE",
                category: data.category,
                description: finalDesc,
            }
        });

        revalidatePath("/expenses");
        revalidatePath("/capital");
        return { success: true };
    } catch (error) {
        console.error("[EXPENSES] Create Error:", error);
        return { error: "Impossible d'enregistrer la dépense." };
    }
}
