"use server";

import { auth } from "@/auth";

export async function getMindInsights() {
    try {
        const session = await auth();
        if (!session) {
            return { success: false, error: "Non autorisé" };
        }

        const insights = [
            "Le taux de recouvrement des écolages est stable ce mois-ci.",
            "Pensez à relancer les parents via WhatsApp pour les paiements en attente.",
            "Les effectifs de l'école sont en croissance, prévoyez d'optimiser les salles de classe."
        ];

        return { success: true, insights };
    } catch (error: any) {
        return { success: false, error: error.message || "Erreur IA" };
    }
}
