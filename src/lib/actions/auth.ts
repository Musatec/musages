"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  enterpriseName: z.string().min(2).optional(),
});

export async function register(data: z.infer<typeof RegisterSchema>) {
  try {
    const validated = RegisterSchema.parse(data);
    const { email, password, name, enterpriseName } = validated;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Cet email est déjà utilisé." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and their first store in a transaction
    await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: "ADMIN",
            },
        });

        if (enterpriseName) {
            const store = await tx.store.create({
                data: {
                    name: enterpriseName,
                    ownerId: newUser.id,
                    plan: "STARTER"
                }
            });
            
            // Assign user to their newly created store
            await tx.user.update({
                where: { id: newUser.id },
                data: { storeId: store.id }
            });
        }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        return { error: "Délai de connexion à la base de données dépassé. Votre internet ou le pooler Supabase bloque." };
    }
    return { error: error.message || "Erreur lors de l'inscription." };
  }
}
