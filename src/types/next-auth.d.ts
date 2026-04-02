import { Role } from "@prisma/client";
import { DefaultSession } from "next-auth";

export type ExtendedUser = DefaultSession["user"] & {
  role: Role;
  storeId: string | null;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }

  interface User {
    role: Role;
    storeId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    storeId?: string | null;
  }
}

declare module "@auth/core/adapters" {
    interface AdapterUser {
        role: Role;
        storeId: string | null;
    }
}
