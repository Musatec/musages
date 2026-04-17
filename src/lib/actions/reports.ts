"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { startOfMonth, endOfMonth, format, startOfDay, endOfDay, subDays } from "date-fns";
import { apiRateLimit } from "@/lib/ratelimit";
import { headers } from "next/headers";

export interface FinancialSummary {
    totalRevenue: number;
    grossProfit: number;
    totalExpenses: number;
    netProfit: number;
    inventoryValue: number;
}

export interface ChartPoint {
    name: string;
    total: number;
}

export interface FinancialReport {
    summary: FinancialSummary;
    chartData: ChartPoint[];
    success: boolean;
    error?: string;
}

export async function getFinancialReport() {
    const session = await auth();
    const storeId = session?.user?.storeId;

    if (!storeId) return { 
        summary: { totalRevenue: 0, grossProfit: 0, totalExpenses: 0, netProfit: 0, inventoryValue: 0 },
        chartData: [],
        success: false, 
        error: "Non autorisé" 
    };

    // --- RATE LIMITING (Temporairement désactivé pour debug build) ---
    /*
    let ip = "local";
    try {
        const headerList = await headers();
        ip = headerList.get("x-forwarded-for") || "local";
    } catch (e) {}
    if (ip !== "local") {
        const { success: isAllowed } = await apiRateLimit.limit(`report_${storeId}_${ip}`);
        if (!isAllowed) {
            return { 
                summary: { totalRevenue: 0, grossProfit: 0, totalExpenses: 0, netProfit: 0, inventoryValue: 0 },
                chartData: [],
                success: false, 
                error: "Trop de requêtes. Veuillez patienter un instant." 
            };
        }
    }
    */

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
                const cost = item.product?.costPrice || 0;
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

        const sevenDaysAgo = startOfDay(subDays(now, 6));
        const recentSales = await prisma.sale.findMany({
            where: {
                storeId,
                status: "COMPLETED",
                createdAt: { gte: sevenDaysAgo, lte: endOfDay(now) }
            },
            select: {
                totalAmount: true,
                createdAt: true
            }
        });

        // Grouping in memory (much faster than 7 separate DB calls)
        const last7Days: ChartPoint[] = Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(now, 6 - i);
            const dateStr = format(date, "yyyy-MM-dd");
            const dayTotal = recentSales
                .filter(s => format(new Date(s.createdAt), "yyyy-MM-dd") === dateStr)
                .reduce((acc, s) => acc + s.totalAmount, 0);

            return {
                name: format(date, "dd/MM"),
                total: dayTotal
            };
        });

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
        } as FinancialReport;
    } catch (error) {
        console.error("[REPORT_ACTION] Error:", error);
        return { 
            summary: { totalRevenue: 0, grossProfit: 0, totalExpenses: 0, netProfit: 0, inventoryValue: 0 },
            chartData: [],
            success: false,
            error: "Erreur lors de la génération du rapport." 
        };
    }
}
