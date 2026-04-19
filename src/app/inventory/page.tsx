import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { InventoryManager } from "@/components/modules/inventory/inventory-manager";

export default async function InventoryPage() {
    const session = await auth();
    if (!session?.user?.storeId) {
        redirect("/login");
    }

    // Récupération complète de l'inventaire avec les stocks liés
    const products = await prisma.product.findMany({
        where: { storeId: session.user.storeId },
        include: {
            stocks: {
                where: { storeId: session.user.storeId }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });

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
}
