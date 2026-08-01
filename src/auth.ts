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
            
            // 1. Créer une école par défaut avec les infos Google
            const school = await prisma.school.create({
                data: {
                    name: `Établissement de ${user.name?.split(' ')[0] || "Directeur"}`,
                    plan: "STARTER",
                    config: {
                        logo: user.image,
                        slogan: "Excellence & Discipline."
                    }
                }
            });

            // 2. Créer l'utilisateur lié à cette école
            await prisma.user.create({
              data: {
                email: user.email as string,
                name: user.name as string,
                image: user.image as string,
                role: "DIRECTEUR",
                plan: "STARTER",
                subscriptionStatus: "TRIALING",
                trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                hasSeenOnboarding: false,
                schoolId: school.id // Liaison immédiate
              }
            });
            console.log("[AUTH_GOOGLE] École et Directeur créés avec succès.");
          } else {
            console.log("[AUTH_GOOGLE] Utilisateur existant trouvé.");
            
            if (!existingUser.schoolId) {
                console.log("[AUTH_GOOGLE] Utilisateur existant sans école. Création d'une école par défaut...");
                const school = await prisma.school.create({
                    data: {
                        name: `Établissement de ${existingUser.name?.split(' ')[0] || "Directeur"}`,
                        plan: "STARTER"
                    }
                });
                await prisma.user.update({
                    where: { id: existingUser.id },
                    data: { schoolId: school.id }
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
    async jwt({ token, user, trigger, session, account }) {
      // Si c'est une connexion (user est défini), on récupère les vraies infos en BDD
      if (user && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (dbUser) {
          token.sub = dbUser.id; // Forcer l'ID de la BDD au lieu de l'ID Google
          token.role = dbUser.role;
          token.schoolId = dbUser.schoolId;
          token.storeId = dbUser.schoolId;
          token.plan = dbUser.plan;
          token.hasSeenOnboarding = dbUser.hasSeenOnboarding;
        }
      }
      
      // Mise à jour dynamique de la session après création d'établissement
      if (trigger === "update" && session?.user) {
        token.role = session.user.role || token.role;
        token.schoolId = session.user.schoolId || session.user.storeId || token.schoolId;
        token.storeId = token.schoolId;
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
      if (token.schoolId && session.user) {
        session.user.schoolId = token.schoolId as string;
      }
      if (token.storeId && session.user) {
        session.user.storeId = token.storeId as string;
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
