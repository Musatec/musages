import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "7a6e1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b",
  trustHost: true,
  providers: [], // Providers standard ajoutés dans auth.ts pour compatibilité Edge
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as any;
      }
      if (token.daaraId && session.user) {
        session.user.daaraId = token.daaraId as string;
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
        token.daaraId = user.daaraId || null;
        token.plan = (user as any).plan;
        token.hasSeenOnboarding = user.hasSeenOnboarding;
      }
      
      // Mise à jour dynamique de la session après création de Daara
      if (trigger === "update" && session?.user) {
        token.role = session.user.role || token.role;
        token.daaraId = session.user.daaraId || token.daaraId;
        token.plan = session.user.plan || token.plan;
        if (typeof session.user.hasSeenOnboarding === "boolean") {
          token.hasSeenOnboarding = session.user.hasSeenOnboarding;
        }
      }

      return token;
    },
  },
} satisfies NextAuthConfig;
