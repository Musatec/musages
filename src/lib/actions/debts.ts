"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Récupère tous les clients ayant des dettes (Sales non soldées)
 */
export async function getDebts() {
    const session = await auth();
    if (!session?.user?.storeId) return { debts: [], metrics: null };

    const storeId = session.user.storeId;

    try {
        const debts = await prisma.sale.findMany({
            where: {
                storeId,
                amountPaid: { lt: prisma.sale.fields.totalAmount }, // Only debts
            },
            include: {
                items: true,
                seller: { select: { name: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        const totalDebt = debts.reduce((acc, s) => acc + (s.totalAmount - s.amountPaid), 0);
        const uniqueDebtors = new Set(debts.map(s => s.customerName)).size;

        return {
            debts,
            metrics: {
                totalDebt,
                debtorCount: uniqueDebtors,
                invoiceCount: debts.length
            }
        };
    } catch (error) {
        console.error("[DEBTS] Fetch Error:", error);
        return { debts: [], metrics: null };
    }
}

/**
 * Encaisser un versement partiel sur une dette existante
 */
export async function registerDebtPayment(saleId: string, amount: number) {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.storeId) return { error: "Non autorisé" };

    try {
        const sale = await prisma.sale.findUnique({ where: { id: saleId } });
        if (!sale) return { error: "Facture introuvable" };

        const newAmountPaid = sale.amountPaid + amount;
        const isCompleted = newAmountPaid >= sale.totalAmount;

        // 1. Mettre à jour la vente
        await prisma.sale.update({
            where: { id: saleId },
            data: {
                amountPaid: newAmountPaid,
                status: isCompleted ? "COMPLETED" : "PARTIAL"
            }
        });

        // 2. Créer une transaction d'entrée (Revenu)
        await prisma.transaction.create({
            data: {
                storeId: session.user.storeId,
                userId: session.user.id,
                type: "INCOME",
                amount: amount,
                category: "RECOUVREMENT",
                description: `Paiement sur Dette - Client: ${sale.customerName || 'Inconnu'} (#INV-${saleId.slice(-6)})`,
            }
        });

        revalidatePath("/sales/debts");
        revalidatePath("/dashboard");
        revalidatePath("/capital");
        return { success: true };
    } catch (error) {
        console.error("[DEBTS] Payment Error:", error);
        return { error: "Impossible d'enregistrer le versement" };
    }
}
