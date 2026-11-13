"use server";

import { auth } from "@/auth";

export async function getSystemSettings() {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "SUPER_ADMIN") {
            return { maintenanceMode: false, broadcastMessage: "" };
        }

        return {
            maintenanceMode: false,
            broadcastMessage: ""
        };
    } catch {
        return {
            maintenanceMode: false,
            broadcastMessage: ""
        };
    }
}
