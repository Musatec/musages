"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { DAARA_MANAGER_ROLES, getActionContext } from "@/lib/action-context";

interface CreateSchoolData {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    ninea?: string;
}

export async function createSchool(data: CreateSchoolData) {
    const session = await auth();
    const userId = session?.user?.id;
    const role = session?.user?.role;
    const currentDaaraId = session?.user?.daaraId;
    if (!userId || role !== "SERIGNE_DAARA" || currentDaaraId) {
        return { error: "Non autorise ou etablissement deja configure." };
    }
    if (typeof data?.name !== "string" || !data.name.trim()) {
        return { error: "Le nom de l'etablissement est obligatoire." };
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const daara = await tx.daara.create({
                data: {
                    name: data.name.trim(),
                    address: data.address?.trim() || null,
                    phone: data.phone?.trim() || null,
                    email: data.email?.trim() || null,
                    ninea: data.ninea?.trim() || null,
                    ownerId: userId,
                },
            });
            const attached = await tx.user.updateMany({
                where: { id: userId, daaraId: null, role: "SERIGNE_DAARA" },
                data: { daaraId: daara.id },
            });
            if (attached.count !== 1) throw new Error("Daara setup already completed");
            await tx.auditLog.create({
                data: { daaraId: daara.id, userId, action: "CREATE_DAARA", details: { name: daara.name } },
            });
            return daara;
        });

        revalidatePath("/dashboard");
        return { success: true, school: result, daara: result };
    } catch (error) {
        console.error("[CREATE_DAARA_ERROR]", error);
        return { error: "Erreur lors de la creation du Daara." };
    }
}

export async function getSchoolDetails() {
    try {
        const context = await getActionContext(DAARA_MANAGER_ROLES);
        if (!context) return null;

        const daara = await prisma.daara.findUnique({
            where: { id: context.daaraId },
            include: {
                _count: {
                    select: { talibes: true, users: true, halqas: true }
                }
            }
        });

        return daara;
    } catch {
        return null;
    }
}

export async function getAllDaarasForAdmin() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
            return { success: false, daaras: [], error: "Accès réservé au Super Administrateur." };
        }

        const daaras = await prisma.daara.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: {
                        talibes: { where: { deletedAt: null } },
                        users: { where: { deletedAt: null } },
                        halqas: true,
                    },
                },
            },
        });

        return { success: true, daaras };
    } catch (error) {
        console.error("[GET_ALL_DAARAS_ERROR]", error);
        return { success: false, daaras: [], error: "Erreur lors du chargement des Daaras." };
    }
}
