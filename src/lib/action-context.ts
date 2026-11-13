import type { Role } from "@prisma/client";
import { auth } from "@/auth";
import { cookies } from "next/headers";

export type ActiveSpace = "daara" | "school";

export const SPACE_COOKIE_NAME = "musages_active_space";

export async function getActiveSpace(): Promise<ActiveSpace> {
  try {
    const cookieStore = await cookies();
    const val = cookieStore.get(SPACE_COOKIE_NAME)?.value;
    return val === "school" ? "school" : "daara";
  } catch {
    return "daara";
  }
}

export const DAARA_MANAGER_ROLES: Role[] = [
  "SUPER_ADMIN",
  "SERIGNE_DAARA",
  "GESTIONNAIRE",
];

export const DAARA_STAFF_ROLES: Role[] = [...DAARA_MANAGER_ROLES, "OUSTAZ"];

export function hasAnyRole(role: Role | undefined, allowedRoles: readonly Role[]) {
  return role !== undefined && allowedRoles.includes(role);
}

export async function getActionContext(allowedRoles?: readonly Role[]) {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || !user.daaraId) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  const space = await getActiveSpace();

  return {
    userId: user.id,
    daaraId: user.daaraId,
    role: user.role,
    space,
  };
}
