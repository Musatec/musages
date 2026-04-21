"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function globalSearch(query: string) {
    if (!query || query.length < 2) return { results: [] };

    try {
        const session = await auth();
        const storeId = session?.user?.storeId;
        if (!storeId) return { error: "Non autorisé" };

        const [products, sales, customers] = await Promise.all([
            // 1. Recherche Produits
            prisma.product.findMany({
                where: {
                    storeId,
                    deletedAt: null,
                    OR: [
                        { name: { contains: query, mode: "insensitive" } },
                        { sku: { contains: query, mode: "insensitive" } },
                        { category: { contains: query, mode: "insensitive" } },
                    ]
                },
                take: 5,
                select: { id: true, name: true, price: true, category: true }
            }),
            // 2. Recherche Ventes (ID ou Client)
            prisma.sale.findMany({
                where: {
                    storeId,
                    OR: [
                        { id: { contains: query, mode: "insensitive" } },
                        { customerName: { contains: query, mode: "insensitive" } },
                    ]
                },
                take: 5,
                select: { id: true, customerName: true, total: true, createdAt: true }
            }),
            // 3. Recherche Clients (si une table existe, sinon on skip)
            // On va supposer qu'on cherche dans les noms de clients des ventes pour l'instant
            // ou si vous avez une table Client, ajoutez-la ici.
        ]);

        return {
            results: [
                ...products.map(p => ({ id: p.id, title: p.name, subtitle: `${p.category} • ${new Intl.NumberFormat('fr-FR').format(p.price)} FCFA`, type: "PRODUCT", href: `/inventory?id=${p.id}` })),
                ...sales.map(s => ({ id: s.id, title: `Vente #${s.id.slice(-6)}`, subtitle: `${s.customerName || "Client Comptant"} • ${new Intl.NumberFormat('fr-FR').format(s.total)} FCFA`, type: "SALE", href: `/sales/history?id=${s.id}` })),
            ]
        };
    } catch (error) {
        console.error("[SEARCH_ERROR]", error);
        return { error: "Erreur lors de la recherche" };
    }
}
