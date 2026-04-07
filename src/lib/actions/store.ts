"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateStoreSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  address: z.string().optional(),
  plan: z.enum(["STARTER", "GROWTH", "BUSINESS"]),
  config: z.record(z.string(), z.any()).optional(),
});

export async function createStore(data: z.infer<typeof CreateStoreSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: "Vous devez être connecté pour créer une boutique." };
  }

  const validatedFields = CreateStoreSchema.safeParse(data);

  if (!validatedFields.success) {
    return { error: "Données invalides." };
  }

  try {
    const { name, address, plan, config } = validatedFields.data;
    
    // 1. Create the store with subscription plan and branding config
    const store = await prisma.store.create({
      data: {
        name,
        address,
        plan,
        config: config || {},
      },
    });

    // 2. Link user to the store, set their role to ADMIN, and activate 7-day trial
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        storeId: store.id,
        role: "ADMIN",
        plan: plan as any,
        subscriptionStatus: "TRIALING",
        trialEndsAt,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          storeId: store.id,
          userId: session.user.id,
          action: "CREATE_STORE",
          details: { storeName: name },
        },
      });
    } catch (auditError: unknown) {
      const message = auditError instanceof Error ? auditError.message : "Erreur inconnue";
      console.warn("Audit Log failed, but store was created:", message);
    }

    console.log("[STORE] Creation success:", store.id);
    revalidatePath("/dashboard");
    return { success: true, storeId: store.id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[STORE] Error creating store:", message);
    return { error: "Erreur lors de la création de la boutique." };
  }
}

export async function getStore() {
  const session = await auth();
  if (!session?.user?.storeId) return null;

  try {
      return await prisma.store.findUnique({
        where: { id: session.user.storeId },
      });
  } catch (error) {
      return null;
  }
}

export async function updateStore(data: { name: string; address?: string; config?: any }) {
  const session = await auth();
  if (!session?.user?.storeId) return { success: false, error: "Non autorisé" };

  try {
      await prisma.store.update({
        where: { id: session.user.storeId },
        data: {
          name: data.name,
          address: data.address,
          config: data.config
        }
      });
      revalidatePath("/settings");
      revalidatePath("/dashboard");
      return { success: true };
  } catch (error) {
      return { success: false, error: "Erreur de mise à jour" };
  }
}
