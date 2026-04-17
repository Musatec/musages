"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authRateLimit } from "@/lib/ratelimit";
import { headers } from "next/headers";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  enterpriseName: z.string().min(2).optional(),
});

export async function register(data: z.infer<typeof RegisterSchema>) {
  // --- RATE LIMITING ---
  const ip = (await headers()).get("x-forwarded-for") || "local";
  const { success: isAllowed } = await authRateLimit.limit(`regs_${ip}`);
  if (!isAllowed) {
    return { error: "Trop de tentatives d'inscription. Veuillez réessayer dans une minute." };
  }

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

    // Create user only
    await (prisma.user as any).create({
        data: {
            email,
            name,
            password: hashedPassword,
            role: "ADMIN",
            subscriptionStatus: "TRIALING",
            trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
    });

    return { success: true };

    return { success: true };
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
        return { error: "Délai de connexion à la base de données dépassé. Votre internet ou le pooler Supabase bloque." };
    }
    return { error: error.message || "Erreur lors de l'inscription." };
  }
}
