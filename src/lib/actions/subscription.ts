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
        // 1. Création de l'enregistrement de paiement en attente
        const payment = await prisma.payment.create({
            data: {
                userId: session.user.id,
                amount: amount,
                plan: plan,
                status: "PENDING",
                provider: "PAYTECH",
            }
        });

        console.log(`[PAYMENT] Initiated ${plan} payment of ${amount} FCFA (Ref: ${payment.id})`);
        
        // simulation PayTech / PayDunya
        // En production, ici on appellerait l'API du provider pour obtenir un lien de paiement
        // En passant payment.id comme 'ref_command'
        
        return { 
            success: true, 
            paymentId: payment.id,
            url: `https://paytech.sn/placeholder-payment-link?ref=${payment.id}`, 
            message: "Redirection vers la plateforme de paiement..." 
        };
    } catch (error) {
        console.error("[PAYMENT_ERROR]", error);
        return { error: "Erreur lors de l'initialisation du paiement" };
    }
}
