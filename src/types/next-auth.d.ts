import { Role, DaaraPlan, DaaraType } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      daaraId: string | null;
      daaraType?: DaaraType | null;
      plan: DaaraPlan;
      hasSeenOnboarding: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    daaraId: string | null;
    daaraType?: DaaraType | null;
    plan: DaaraPlan;
    hasSeenOnboarding: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    daaraId: string | null;
    daaraType?: DaaraType | null;
    plan: DaaraPlan;
    hasSeenOnboarding: boolean;
  }
}
