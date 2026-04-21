"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { createPayTechPayment } from "@/lib/paytech";

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
                subscriptionEndsAt: true,
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

export type PaymentResponse = {
    success: boolean;
    paymentId?: string;
    url?: string;
    message?: string;
    error?: string;
};

export async function initiatePayment(plan: "STARTER" | "GROWTH" | "BUSINESS"): Promise<PaymentResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Non autorisé" };

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
        
        // 2. Initialisation du paiement réel via PayTech
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        
        const paytechData = {
            item_name: `Abonnement Musages - ${plan}`,
            item_price: amount,
            command_name: `Abonnement ${plan} pour l'utilisateur ${session.user.id}`,
            ref_command: payment.id,
            env: (process.env.PAYTECH_ENV || "test") as "test" | "prod",
            ipn_url: `${appUrl}/api/webhooks/paytech`,
            success_url: `${appUrl}/dashboard?payment=success`,
            cancel_url: `${appUrl}/dashboard/settings/billing?payment=cancel`,
        };

        const result = await createPayTechPayment(paytechData);

        if (result.success === 1 && result.redirect_url) {
            // Mettre à jour le paiement avec la référence PayTech
            await prisma.payment.update({
                where: { id: payment.id },
                data: { providerRef: result.token }
            });

            return { 
                success: true, 
                paymentId: payment.id,
                url: result.redirect_url, 
                message: "Redirection vers la plateforme de paiement..." 
            };
        } else {
            console.error("[PAYTECH_ERROR]", result.error);
            return { 
                success: false, 
                error: result.error?.[0] || "Erreur lors de la création du paiement chez PayTech" 
            };
        }
    } catch (error) {
        console.error("[PAYMENT_ERROR]", error);
        return { success: false, error: "Erreur lors de l'initialisation du paiement" };
    }
}

