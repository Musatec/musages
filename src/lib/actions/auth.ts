"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { registerRateLimit } from "@/lib/ratelimit";
import { headers } from "next/headers";

const RegisterSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(6).max(128),
  name: z.string().trim().min(2).max(120),
  enterpriseName: z.string().trim().min(2).max(120).optional(),
});

export async function register(data: z.infer<typeof RegisterSchema>) {
  // --- RATE LIMITING ---
  let ip = "local";
  try {
    ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  } catch {
    // Build phase
  }
  if (ip !== "local") {
    try {
      const { success: isAllowed } = await registerRateLimit.limit(`regs_${ip}`);
      if (!isAllowed) {
        return { success: false, code: "RATE_LIMITED", error: "Trop de tentatives d'inscription. Réessayez plus tard." };
      }
    } catch (error) {
      console.error("[AUTH] Registration rate limiter unavailable:", error instanceof Error ? error.name : "unknown error");
      return { success: false, code: "RATE_LIMIT_UNAVAILABLE", error: "Le service d'inscription est temporairement indisponible. Réessayez dans quelques instants." };
    }
  }

  const validated = RegisterSchema.safeParse(data);
  if (!validated.success) return { success: false, code: "INVALID_DATA", error: "Vérifiez les informations saisies. Le mot de passe doit contenir entre 6 et 128 caractères." };
  
  const { email, password, name } = validated.data;

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, code: "EMAIL_TAKEN", error: "Cet email est déjà utilisé. Connectez-vous avec cet email." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const daaraName = validated.data.enterpriseName ||
      (email.includes("pathepogne") ? "École Franco-Arabe Pathé Pogne" : `Daara de ${name.split(" ")[0] || "Serigne"}`);

    await prisma.$transaction(async (tx) => {
      const daara = await tx.daara.create({ data: { name: daaraName, plan: "STARTER" } });
      await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: "SERIGNE_DAARA",
          daaraId: daara.id,
        },
      });
    });

    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
        return { success: false, code: "EMAIL_TAKEN", error: "Cet email est déjà utilisé. Connectez-vous avec cet email." };
    }
    
    if (error.code === 'ETIMEDOUT' || (error instanceof Error && error.message.toLowerCase().includes('timeout'))) {
        return { success: false, code: "DATABASE_TIMEOUT", error: "La base de données ne répond pas. Réessayez dans quelques instants." };
    }
    
    console.error("[AUTH] Registration failed:", error?.code || "unknown error");
    return { success: false, code: "REGISTRATION_FAILED", error: "La création du compte a échoué. Vérifiez la configuration de la base de données." };
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
