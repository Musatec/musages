import { Role, DaaraType } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      daaraId: string | null;
      daaraType?: DaaraType | null;
      hasSeenOnboarding: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    daaraId: string | null;
    daaraType?: DaaraType | null;
    hasSeenOnboarding: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    daaraId: string | null;
    daaraType?: DaaraType | null;
    hasSeenOnboarding: boolean;
  }
}
