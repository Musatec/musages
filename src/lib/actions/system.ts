"use server";

import { prisma } from "@/lib/prisma";

export async function getSystemSettings() {
    try {
        const user = await prisma.user.findFirst({
            where: { role: "SUPER_ADMIN" },
            select: { id: true }
        });

        return {
            maintenanceMode: false,
            broadcastMessage: ""
        };
    } catch (error) {
        return {
            maintenanceMode: false,
            broadcastMessage: ""
        };
    }
}
