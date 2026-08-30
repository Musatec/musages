import NextAuth from "next-auth";
// PrismaAdapter retiré pour stabilité JWT
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  trustHost: true,
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      console.log("[AUTH_DEBUG] signIn callback triggered for:", user.email);
      if (account?.provider === "google") {
        if (!user.email) {
          console.error("[AUTH_GOOGLE] Pas d'email retourné par Google");
          return false;
        }

        try {
          console.log("[AUTH_GOOGLE] Tentative de gestion utilisateur pour:", user.email);
          
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email as string }
          });

          if (!existingUser) {
            console.log("[AUTH_GOOGLE] Nouvel utilisateur détecté. Création automatique du Daara...");
            
            // 1. Créer un Daara par défaut avec les infos Google
            const daara = await prisma.daara.create({
                data: {
                    name: `Daara de ${user.name?.split(' ')[0] || "Serigne"}`,
                    plan: "STARTER",
                    config: {
                        logo: user.image,
                        slogan: "Excellence & Discipline."
                    }
                }
            });

            // 2. Créer l'utilisateur lié à ce Daara
            await prisma.user.create({
              data: {
                email: user.email as string,
                name: user.name as string,
                image: user.image as string,
                role: "SERIGNE_DAARA",
                plan: "STARTER",
                subscriptionStatus: "TRIALING",
                trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                hasSeenOnboarding: false,
                daaraId: daara.id // Liaison immédiate
              }
            });
            console.log("[AUTH_GOOGLE] Daara et Serigne Daara créés avec succès.");
          } else {
            console.log("[AUTH_GOOGLE] Utilisateur existant trouvé.");
            
            if (!existingUser.daaraId) {
                console.log("[AUTH_GOOGLE] Utilisateur existant sans Daara. Création d'un Daara par défaut...");
                const daara = await prisma.daara.create({
                    data: {
                        name: `Daara de ${existingUser.name?.split(' ')[0] || "Serigne"}`,
                        plan: "STARTER"
                    }
                });
                await prisma.user.update({
                    where: { id: existingUser.id },
                    data: { daaraId: daara.id }
                });
            }
          }
        } catch (error: any) {
          console.error("[AUTH_GOOGLE_ERROR] ÉCHEC CRITIQUE lors de la gestion OAuth:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
          token.daaraId = dbUser.daaraId;
          token.plan = dbUser.plan;
          token.hasSeenOnboarding = dbUser.hasSeenOnboarding;
        }
      }
      
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
        session.user.hasSeenOnboarding = token.hasSeenOnboarding as boolean;
      }
      return session;
    },
  },
  events: {
    async signIn(message) { console.log("[AUTH_EVENT] signIn success:", message.user.email); },
    async createUser(message) { console.log("[AUTH_EVENT] user created:", message.user.email); },
    async linkAccount(message) { console.log("[AUTH_EVENT] account linked:", message.user.email); },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          console.log("[AUTH] Tentative de connexion pour:", email);
          
          try {
            const user = await prisma.user.findUnique({ where: { email } });
            
            if (!user) {
              console.log("[AUTH_DEBUG] User not found in DB:", email);
              return null;
            }

            if (!user.password) {
              console.log("[AUTH_DEBUG] User has no password (OAuth?):", email);
              return null;
            }

            console.log("[AUTH_DEBUG] Comparing passwords for:", email);
            const passwordsMatch = await bcrypt.compare(password, user.password);

            if (passwordsMatch) {
              console.log("[AUTH_DEBUG] Passwords match. Success.");
              return user;
            } else {
              console.log("[AUTH_DEBUG] Passwords DO NOT match for:", email);
            }
          } catch (error: any) {
            console.error("[AUTH_CRITICAL_ERROR] Database or Bcrypt failure:", error.message);
            throw new Error("Erreur technique d'authentification");
          }
        }

        return null;
      },
    }),
  ],
});
