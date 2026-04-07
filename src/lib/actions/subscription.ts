"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function getSubscriptionData() {
    const session = await auth();
    if (!session?.user?.id) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                plan: true,
                subscriptionStatus: true,
                trialEndsAt: true,
                payments: {
                    orderBy: { createdAt: "desc" },
                    take: 5
                }
            }
        });

        if (!user) return null;

        const now = new Date();
        const typedUser = user as any;
        const isTrialOver = typedUser.trialEndsAt ? now > typedUser.trialEndsAt : false;
        
        return {
            ...typedUser,
            isTrialOver,
            daysRemaining: typedUser.trialEndsAt 
                ? Math.ceil((new Date(typedUser.trialEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                : 0
        };
    } catch (error) {
        console.error("[SUBSCRIPTION] Error fetching data:", error);
        return null;
    }
}

export async function initiatePayment(plan: "STARTER" | "GROWTH" | "BUSINESS") {
    const session = await auth();
    if (!session?.user?.id) return { error: "Non autorisé" };

    const prices = {
        STARTER: 3000,
        GROWTH: 5000,
        BUSINESS: 7000
    };

    const amount = prices[plan];

    try {
        // simulation PayTech / PayDunya
        // En production, ici on appellerait l'API du provider pour obtenir un lien de paiement
        
        console.log(`[PAYMENT] Initiating ${plan} payment of ${amount} FCFA for user ${session.user.id}`);
        
        // Simuler une redirection vers un lien de paiement externe
        // Pour l'instant on retourne juste un succès fictif
        return { 
            success: true, 
            paymentUrl: "https://paytech.sn/placeholder-payment-link", // URL de test
            message: "Redirection vers la plateforme de paiement..." 
        };
    } catch (error) {
        return { error: "Erreur lors de l'initialisation du paiement" };
    }
}
