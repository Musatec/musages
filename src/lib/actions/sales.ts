"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function processSale(data: { 
    items: { id: string, quantity: number, price: number }[], 
    total: number, 
    paymentMethod: string,
    amountPaid?: number,
    customerName?: string,
    customerPhone?: string
}) {
    const session = await auth();
    if (!session?.user?.storeId) return { error: "Non autorisé" };

    const storeId = session.user.storeId;
    const userId = session.user.id!;
    const amountPaid = data.amountPaid ?? data.total;
    const isUnpaid = amountPaid < data.total;

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Create Sale
            const sale = await tx.sale.create({
                data: {
                    storeId,
                    totalAmount: data.total,
                    amountPaid: amountPaid,
                    paymentMethod: data.paymentMethod,
                    customerName: data.customerName || "CLIENT COMPTOIR",
                    customerPhone: data.customerPhone,
                    sellerId: userId,
                    status: isUnpaid ? "PARTIAL" : "COMPLETED",
                    items: {
                        create: data.items.map(item => ({
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.price,
                        }))
                    }
                }
            });

            // 2. Update Stocks and Create Movements
            for (const item of data.items) {
                // Update specific stock for this store/product
                await tx.stock.update({
                    where: { 
                        storeId_productId: { 
                            storeId, 
                            productId: item.id 
                        } 
                    },
                    data: { quantity: { decrement: item.quantity } }
                });

                // Audit the movement (traçabilité du stock)
                await tx.stockMovement.create({
                    data: {
                        productId: item.id,
                        storeId,
                        userId,
                        quantity: -item.quantity, // Négatif car sortie
                        reason: `Vente #${sale.id.slice(-6)}`,
                    }
                });
            }

            // 3. Create Capital Transaction (INCOME)
            // On ne comptabilise que ce qui est réelement payé dans la caisse
            await tx.transaction.create({
                data: {
                    storeId,
                    amount: amountPaid,
                    type: "INCOME",
                    category: "VENTE POS",
                    description: `Encaissement Sale #${sale.id.slice(-6)} - Client: ${data.customerName || 'PASSANT'}`
                }
            });

            // 4. Audit Log Global
            await tx.auditLog.create({
              data: {
                storeId,
                userId,
                action: "POS_SALE",
                details: { saleId: sale.id, total: data.total, debtor: isUnpaid }
              }
            });
        });

        // Mise à jour du cache pour toutes les pages concernées
        revalidatePath("/sales");
        revalidatePath("/inventory");
        revalidatePath("/capital");
        revalidatePath("/sales/debts"); // New for recovery protocol
        
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[SALES] Error processing sale:", message);
        return { error: "Erreur technique lors de la validation." };
    }
}

/**
 * Annuler une vente (Suppression réelle des données financières et remise en stock)
 */
export async function deleteSale(saleId: string) {
    const session = await auth();
    if (!session?.user?.storeId) return { error: "Non autorisé" };

    try {
        await prisma.$transaction(async (tx) => {
            const sale = await tx.sale.findUnique({
                where: { id: saleId, storeId: session.user?.storeId as string },
                include: { items: true }
            });

            if (!sale) throw new Error("Vente non trouvée");

            for (const item of sale.items) {
                await tx.stock.update({
                    where: { 
                        storeId_productId: { 
                            storeId: session.user?.storeId as string, 
                            productId: item.productId 
                        } 
                    },
                    data: { quantity: { increment: item.quantity } }
                });

                await tx.stockMovement.create({
                    data: {
                        productId: item.productId,
                        storeId: session.user?.storeId as string,
                        userId: session.user?.id as string,
                        quantity: item.quantity, 
                        reason: `Annulation Vente #${sale.id.slice(-6)}`,
                    }
                });
            }

            await tx.sale.delete({
                where: { id: saleId }
            });

            await tx.transaction.deleteMany({
                where: { 
                    description: { contains: sale.id.slice(-6) },
                    storeId: session.user?.storeId as string
                }
            });
        });

        revalidatePath("/sales/journal");
        revalidatePath("/inventory");
        revalidatePath("/sales/debts");
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[SALES_DELETE] Error:", message);
        return { error: "Impossible de supprimer cette vente." };
    }
}

/**
 * Calculer les statistiques du jour pour le Journal des Ventes et le Dashboard
 */
export async function getDailyMetrics(targetDate?: Date) {
    const session = await auth();
    if (!session?.user?.storeId) return { totalSales: 0, salesCount: 0, totalExpenses: 0, productCount: 0, stockAlerts: 0 };

    const storeId = session.user.storeId;
    const todayStart = targetDate ? new Date(targetDate) : new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = targetDate ? new Date(targetDate) : new Date();
    todayEnd.setHours(23, 59, 59, 999);

    try {
        const sales = await prisma.sale.aggregate({
            where: {
                storeId,
                createdAt: { gte: todayStart, lte: todayEnd },
                deletedAt: null 
            },
            _sum: { totalAmount: true },
            _count: { id: true }
        });

        const expenses = await prisma.transaction.aggregate({
            where: {
                storeId,
                type: "EXPENSE",
                createdAt: { gte: todayStart, lte: todayEnd },
            },
            _sum: { amount: true }
        });

        // Metrics for Dashboard cards
        const productCount = await prisma.product.count({ where: { storeId, deletedAt: null } });
        const stockAlerts = await prisma.stock.count({ where: { storeId, quantity: { lte: 5 } } });

        return {
            totalSales: sales._sum.totalAmount || 0,
            salesCount: sales._count.id || 0,
            totalExpenses: expenses._sum.amount || 0,
            productCount,
            stockAlerts
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[SALES_METRICS] Error:", message);
        return { totalSales: 0, salesCount: 0, totalExpenses: 0, productCount: 0, stockAlerts: 0 };
    }
}

/**
 * Récupère les données d'une vente pour l'affichage du reçu public
 */
export async function getSalePublicData(saleId: string) {
    try {
        const sale = await prisma.sale.findUnique({
            where: { id: saleId },
            include: {
                items: {
                    include: {
                        product: {
                            select: { name: true }
                        }
                    }
                },
                store: {
                    select: {
                        name: true,
                        address: true,
                        config: true
                    }
                }
            }
        });

        if (!sale) return { error: "Facture introuvable." };

        return { success: true, sale };
    } catch (error) {
        console.error("[SALE_PUBLIC] Error:", error);
        return { error: "Erreur lors de la récupération." };
    }
}
