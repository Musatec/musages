"use server";

import { prisma } from "@/lib/prisma";
import { getActionContext } from "@/lib/action-context";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    const context = await getActionContext();
    if (!context) return [];

    try {
        return await prisma.notification.findMany({
            where: { userId: context.userId, daaraId: context.daaraId },
            orderBy: { createdAt: "desc" },
            take: 20
        });
    } catch (error) {
        console.error("[NOTIFICATIONS_ERROR]", error);
        return [];
    }
}

export async function markAsRead(id: string) {
    const context = await getActionContext();
    if (!context) return { success: false };

    try {
        const result = await prisma.notification.updateMany({
            where: { id, userId: context.userId, daaraId: context.daaraId },
            data: { isRead: true }
        });
        if (result.count !== 1) return { success: false };
        revalidatePath("/");
        return { success: true };
    } catch {
        return { success: false };
    }
}

export async function markAllAsRead() {
    const context = await getActionContext();
    if (!context) return { success: false };

    try {
        await prisma.notification.updateMany({
            where: { userId: context.userId, daaraId: context.daaraId, isRead: false },
            data: { isRead: true }
        });
        revalidatePath("/");
        return { success: true };
    } catch {
        return { success: false };
    }
}

