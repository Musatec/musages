import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PosTerminal } from "@/components/modules/sales/pos-terminal";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function SalesPage() {
    const session = await auth();
    if (!session?.user?.storeId) {
        redirect("/login");
    }

    // Fonction de récupération avec mécanisme de retry (Backoff exponentiel) pour la stabilité du Terminal
    async function getProductsWithRetry(targetStoreId: string, attempts = 3) {
        try {
            return await prisma.product.findMany({
                where: { storeId: targetStoreId },
                include: {
                    stocks: {
                        where: { storeId: targetStoreId }
                    }
                },
                orderBy: { name: 'asc' }
            });
        } catch (error) {
            if (attempts > 1) {
                const delay = (4 - attempts) * 2000;
                console.log(`[POS-DB] Timeout detected. Retrying in ${delay}ms... (${attempts - 1} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return getProductsWithRetry(targetStoreId, attempts - 1);
            }
            throw error;
        }
    }

    let products;
    try {
        products = await getProductsWithRetry(session.user.storeId as string);
    } catch (error) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-10 text-center space-y-4 bg-background h-screen">
                <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
                <h1 className="text-xl font-black uppercase tracking-tighter">Terminal Hors Ligne</h1>
                <p className="text-sm text-muted-foreground max-w-md italic">
                    Le terminal n'a pas pu charger le catalogue produit à cause d'une instabilité réseau. 
                    Vérifiez votre connexion et tentez de reconnecter le terminal.
                </p>
                <Link 
                    href="/sales" 
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all inline-block shadow-lg shadow-primary/20"
                >
                    Réinitialiser le Terminal
                </Link>
            </div>
        );
    }

    // Conversion pour le terminal (Calcul du stock réel et sérialisation)
    const serializedProducts = products.map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        image: null,
        stock: p.stocks[0]?.quantity || 0,
        sku: p.sku || null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }));

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <PosTerminal initialProducts={serializedProducts} />
        </div>
    );
}
