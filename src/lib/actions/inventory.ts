"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

interface CreateProductData {
    name: string;
    description?: string;
    price: number;
    costPrice?: number;
    stock?: number;
    minStock?: number;
    category?: string;
    sku?: string;
    image?: string;
    storeId?: string; // Optional for onboarding
}

export async function createProduct(data: CreateProductData) {
    try {
        const session = await auth();
        const storeId = data.storeId || session?.user?.storeId;
        const userId = session?.user?.id;
        
        if (!storeId || !userId) {
            console.error("[INVENTORY] Unauthorized: Missing storeId or userId");
            return { error: "Session non valide ou établissement non configuré." };
        }

        console.log("[INVENTORY] Attempting to create product for store:", storeId);
        
        // 1. Création du Produit
        const product = await prisma.product.create({
            data: {
                name: data.name,
                price: Number(data.price) || 0,
                costPrice: data.costPrice ? Number(data.costPrice) : null,
                minAlert: Math.floor(Number(data.minStock)) || 5,
                category: data.category || "Standard",
                image: data.image || null,
                sku: data.sku || null,
                storeId: storeId as string,
            }
        });

        // 2. Initialisation du Stock (Table séparée dans le schéma)
        await prisma.stock.create({
            data: {
                storeId: storeId as string,
                productId: product.id,
                quantity: Math.floor(Number(data.stock)) || 0,
            }
        });

        // 3. Premier mouvement de stock pour l'historique
        await prisma.stockMovement.create({
            data: {
                storeId: storeId as string,
                productId: product.id,
                quantity: Math.floor(Number(data.stock)) || 0,
                reason: "INITIAL_STOCK",
                userId: userId as string,
            }
        });

        revalidatePath("/inventory");
        revalidatePath("/sales"); // Update POS too
        
        return { success: true, product };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[INVENTORY] CREATE EXCEPTION:", message);
        return { error: `Erreur Système : ${message}` };
    }
}

/**
 * Mise à jour rapide du stock (Approvisionnement / Ajustement)
 */
export async function updateStock(data: {
    productId: string;
    amount: number; // Delta (can be negative for manual adjustment)
    reason: string;
}) {
    const session = await auth();
    const storeId = session?.user?.storeId;
    const userId = session?.user?.id;

    if (!storeId || !userId) return { error: "Non autorisé" };

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Update quantity in Stock table
            await tx.stock.update({
                where: { 
                    storeId_productId: { 
                        storeId: storeId as string, 
                        productId: data.productId 
                    } 
                },
                data: { quantity: { increment: data.amount } }
            });

            // 2. Add history movement
            await tx.stockMovement.create({
                data: {
                    storeId: storeId as string,
                    productId: data.productId,
                    quantity: data.amount,
                    reason: data.reason,
                    userId: userId as string,
                }
            });
        });

        revalidatePath("/inventory");
        revalidatePath("/sales");
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[INVENTORY] UPDATE STOCK ERROR:", message);
        return { error: "Impossible de mettre à jour le stock" };
    }
}

export async function deleteProduct(productId: string) {
    const session = await auth();
    if (!session?.user?.storeId) return { error: "Non autorisé" };

    try {
        await prisma.product.update({
            where: { id: productId, storeId: session.user.storeId },
            data: { deletedAt: new Date() }
        });

        revalidatePath("/inventory");
        revalidatePath("/sales");
        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[INVENTORY] Soft Delete Error:", message);
        return { error: "Erreur lors de la mise à jour (suppression)" };
    }
}

export async function getProducts() {
    try {
        const session = await auth();
        if (!session?.user?.storeId) return [];

        const storeId = session.user.storeId;

        const products = await prisma.product.findMany({
            where: { 
                storeId,
                deletedAt: null // Filtrer les supprimés
            },
            include: {
                stocks: {
                    where: { storeId },
                    select: { quantity: true }
                }
            },
            orderBy: { name: "asc" }
        });

        return products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            stock: p.stocks[0]?.quantity || 0,
            image: null,
        }));
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[INVENTORY] getProducts Error:", message);
        return [];
    }
}

export async function bulkCreateProducts(products: CreateProductData[]) {
    try {
        const session = await auth();
        const storeId = session?.user?.storeId;
        const userId = session?.user?.id;
        
        if (!storeId || !userId) return { error: "Non autorisé" };

        const results = await prisma.$transaction(async (tx) => {
            const created = [];
            for (const data of products) {
                // 1. Produit
                const product = await tx.product.create({
                    data: {
                        name: data.name,
                        price: Number(data.price) || 0,
                        costPrice: data.costPrice ? Number(data.costPrice) : null,
                        minAlert: Math.floor(Number(data.minStock)) || 5,
                        sku: data.sku || null,
                        storeId: storeId as string,
                    }
                });

                // 2. Stock
                await tx.stock.create({
                    data: {
                        storeId: storeId as string,
                        productId: product.id,
                        quantity: Math.floor(Number(data.stock)) || 0,
                    }
                });

                // 3. Mouvement
                await tx.stockMovement.create({
                    data: {
                        storeId: storeId as string,
                        productId: product.id,
                        quantity: Math.floor(Number(data.stock)) || 0,
                        reason: "BULK_IMPORT",
                        userId: userId as string,
                    }
                });
                
                created.push(product);
            }
            return created;
        });

        revalidatePath("/inventory");
        return { success: true, count: results.length };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[INVENTORY] BULK CREATE ERROR:", message);
        return { error: `Erreur lors de l'importation : ${message}` };
    }
}
