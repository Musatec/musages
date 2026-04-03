"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { startOfMonth, endOfMonth, subMonths, format, startOfDay, endOfDay, subDays } from "date-fns";

export async function getFinancialReport() {
    const session = await auth();
    const storeId = session?.user?.storeId;

    if (!storeId) return { error: "Non autorisé" };

    try {
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        // 1. Récupération des Ventes (avec items pour calcul de marge)
        const sales = await prisma.sale.findMany({
            where: { 
                storeId, 
                status: "COMPLETED",
                createdAt: { gte: monthStart, lte: monthEnd }
            },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        // 2. Calcul du CA et du Bénéfice Brut (Marge)
        let totalRevenue = 0;
        let totalCostOfGoodsSold = 0;

        sales.forEach(sale => {
            totalRevenue += sale.totalAmount;
            sale.items.forEach(item => {
                const cost = item.product.costPrice || 0;
                totalCostOfGoodsSold += (cost * item.quantity);
            });
        });

        const grossProfit = totalRevenue - totalCostOfGoodsSold;

        // 3. Récupération des Dépenses (Transactions - EXPENSE)
        const expenses = await prisma.transaction.aggregate({
            where: {
                storeId,
                type: "EXPENSE",
                createdAt: { gte: monthStart, lte: monthEnd }
            },
            _sum: { amount: true }
        });

        const totalExpenses = expenses._sum.amount || 0;
        const netProfit = grossProfit - totalExpenses;

        // 4. Données pour le graphique (7 derniers jours)
        const last7Days = await Promise.all(
            Array.from({ length: 7 }).map(async (_, i) => {
                const date = subDays(now, 6 - i);
                const daySales = await prisma.sale.aggregate({
                    where: {
                        storeId,
                        status: "COMPLETED",
                        createdAt: { gte: startOfDay(date), lte: endOfDay(date) }
                    },
                    _sum: { totalAmount: true }
                });
                return {
                    name: format(date, "dd/MM"),
                    total: daySales._sum.totalAmount || 0
                };
            })
        );

        // 5. Valeur du Stock (Prix d'achat * Quantité)
        const stocks = await prisma.stock.findMany({
            where: { storeId },
            include: { product: true }
        });

        const inventoryValue = stocks.reduce((acc, s) => {
            return acc + (s.quantity * (s.product.costPrice || 0));
        }, 0);

        return {
            summary: {
                totalRevenue,
                grossProfit,
                totalExpenses,
                netProfit,
                inventoryValue
            },
            chartData: last7Days,
            success: true
        };
    } catch (error) {
        console.error("[REPORT_ACTION] Error:", error);
        return { error: "Erreur lors de la génération du rapport." };
    }
}
