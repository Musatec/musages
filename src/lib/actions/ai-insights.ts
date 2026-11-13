"use server";

import { auth } from "@/auth";

export async function getMindInsights(): Promise<{ success: boolean; insights?: string[]; error?: string }> {
    try {
        const session = await auth();
        if (!session) {
            return { success: false, error: "Non autorisé" };
        }

        return { success: false, error: "Les analyses ne sont pas encore disponibles." };
    } catch (error: any) {
        return { success: false, error: error.message || "Erreur IA" };
    }
}
