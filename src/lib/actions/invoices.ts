"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { InvoicesData, InvoiceFilters } from "@/types/invoices";

/**
 * Récupère toutes les factures (Sales) avec options de filtrage
 */
export async function getInvoices(filters?: InvoiceFilters): Promise<InvoicesData> {
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
        // Optimized: only count and sum what's needed
        const summary = await prisma.sale.aggregate({
            where: { storeId },
            _sum: { totalAmount: true, amountPaid: true },
            _count: { id: true }
        });

        const totalBilled = summary._sum.totalAmount || 0;
        const totalPaid = summary._sum.amountPaid || 0;
        const totalOutstanding = totalBilled - totalPaid;
        const recoveryRate = totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 100;

        return {
            invoices: invoices as any,
            metrics: {
                totalOutstanding,
                totalBilled,
                recoveryRate: Math.round(recoveryRate),
                invoiceCount: summary._count.id
            }
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[INVOICES] Fetch Error:", message);
        return { invoices: [], metrics: null };
    }
}
