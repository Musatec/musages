"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getUserStores() {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Non connecté" };

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        const ownedStores = await prisma.store.findMany({
            where: { ownerId: session.user.id, deletedAt: null },
            orderBy: { createdAt: "asc" }
        });

        const currentStore = session.user.storeId 
            ? await prisma.store.findUnique({ where: { id: session.user.storeId } })
            : null;

        return { success: true, ownedStores, currentStore, plan: user?.plan || "STARTER" };
    } catch (error: unknown) {
        return { success: false, error: "Erreur lors de la récupération des magasins." };
    }
}

export async function createStore(name: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Non autorisé" };

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { ownedStores: true }
        });

        if (!user) return { success: false, error: "Utilisateur non trouvé" };

        // Strictly enforce plan limits
        const existingCount = user.ownedStores.length;
        if (user.plan === "STARTER" && existingCount >= 1) {
            return { success: false, error: "Le Plan STARTER (3000 F) est limité à 1 seule boutique." };
        }
        if (user.plan === "GROWTH" && existingCount >= 3) {
            return { success: false, error: "Le Plan GROWTH (5000 F) est limité à 3 boutiques au total." };
        }
        if (user.plan === "BUSINESS" && existingCount >= 6) {
            return { success: false, error: "Le Plan BUSINESS (7000 F) est limité à 6 boutiques réseau." };
        }

        const store = await prisma.store.create({
            data: {
                name,
                plan: user.plan as any, // Sync store plan field with owner plan
                ownerId: user.id
            }
        });

        revalidatePath("/admin/stores");
        return { success: true, store };
    } catch (error: unknown) {
        return { success: false, error: "Erreur lors de la création de la succursale." };
    }
}

export async function createEmployeeAccount(storeId: string, name: string, email: string, passwordHash: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Non autorisé" };

    try {
        // Verify current user owns this store
        const store = await prisma.store.findFirst({
            where: { id: storeId, ownerId: session.user.id }
        });

        if (!store) return { success: false, error: "Magasin introuvable ou accès refusé." };

        const newSeller = await prisma.user.create({
            data: {
                name,
                email,
                password: passwordHash, // Note: In production, hash this!
                role: "SELLER",
                storeId: store.id
            }
        });

        revalidatePath(`/settings/stores`);
        return { success: true, newSeller };
    } catch (error: unknown) {
        return { success: false, error: "Impossible de créer le compte vendeur." };
    }
}
export async function switchStore(storeId: string) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Non connecté" };

    try {
        // Verify user owns or is member of this store
        const store = await prisma.store.findFirst({
            where: {
                id: storeId,
                OR: [
                    { ownerId: session.user.id },
                    { users: { some: { id: session.user.id } } }
                ]
            }
        });

        if (!store) return { success: false, error: "Magasin introuvable ou accès refusé." };

        await prisma.user.update({
            where: { id: session.user.id },
            data: { storeId: store.id }
        });

        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Erreur lors du changement de magasin." };
    }
}

export async function createSubStoreManager(data: {
    storeId: string;
    name: string;
    email: string;
    password?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Non autorisé" };

    try {
        const owner = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { ownedStores: true }
        });

        if (!owner) return { success: false, error: "Propriétaire non trouvé" };
        
        // Verify store belongs to owner
        const isOwner = owner.ownedStores.some(s => s.id === data.storeId);
        if (!isOwner) return { success: false, error: "Vous ne possédez pas ce magasin." };

        // Create the manager account
        // Note: Password should be hashed.
        const hashedPassword = await bcrypt.hash(data.password || "Mindos123!", 10);

        const newManager = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: "MANAGER",
                storeId: data.storeId
            }
        });

        revalidatePath("/admin/pilotage");
        return { success: true, manager: newManager };
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, error: "Cet email est déjà utilisé." };
        return { success: false, error: "Erreur lors de la création du compte manager." };
    }
}
