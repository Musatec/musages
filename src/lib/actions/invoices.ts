"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

/**
 * Récupère toutes les factures (Sales) avec options de filtrage
 */
export async function getInvoices(filters?: { 
    search?: string, 
    status?: string,
    limit?: number 
}) {
    const session = await auth();
    if (!session?.user?.storeId) return { invoices: [], metrics: null };

    const storeId = session.user.storeId;

    try {
        // Fetch invoices with customer and items info
        const invoices = await prisma.sale.findMany({
            where: {
                storeId,
                ...(filters?.status && filters.status !== 'ALL' ? { status: filters.status as any } : {}),
                ...(filters?.search ? {
                    OR: [
                        { customerName: { contains: filters.search, mode: 'insensitive' } },
                        { id: { contains: filters.search, mode: 'insensitive' } }
                    ]
                } : {})
            },
            include: {
                items: { include: { product: true } },
                seller: { select: { name: true } }
            },
            orderBy: { createdAt: "desc" },
            take: filters?.limit || 100
        });

        // Compute Metrics (Dynamic)
        const allSales = await prisma.sale.findMany({ where: { storeId } });
        const totalOutstanding = allSales.reduce((acc, s) => acc + (s.totalAmount - s.amountPaid), 0);
        const totalBilled = allSales.reduce((acc, s) => acc + s.totalAmount, 0);
        const recoveryRate = totalBilled > 0 ? ( (totalBilled - totalOutstanding) / totalBilled ) * 100 : 100;

        return {
            invoices,
            metrics: {
                totalOutstanding,
                totalBilled,
                recoveryRate: Math.round(recoveryRate),
                invoiceCount: allSales.length
            }
        };
    } catch (error) {
        console.error("[INVOICES] Fetch Error:", error);
        return { invoices: [], metrics: null };
    }
}
