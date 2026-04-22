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
    async signIn({ user, account, profile }) {
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
            console.log("[AUTH_GOOGLE] Nouvel utilisateur détecté. Création automatique de l'Empire...");
            
            // 1. Créer une boutique par défaut avec les infos Google
            const store = await prisma.store.create({
                data: {
                    name: `Empire de ${user.name?.split(' ')[0] || "Commandant"}`,
                    plan: "STARTER",
                    config: {
                        logo: user.image,
                        slogan: "Maîtrise et Croissance.",
                        activity: "Commerce Général"
                    }
                }
            });

            // 2. Créer l'utilisateur lié à cette boutique
            await prisma.user.create({
              data: {
                email: user.email as string,
                name: user.name as string,
                image: user.image as string,
                role: "ADMIN",
                plan: "STARTER",
                subscriptionStatus: "TRIALING",
                trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                hasSeenOnboarding: false,
                storeId: store.id // Liaison immédiate
              }
            });
            console.log("[AUTH_GOOGLE] Empire et Utilisateur créés avec succès.");
          } else {
            console.log("[AUTH_GOOGLE] Utilisateur existant trouvé.");
            
            // Cas particulier : Utilisateur existe mais n'a pas de boutique (onboarding non fini)
            if (!existingUser.storeId) {
                console.log("[AUTH_GOOGLE] Utilisateur existant sans boutique. Création d'un Empire de secours...");
                const store = await prisma.store.create({
                    data: {
                        name: `Empire de ${existingUser.name?.split(' ')[0] || "Commandant"}`,
                        plan: "STARTER"
                    }
                });
                await prisma.user.update({
                    where: { id: existingUser.id },
                    data: { storeId: store.id }
                });
            }
          }
        } catch (error: any) {
          console.error("[AUTH_GOOGLE_ERROR] ÉCHEC CRITIQUE lors de la gestion OAuth:", error);
          // On renvoie false pour déclencher Access Denied mais on a loggé l'erreur
          return false;
        }
      }
      return true;
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
