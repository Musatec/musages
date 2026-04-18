
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const data: Record<string, string> = {};
        
        formData.forEach((value, key) => {
            data[key] = value.toString();
        });

        console.log("[PAYTECH_IPN] Received notification:", data);

        const {
            type_event,
            ref_command,
            item_price,
            token,
            api_key_sha256,
            api_secret_sha256,
        } = data;

        // 1. Validation de la signature (optionnel mais recommandé)
        // PayTech envoie les hashs SHA256 des clés pour vérification
        const myApiKeyHash = crypto.createHash("sha256").update(process.env.PAYTECH_API_KEY || "").digest("hex");
        const myApiSecretHash = crypto.createHash("sha256").update(process.env.PAYTECH_SECRET_KEY || "").digest("hex");

        if (api_key_sha256 !== myApiKeyHash || api_secret_sha256 !== myApiSecretHash) {
            console.error("[PAYTECH_IPN] Invalid signature/keys");
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }

        // 2. Traitement selon le type d'événement
        if (type_event === "sale_complete") {
            const paymentId = ref_command;

            // Vérifier le paiement dans la base de données
            const payment = await prisma.payment.findUnique({
                where: { id: paymentId },
                include: { user: true }
            });

            if (!payment) {
                console.error(`[PAYTECH_IPN] Payment ${paymentId} not found`);
                return NextResponse.json({ error: "Payment not found" }, { status: 404 });
            }

            if (payment.status === "SUCCESS") {
                return NextResponse.json({ message: "Already processed" });
            }

            // 3. Mettre à jour le statut du paiement et l'abonnement de l'utilisateur
            await prisma.$transaction([
                prisma.payment.update({
                    where: { id: paymentId },
                    data: { status: "SUCCESS" }
                }),
                prisma.user.update({
                    where: { id: payment.userId },
                    data: { 
                        plan: payment.plan,
                        subscriptionStatus: "ACTIVE",
                        trialEndsAt: null // On enlève la période d'essai si elle existait
                    }
                })
            ]);

            console.log(`[PAYTECH_IPN] Payment ${paymentId} successful. User ${payment.userId} upgraded to ${payment.plan}`);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[PAYTECH_IPN_ERROR]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
