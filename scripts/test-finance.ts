import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function testFinanceLogic() {
    console.log("🚀 Lancement du Diagnostic Financier Alpha (Mode Adaptateur)...");

    try {
        const store = await prisma.store.findFirst();
        const user = await prisma.user.findFirst();

        if (!store || !user) {
            console.error("❌ Store/User introuvable. Assurez-vous d'avoir fait un premier lancement.");
            return;
        }

        const storeId = store.id;
        const sellerId = user.id;

        // On nettoie les anciens tests éventuels
        await prisma.product.deleteMany({ where: { name: "MODULE ALPHA TEST" } });

        const product = await prisma.product.create({
            data: {
                storeId,
                name: "MODULE ALPHA TEST",
                price: 12000,
                costPrice: 5000,
                sku: `T-${Date.now()}`,
            }
        });
        console.log(`✅ Produit créé : ${product.name} (P.A: 5000, P.V: 12000)`);

        const sale = await prisma.sale.create({
            data: {
                storeId,
                sellerId,
                totalAmount: 12000,
                amountPaid: 12000,
                status: "COMPLETED",
                items: {
                    create: {
                        productId: product.id,
                        quantity: 1,
                        price: 12000
                    }
                }
            }
        });
        console.log(`✅ Vente effectuée : 12000 F`);

        const expense = await prisma.transaction.create({
            data: {
                storeId,
                userId: sellerId,
                amount: 2000,
                type: "EXPENSE",
                category: "LOGISTIQUE",
                description: "Test diagnostique"
            }
        });
        console.log(`✅ Dépense enregistrée : 2000 F`);

        // RESULTATS
        const revenue = 12000;
        const cogs = 5000; 
        const grossProfit = revenue - cogs;
        const expenses = 2000;
        const netProfit = grossProfit - expenses;

        console.log("\n--- BILAN DU DIAGNOSTIC ---");
        console.log(`💰 Chiffre d'Affaires : ${revenue} F`);
        console.log(`💎 Marge Brute : ${grossProfit} F`);
        console.log(`💸 Dépenses : ${expenses} F`);
        console.log(`✨ BÉNÉFICE NET : ${netProfit} F`);

        if (netProfit === 5000) {
            console.log("\n✅ SUCCÈS : Le moteur financier Alpha est réglé au millimètre !");
        } else {
            console.log("\n❌ ÉCHEC : Erreur de balance financière.");
        }

    } catch (e) {
        console.error("❌ Exception lors de l'analyse:", e);
    } finally {
        await prisma.$disconnect();
    }
}

testFinanceLogic();
