import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
    try {
        /* const session = await auth();
        if (!session?.user?.storeId) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const storeId = session.user.storeId;
        const sellerId = session.user.id; */

        // Ensure IDs exist from the database
        let store = await prisma.store.findFirst();
        let user = await prisma.user.findFirst();
        
        if (!store) {
           store = await prisma.store.create({
               data: {
                   name: "Musages Demo Store",
                   plan: "BUSINESS",
               }
           });
        }

        if (!user) {
           user = await prisma.user.create({
               data: {
                   name: "Musa Demo",
                   email: "demo@musages.com",
                   role: "ADMIN",
                   storeId: store.id,
               }
           });
        } else if (!user.storeId) {
            await prisma.user.update({
                where: { id: user.id },
                data: { storeId: store.id }
            });
        }

        const storeId = store.id;
        const sellerId = user.id;
        const today = new Date();

        // Nettoyage optionnel pour repartir à zéro pour aujourd'hui
        // await prisma.sale.deleteMany({ where: { storeId, createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } });

        console.log("🚀 Lancement du seeding API...");

        // 1. Vente Wave
        await prisma.$executeRawUnsafe(`
            INSERT INTO "Sale" ("id", "storeId", "sellerId", "totalAmount", "amountPaid", "paymentMethod", "status", "customerName", "createdAt", "updatedAt")
            VALUES ('seed_sale_1', '${storeId}', '${sellerId}', 11700, 11700, 'WAVE', 'COMPLETED', 'ZOU', '${new Date(new Date(today).setHours(21, 4, 0)).toISOString()}', NOW())
        `);

        // 2. Vente Espèce
        await prisma.$executeRawUnsafe(`
            INSERT INTO "Sale" ("id", "storeId", "sellerId", "totalAmount", "amountPaid", "paymentMethod", "status", "customerName", "createdAt", "updatedAt")
            VALUES ('seed_sale_2', '${storeId}', '${sellerId}', 1000, 1000, 'CASH', 'COMPLETED', 'SOW', '${new Date(new Date(today).setHours(20, 58, 0)).toISOString()}', NOW())
        `);

        // 3. Vente Impayée (Dette)
        await prisma.$executeRawUnsafe(`
            INSERT INTO "Sale" ("id", "storeId", "sellerId", "totalAmount", "amountPaid", "paymentMethod", "status", "customerName", "createdAt", "updatedAt")
            VALUES ('seed_sale_3', '${storeId}', '${sellerId}', 12200, 0, 'CASH', 'UNPAID', 'SOW (Dette)', '${new Date(new Date(today).setHours(19, 30, 0)).toISOString()}', NOW())
        `);

        // 4. Une dépense
        await prisma.$executeRawUnsafe(`
            INSERT INTO "Transaction" ("id", "storeId", "amount", "type", "category", "description", "createdAt", "updatedAt")
            VALUES ('seed_trans_1', '${storeId}', 3000, 'EXPENSE', 'ACHATS', 'Papier A4 (Ramette)', '${new Date(new Date(today).setHours(18, 0, 0)).toISOString()}', NOW())
        `);

        return NextResponse.json({ success: true, message: "Journal du jour alimenté par SQL brut !" });

    } catch (error: any) {
        console.error("Seed Error:", error);
        return NextResponse.json({ 
            error: "Erreur lors du seeding", 
            details: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
}
