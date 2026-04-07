"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Récupère tous les fournisseurs de la boutique
 */
export async function getSuppliers() {
    const session = await auth();
    if (!session?.user?.storeId) return { success: false, error: "Non autorisé" };

    try {
        const suppliers = await prisma.supplier.findMany({
            where: { storeId: session.user.storeId, deletedAt: null },
            orderBy: { name: "asc" }
        });
        return { success: true, suppliers };
    } catch (error) {
        return { success: false, error: "Erreur de chargement des fournisseurs." };
    }
}

/**
 * Créer un nouveau partenaire fournisseur
 */
export async function createSupplier(data: {
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
    address?: string;
}) {
    const session = await auth();
    if (!session?.user?.storeId) return { success: false, error: "Non autorisé" };

    try {
        const supplier = await prisma.supplier.create({
            data: {
                ...data,
                storeId: session.user.storeId
            }
        });
        revalidatePath("/logistics/suppliers");
        return { success: true, supplier };
    } catch (error) {
        return { success: false, error: "Erreur lors de la création du fournisseur." };
    }
}

/**
 * Enregistrer un arrivage de marchandises (Achat)
 * - Met à jour le stock
 * - Crée un mouvement de stock (RECEPTION)
 * - Crée une transaction de sortie (EXPENSE)
 */
export async function processPurchase(data: {
    supplierId: string;
    paymentMethod: string;
    items: { productId: string; quantity: number; unitPrice: number }[];
}) {
    const session = await auth();
    if (!session?.user?.id || !session?.user?.storeId) return { success: false, error: "Non autorisé" };

    const storeId = session.user.storeId;
    const userId = session.user.id;
    const totalAmount = data.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Créer l'enregistrement d'achat
            const purchase = await tx.purchase.create({
                data: {
                    storeId,
                    supplierId: data.supplierId,
                    totalAmount,
                    amountPaid: totalAmount, // Simplification pour le simulateur
                    paymentMethod: data.paymentMethod,
                    items: {
                        create: data.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice
                        }))
                    }
                }
            });

            // 2. Mettre à jour les stocks et créer les mouvements
            for (const item of data.items) {
                await tx.stock.upsert({
                    where: { storeId_productId: { storeId, productId: item.productId } },
                    update: { quantity: { increment: item.quantity } },
                    create: { storeId, productId: item.productId, quantity: item.quantity }
                });

                await tx.stockMovement.create({
                    data: {
                        storeId,
                        productId: item.productId,
                        userId,
                        quantity: item.quantity,
                        reason: `ACHAT #${purchase.id.slice(-6)}`
                    }
                });
            }

            // 3. Créer la transaction financière (Sortie d'argent)
            await tx.transaction.create({
                data: {
                    storeId,
                    userId,
                    amount: totalAmount,
                    type: "EXPENSE",
                    category: "ACHATS MARCHANDISES",
                    description: `Paiement Fournisseur pour Achat #${purchase.id.slice(-6)}`
                }
            });
        });

        revalidatePath("/inventory");
        revalidatePath("/capital");
        revalidatePath("/logistics/purchases");
        
        return { success: true };
    } catch (error: any) {
        console.error("[PROCUREMENT_ERROR]", error);
        return { success: false, error: "Échec de l'enregistrement de l'achat." };
    }
}
