"use server";

import { prisma } from "@/lib/prisma";

export async function getSystemSettings() {
    try {
        // Utilisation de queryRaw pour lire les colonnes ajoutées manuellement
        // sans avoir besoin de mettre à jour le schéma Prisma.
        const settings = await prisma.$queryRaw`
            SELECT "isMaintenanceMode", "broadcastMessage" 
            FROM "User" 
            WHERE "role" = 'SUPER_ADMIN' 
            LIMIT 1
        ` as any[];

        if (settings && settings.length > 0) {
            return {
                maintenanceMode: settings[0].isMaintenanceMode || false,
                broadcastMessage: settings[0].broadcastMessage || ""
            };
        }

        return {
            maintenanceMode: false,
            broadcastMessage: ""
        };
    } catch (error) {
        console.error("Error fetching system settings:", error);
        return {
            maintenanceMode: false,
            broadcastMessage: ""
        };
    }
}
