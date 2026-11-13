import type { NextAuthConfig } from "next-auth";

const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
if (process.env.NODE_ENV === "production" && !authSecret) {
  throw new Error("AUTH_SECRET must be configured in production.");
}

export const authConfig = {
  secret: authSecret,
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
      if (typeof token.hasSeenOnboarding === "boolean" && session.user) {
        session.user.hasSeenOnboarding = token.hasSeenOnboarding;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.daaraId = user.daaraId || null;
        token.hasSeenOnboarding = user.hasSeenOnboarding;
      }
      
      return token;
    },
  },
} satisfies NextAuthConfig;
