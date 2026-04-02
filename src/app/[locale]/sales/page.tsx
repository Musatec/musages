import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PosTerminal } from "@/components/modules/sales/pos-terminal";

export default async function SalesPage() {
    const session = await auth();
    if (!session?.user?.storeId) {
        redirect("/login");
    }

    // Récupération des produits pour le terminal
    const products = await prisma.product.findMany({
        where: { storeId: session.user.storeId },
        orderBy: { name: 'asc' }
    });

    // Conversion des prix en nombres simples pour éviter les erreurs de sérialisation
    const serializedProducts = products.map(p => ({
        ...p,
        price: Number(p.price),
        costPrice: p.costPrice ? Number(p.costPrice) : 0,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    }));

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
            <PosTerminal initialProducts={serializedProducts} />
        </div>
    );
}
