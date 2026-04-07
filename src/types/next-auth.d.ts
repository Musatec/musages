import { Role, UserPlan } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      storeId: string | null;
      plan: UserPlan;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    storeId: string | null;
    plan: UserPlan;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    storeId: string | null;
    plan: UserPlan;
  }
}
