"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DAARA_MANAGER_ROLES, getActiveSpace } from "@/lib/action-context";

export interface FinancialReport {
    summary: {
        totalRevenue: number;
        totalExpenses: number;
        netProfit: number;
    };
    chartData: { name: string; total: number }[];
    success: boolean;
    error?: string;
}

export async function getFinancialReport(): Promise<FinancialReport> {
    const emptyReport = {
        summary: { totalRevenue: 0, totalExpenses: 0, netProfit: 0 },
        chartData: [],
    };

    try {
        const session = await auth();
        const daaraId = session?.user?.daaraId;
        if (!session?.user?.id || !daaraId || !DAARA_MANAGER_ROLES.includes(session.user.role)) {
            return { ...emptyReport, success: false, error: "Non autorise." };
        }

        const now = new Date();
        const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
        const space = await getActiveSpace();
        const transactions = await prisma.transaction.findMany({
            where: { daaraId, space, createdAt: { gte: monthStart, lt: nextMonthStart } },
            select: { amount: true, type: true, createdAt: true },
        });

        let totalRevenue = 0;
        let totalExpenses = 0;
        const dailyRevenue = new Map<number, number>();
        for (const transaction of transactions) {
            if (transaction.type === "INCOME") {
                totalRevenue += transaction.amount;
                const day = transaction.createdAt.getUTCDate();
                dailyRevenue.set(day, (dailyRevenue.get(day) || 0) + transaction.amount);
            } else {
                totalExpenses += transaction.amount;
            }
        }

        const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
        const chartData = Array.from({ length: daysInMonth }, (_, index) => ({
            name: String(index + 1),
            total: dailyRevenue.get(index + 1) || 0,
        }));

        return {
            summary: { totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses },
            chartData,
            success: true,
        };
    } catch (error) {
        console.error("[FINANCIAL_REPORT_ERROR]", error instanceof Error ? error.name : "unknown error");
        return { ...emptyReport, success: false, error: "Erreur lors de la generation du rapport." };
    }
}
