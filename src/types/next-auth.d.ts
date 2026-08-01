import { Role, SchoolPlan } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      schoolId: string | null;
      storeId?: string | null;
      plan: SchoolPlan;
      hasSeenOnboarding: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    schoolId: string | null;
    storeId?: string | null;
    plan: SchoolPlan;
    hasSeenOnboarding: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    schoolId: string | null;
    storeId?: string | null;
    plan: SchoolPlan;
    hasSeenOnboarding: boolean;
  }
}
