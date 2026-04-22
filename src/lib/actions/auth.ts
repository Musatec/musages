"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { registerRateLimit } from "@/lib/ratelimit";
import { headers } from "next/headers";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  enterpriseName: z.string().min(2).optional(),
});

export async function register(data: z.infer<typeof RegisterSchema>) {
  const start = Date.now();
  console.log("[AUTH_TIMER] Starting registration...");

  // --- RATE LIMITING ---
  let ip = "local";
  try {
    ip = (await headers()).get("x-forwarded-for") || "local";
  } catch (e) {
    // Build phase
  }
  if (ip !== "local") {
    const { success: isAllowed } = await registerRateLimit.limit(`regs_${ip}`);
    if (!isAllowed) {
      return { success: false, error: "Trop de tentatives d'inscription." };
    }
  }
  console.log(`[AUTH_TIMER] Rate limit check: ${Date.now() - start}ms`);

  const validated = RegisterSchema.safeParse(data);
  if (!validated.success) return { success: false, error: "Données invalides." };
  
  const { email, password, name } = validated.data;

  try {
    const dbStart = Date.now();
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    console.log(`[AUTH_TIMER] DB findUnique: ${Date.now() - dbStart}ms`);

    if (existingUser) {
      return { success: false, error: "Cet email est déjà utilisé." };
    }

    // Hash password
    const hashStart = Date.now();
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(`[AUTH_TIMER] Bcrypt hash: ${Date.now() - hashStart}ms`);

    // Create user in database
    const createStart = Date.now();
    await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            role: "ADMIN",
            subscriptionStatus: "TRIALING",
            trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
    });
    console.log(`[AUTH_TIMER] DB create: ${Date.now() - createStart}ms`);
    console.log(`[AUTH_TIMER] Total time: ${Date.now() - start}ms`);

    console.log("[AUTH_ACTION] User created successfully:", email);
    return { success: true };
  } catch (error: any) {
    console.error("[AUTH_ACTION] Registration error:", error);
    
    // Detailed error for debugging (only in development)
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    
    if (error.code === 'P2002') {
        return { success: false, error: "Cet email est déjà utilisé (Contrainte DB)." };
    }
    
    if (error.code === 'ETIMEDOUT' || errorMessage.includes('timeout')) {
        return { success: false, error: "Délai de connexion à la base de données dépassé. Votre internet ou le pooler Supabase bloque." };
    }
    
    return { success: false, error: `Erreur: ${errorMessage}` };
  }
}

/**
 * Marque la visite guidée comme complétée pour l'utilisateur
 */
export async function completeOnboardingAction() {
    try {
        const { auth } = await import("@/auth");
        const session = await auth();
        if (!session?.user?.id) return { error: "Non autorisé" };

        await prisma.user.update({
            where: { id: session.user.id },
            data: { hasSeenOnboarding: true }
        });

        return { success: true };
    } catch (error) {
        console.error("[ONBOARDING_ACTION] Error:", error);
        return { error: "Erreur technique" };
    }
}
