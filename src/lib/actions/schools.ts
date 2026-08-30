"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

interface CreateSchoolData {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    ninea?: string;
}

export async function createSchool(data: CreateSchoolData) {
    try {
        const session = await auth();
        const userId = session?.user?.id;
        
        if (!userId) {
            return { error: "Non autorisé" };
        }

        const daara = await prisma.daara.create({
            data: {
                name: data.name,
                address: data.address,
                phone: data.phone,
                email: data.email,
                ninea: data.ninea,
                ownerId: userId,
            }
        });

        // Link the daara to the user
        await prisma.user.update({
            where: { id: userId },
            data: { daaraId: daara.id }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                daaraId: daara.id,
                userId: userId,
                action: "CREATE_DAARA",
                details: { name: daara.name }
            }
        });

        revalidatePath("/dashboard");
        return { success: true, school: daara, daara };
    } catch (error: any) {
        return { error: error.message || "Erreur lors de la création du Daara" };
    }
}

export async function getSchoolDetails() {
    try {
        const session = await auth();
        const daaraId = session?.user?.daaraId;
        
        if (!daaraId) return null;

        const daara = await prisma.daara.findUnique({
            where: { id: daaraId },
            include: {
                _count: {
                    select: { talibes: true, users: true, halqas: true }
                }
            }
        });

        return daara;
    } catch (error) {
        return null;
    }
}
