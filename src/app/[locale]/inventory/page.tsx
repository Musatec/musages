import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InventoryManager } from "@/components/modules/inventory/inventory-manager";
import { AlertTriangle } from "lucide-react";

export default async function InventoryPage() {
    const session = await auth();
    if (!session?.user?.storeId) {
        redirect("/login");
    }

    // Fonction de récupération avec mécanisme de retry (Backoff exponentiel)
    async function getProductsWithRetry(attempts = 3) {
        try {
            return await prisma.product.findMany({
                where: { 
                    storeId: session.user.storeId as string,
                    deletedAt: null 
                },
                include: {
                    stocks: {
                        where: { storeId: session.user.storeId as string }
                    }
                },
                orderBy: { updatedAt: 'desc' }
            });
        } catch (error) {
            if (attempts > 1) {
                const delay = (4 - attempts) * 2000; // 2s, 4s, 6s...
                console.log(`[DB] Timeout detected. Retrying in ${delay}ms... (${attempts - 1} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return getProductsWithRetry(attempts - 1);
            }
            throw error;
        }
    }

    try {
        const products = await getProductsWithRetry();

        // Conversion pour le terminal (Calcul du stock réel et sérialisation)
        const serializedProducts = products.map(p => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            costPrice: p.costPrice ? Number(p.costPrice) : 0,
            stock: p.stocks[0]?.quantity || 0,
            minStock: p.minAlert,
            sku: p.sku || null,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
        }));

        return (
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
                <InventoryManager initialProducts={serializedProducts} />
            </div>
        );
    } catch (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-xl font-black uppercase tracking-tighter">Connexion Instable</h1>
                <p className="text-sm text-muted-foreground max-w-md italic">
                    Nous n'avons pas pu établir une connexion sécurisée avec la base de données après plusieurs tentatives. 
                    Cela peut être dû à votre connexion internet ou à une maintenance temporaire.
                </p>
                <a 
                    href="/inventory" 
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all inline-block"
                >
                    Réessayer la connexion
                </a>
            </div>
        );
    }
}
