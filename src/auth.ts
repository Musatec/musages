import NextAuth from "next-auth";
// PrismaAdapter retiré pour stabilité JWT
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { z } from "zod";
import { loginRateLimit } from "@/lib/ratelimit";

export const {
  auth,
  signIn,
  signOut,
  handlers: { GET, POST },
} = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  trustHost: true,
  // Auth.js debug logs may include OAuth provider secrets and callback data.
  debug: false,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email) {
          return false;
        }
        if ((profile as { email_verified?: boolean } | undefined)?.email_verified !== true) {
          return false;
        }

        const normalizedEmail = user.email.toLowerCase();

        const allowedEmails = [
          process.env.ADMIN_EMAIL,
          process.env.DAARA_ADMIN_EMAIL,
          process.env.ECOLE_ADMIN_EMAIL,
        ]
          .filter(Boolean)
          .map((e) => e!.trim().toLowerCase());

        if (allowedEmails.length > 0 && !allowedEmails.includes(normalizedEmail)) {
          console.warn(`[AUTH] Refus Google OAuth pour l'email non autorisé: ${normalizedEmail}`);
          return false;
        }

        try {
          const allowed = await prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({
              where: { email: normalizedEmail }
            });

            if (!existingUser) {
              // 1. Créer un Daara par défaut avec les infos Google
              const daara = await tx.daara.create({
                data: {
                  name: `Daara de ${user.name?.split(" ")[0] || "Serigne"}`,
                  plan: "STARTER",
                  config: {
                    logo: user.image,
                    slogan: "Excellence & Discipline."
                  }
                }
              });

              // 2. Créer l'utilisateur lié à ce Daara
              await tx.user.create({
                data: {
                  email: normalizedEmail,
                  name: user.name as string,
                  image: user.image as string,
                  emailVerified: new Date(),
                  role: "SERIGNE_DAARA",
                  hasSeenOnboarding: false,
                  daaraId: daara.id
                }
              });
              return true;
            }

            if (existingUser.deletedAt) return false;
            // Éviter la fusion silencieuse d'un compte email/mot de passe non vérifié
            if (existingUser.password && !existingUser.emailVerified) {
              return false;
            }

            if (!existingUser.daaraId) {
              const daara = await tx.daara.create({
                data: {
                  name: `Daara de ${existingUser.name?.split(" ")[0] || "Serigne"}`,
                  plan: "STARTER"
                }
              });
              await tx.user.update({
                where: { id: existingUser.id },
                data: { daaraId: daara.id }
              });
            }

            return true;
          });

          if (!allowed) return false;
        } catch (error) {
          console.error("[AUTH] Google account setup failed:", error instanceof Error ? error.name : "unknown error");
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
          token.daaraId = dbUser.daaraId;
          token.hasSeenOnboarding = dbUser.hasSeenOnboarding;
        }
      }
      
      // Keep authorization claims tied to the live account, never to client session data.
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true, daaraId: true, hasSeenOnboarding: true, deletedAt: true },
        });

        if (!dbUser || dbUser.deletedAt) {
          return {};
        }

        token.role = dbUser.role;
        token.daaraId = dbUser.daaraId;
        token.hasSeenOnboarding = dbUser.hasSeenOnboarding;
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
      if (typeof token.hasSeenOnboarding === "boolean" && session.user) {
        session.user.hasSeenOnboarding = token.hasSeenOnboarding as boolean;
      }
      return session;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: "https://accounts.google.com/o/oauth2/v2/auth",
      token: "https://oauth2.googleapis.com/token",
      userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
    }),
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().trim().email().max(254), password: z.string().min(6).max(128) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { password } = parsedCredentials.data;
          const email = parsedCredentials.data.email.toLowerCase();

          if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
            try {
              const headerList = await headers();
              const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
              if (ip !== "local") {
                const { success } = await loginRateLimit.limit(`login_${ip}_${email}`);
                if (!success) {
                  throw new Error("Trop de tentatives de connexion. Veuillez patienter.");
                }
              }
            } catch (rateError: any) {
              if (rateError?.message?.includes("Trop de tentatives")) {
                throw rateError;
              }
              console.warn("[AUTH] Rate limit check skipped:", rateError?.code || "unavailable");
            }
          }
          
          try {
            // Restriction aux adresses email autorisées (ADMIN_EMAIL, DAARA_ADMIN_EMAIL, ECOLE_ADMIN_EMAIL)
            const allowedEmails = [
              process.env.ADMIN_EMAIL,
              process.env.DAARA_ADMIN_EMAIL,
              process.env.ECOLE_ADMIN_EMAIL,
            ]
              .filter(Boolean)
              .map((e) => e!.trim().toLowerCase());

            if (allowedEmails.length > 0 && !allowedEmails.includes(email)) {
              console.warn(`[AUTH] Refus de connexion pour l'email non autorisé: ${email}`);
              return null;
            }

            let user = await prisma.user.findUnique({ where: { email } });

            // Auto-provisioning / synchronisation automatique si mot de passe défini dans .env
            const envAdminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
            const envAdminPass = process.env.ADMIN_PASSWORD;
            if (envAdminPass && email === envAdminEmail) {
              if (!user) {
                let defaultDaara = await prisma.daara.findFirst();
                if (!defaultDaara) {
                  defaultDaara = await prisma.daara.create({
                    data: {
                      name: "Daara Ibnoul Khayim Al Jawziya",
                      plan: "STARTER",
                      type: "TRADITIONNEL",
                    },
                  });
                }
                const hashed = await bcrypt.hash(envAdminPass, 10);
                user = await prisma.user.create({
                  data: {
                    email,
                    name: "Direction Générale",
                    password: hashed,
                    role: "SERIGNE_DAARA",
                    daaraId: defaultDaara.id,
                    emailVerified: new Date(),
                  },
                });
              } else if (password === envAdminPass) {
                // Synchroniser le hash du mot de passe s'il a été changé dans .env
                const matches = user.password ? await bcrypt.compare(password, user.password) : false;
                if (!matches) {
                  const newHash = await bcrypt.hash(envAdminPass, 10);
                  user = await prisma.user.update({
                    where: { id: user.id },
                    data: { password: newHash, deletedAt: null },
                  });
                }
              }
            }
            
            if (!user?.password || user.deletedAt) return null;

            const passwordsMatch = await bcrypt.compare(password, user.password);
            if (passwordsMatch) return user;
          } catch (error: any) {
            console.error("[AUTH] Credential verification failed:", error?.code || "unknown error");
            throw new Error("Erreur technique d'authentification");
          }
        }

        return null;
      },
    }),
  ],
});
