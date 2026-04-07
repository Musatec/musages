import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client";

export const authConfig = {
  providers: [], // Providers are added in auth.ts for non-edge compatibility
  callbacks: {
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
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.storeId = user.storeId;
        token.plan = (user as any).plan;
      }
      
      // Mise à jour dynamique de la session après création d'entreprise
      if (trigger === "update" && session?.user) {
        token.role = session.user.role || token.role;
        token.storeId = session.user.storeId || token.storeId;
        token.plan = session.user.plan || token.plan;
      }

      return token;
    },
  },
} satisfies NextAuthConfig;
