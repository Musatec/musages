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
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) {
          console.error("[AUTH_GOOGLE] Pas d'email retourné par Google");
          return false;
        }

        try {
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
