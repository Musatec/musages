import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [], // Providers are added in auth.ts for non-edge compatibility
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as any;
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
      // Chargement initial ou reconnexion
      if (user) {
        // Pour les utilisateurs Google, on doit aller chercher les infos en DB car pas d'adaptateur
        if (!user.storeId && user.email) {
            const { prisma } = await import("@/lib/prisma");
            const dbUser = await prisma.user.findUnique({
                where: { email: user.email }
            });
            if (dbUser) {
                token.role = dbUser.role;
                token.storeId = dbUser.storeId;
                token.plan = dbUser.plan;
                token.hasSeenOnboarding = dbUser.hasSeenOnboarding;
                return token;
            }
        }
        
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
