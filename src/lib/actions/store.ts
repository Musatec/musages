"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateStoreSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  address: z.string().optional(),
  plan: z.enum(["STARTER", "GROWTH", "BUSINESS"]),
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
    const { name, address, plan } = validatedFields.data;
    
    // 1. Create the store with subscription plan
    const store = await prisma.store.create({
      data: {
        name,
        address,
        plan,
      },
    });

    // 2. Link user to the store and make them ADMIN
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        storeId: store.id,
        role: "ADMIN",
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
    } catch (auditError) {
      console.warn("Audit Log failed, but store was created:", auditError);
    }

    console.log("[STORE] Creation success:", store.id);
    revalidatePath("/dashboard");
    return { success: true, storeId: store.id };
  } catch (error) {
    console.error("[STORE] Error creating store:", error);
    return { error: "Erreur lors de la création de la boutique." };
  }
}

export async function getStore() {
  const session = await auth();

  if (!session?.user?.storeId) {
    return null;
  }

  return await prisma.store.findUnique({
    where: { id: session.user.storeId },
  });
}
