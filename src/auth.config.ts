import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client";

export const authConfig = {
  providers: [], // Providers are added in auth.ts for non-edge compatibility
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) {
          console.error("[AUTH_GOOGLE] Pas d'email retourné par Google");
          return false;
        }

        try {
          const { prisma } = await import("@/lib/prisma");
          console.log("[AUTH_GOOGLE] Recherche de l'utilisateur:", user.email);
          
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email as string }
          });

          if (!existingUser) {
            console.log("[AUTH_GOOGLE] Création d'un nouvel utilisateur OAuth");
            await prisma.user.create({
              data: {
                email: user.email as string,
                name: user.name as string,
                image: user.image as string,
                role: "ADMIN",
                plan: "STARTER",
                subscriptionStatus: "TRIALING",
                trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                hasSeenOnboarding: false
              }
            });
          } else {
            console.log("[AUTH_GOOGLE] Utilisateur existant trouvé:", existingUser.email);
          }
        } catch (error: any) {
          console.error("[AUTH_GOOGLE_ERROR] Erreur lors de la gestion utilisateur OAuth:", error.message);
          return false;
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as Role;
      }
      if (token.storeId && session.user) {
        session.user.storeId = token.storeId as string;
      }
      if (token.plan && session.user) {
        session.user.plan = token.plan as any;
      }
      if (typeof token.hasSeenOnboarding === "boolean" && session.user) {
        session.user.hasSeenOnboarding = token.hasSeenOnboarding;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.storeId = user.storeId;
        token.plan = (user as any).plan;
        token.hasSeenOnboarding = user.hasSeenOnboarding;
      }
      
      // Mise à jour dynamique de la session après création d'entreprise
      if (trigger === "update" && session?.user) {
        token.role = session.user.role || token.role;
        token.storeId = session.user.storeId || token.storeId;
        token.plan = session.user.plan || token.plan;
        if (typeof session.user.hasSeenOnboarding === "boolean") {
          token.hasSeenOnboarding = session.user.hasSeenOnboarding;
        }
      }

      return token;
    },
  },
} satisfies NextAuthConfig;
