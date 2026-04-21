"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    const session = await auth();
    if (!session?.user?.id) return [];

    try {
        return await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" },
            take: 20
        });
    } catch (error) {
        console.error("[NOTIFICATIONS_ERROR]", error);
        return [];
    }
}

export async function markAsRead(id: string) {
    try {
        await prisma.notification.update({
            where: { id },
            data: { isRead: true }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function markAllAsRead() {
    const session = await auth();
    if (!session?.user?.id) return { success: false };

    try {
        await prisma.notification.updateMany({
            where: { userId: session.user.id, isRead: false },
            data: { isRead: true }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function createNotification(userId: string, data: {
    title: string;
    description: string;
    type: "SALE" | "ALERT" | "INFO" | "SUCCESS";
}) {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                ...data
            }
        });
        return { success: true, notification };
    } catch (error) {
        console.error("[CREATE_NOTIFICATION_ERROR]", error);
        return { success: false };
    }
}
