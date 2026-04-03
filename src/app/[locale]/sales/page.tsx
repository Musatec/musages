import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PosTerminal } from "@/components/modules/sales/pos-terminal";

export default async function SalesPage() {
    const session = await auth();
    if (!session?.user?.storeId) {
        redirect("/login");
    }

    // Récupération des produits pour le terminal avec leurs stocks
    const products = await prisma.product.findMany({
        where: { storeId: session.user.storeId },
        include: {
            stocks: {
                where: { storeId: session.user.storeId }
            }
        },
        orderBy: { name: 'asc' }
    });

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
