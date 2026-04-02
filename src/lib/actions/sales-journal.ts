"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getDailyJournal(dateStr?: string) {
    const session = await auth();
    if (!session?.user?.storeId) return null;

    const storeId = session.user.storeId;
    
    // Parse date or use today
    const date = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [sales, transactions] = await Promise.all([
        prisma.sale.findMany({
            where: {
                storeId,
                createdAt: { gte: startOfDay, lte: endOfDay },
                status: { not: "CANCELLED" },
            },
            orderBy: { createdAt: "desc" },
            include: { 
                seller: { select: { name: true } },
                items: { include: { product: { select: { name: true } } } }
            }
        }),
        prisma.transaction.findMany({
            where: {
                storeId,
                createdAt: { gte: startOfDay, lte: endOfDay },
            }
        })
    ]);

    // Metrics Calculation
    let totalCash = 0;
    let totalMobileMoney = 0;
    let totalUnpaid = 0;
    let totalExpenses = 0;
    let totalTurnover = 0;

    sales.forEach(sale => {
        totalTurnover += sale.totalAmount;
        const paid = sale.amountPaid || 0;
        
        if (sale.paymentMethod === "CASH") {
            totalCash += paid;
        } else if (["MOBILE_MONEY", "WAVE", "FLOUZ", "ORANGE", "ORANGE_MONEY"].includes(sale.paymentMethod)) {
            totalMobileMoney += paid;
        }
        
        const debt = sale.totalAmount - paid;
        if (debt > 0) {
            totalUnpaid += debt;
        }
    });

    transactions.forEach(t => {
        if (t.type === "EXPENSE") totalExpenses += t.amount;
    });

    const netBalance = totalCash + totalMobileMoney - totalExpenses;

    return {
        sales,
        metrics: {
            netBalance,
            totalCash,
            totalMobileMoney,
            totalExpenses,
            totalUnpaid,
            totalTurnover
        },
        dateLabel: date.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })
    };
}
