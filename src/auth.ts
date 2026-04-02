import NextAuth from "next-auth";
// PrismaAdapter retiré pour stabilité JWT
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
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
  providers: [
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
              console.log("[AUTH] Utilisateur non trouvé:", email);
              return null;
            }

            if (!user.password) {
              console.log("[AUTH] Mot de passe non défini pour:", email);
              return null;
            }

            const passwordsMatch = await bcrypt.compare(password, user.password);

            if (passwordsMatch) {
              console.log("[AUTH] Connexion réussie pour:", email);
              return user;
            } else {
              console.log("[AUTH] Mot de passe incorrect pour:", email);
            }
          } catch (error) {
            console.error("[AUTH] Erreur de base de données:", error);
            throw new Error("Erreur de connexion à la base de données");
          }
        }

        return null;
      },
    }),
  ],
});
