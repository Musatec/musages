import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPaymentSuccessEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-paytech-signature"); // Header typique à confirmer
        const secretKey = process.env.PAYTECH_SECRET_KEY;

        // Validation de signature (si activée)
        if (secretKey && signature) {
            const hmac = crypto.createHmac("sha256", secretKey);
            const digest = hmac.update(body).digest("hex");

            if (digest !== signature) {
                console.error("[WEBHOOK] Invalid signature");
                return new NextResponse("Invalid signature", { status: 401 });
            }
        }

        const data = JSON.parse(body);
        console.log("[WEBHOOK] Received PayTech data:", data);

        // PayTech renvoie généralement 'ref_command' qui correspond à notre paymentId
        const paymentId = data.ref_command || data.ref;

        if (!paymentId) {
            return new NextResponse("Missing payment reference", { status: 400 });
        }

        // 1. Trouver le paiement
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { user: true }
        });

        if (!payment) {
            console.error(`[WEBHOOK] Payment ${paymentId} not found`);
            return new NextResponse("Payment not found", { status: 404 });
        }

        if (payment.status === "SUCCESS") {
            return NextResponse.json({ success: true, message: "Already processed" });
        }

        // 2. Mise à jour atomique du statut et des privilèges utilisateur
        await prisma.$transaction([
            prisma.payment.update({
                where: { id: paymentId },
                data: { 
                    status: "SUCCESS",
                    providerRef: data.token || data.transaction_id // ID de transaction PayTech
                }
            }),
            prisma.user.update({
                where: { id: payment.userId },
                data: {
                    plan: payment.plan,
                    subscriptionStatus: "ACTIVE",
                    // Optionnel: réinitialiser la période d'essai ou ajouter du temps
                }
            })
        ]);

        // 3. Envoi de l'email de succès
        if (payment.user.email) {
            try {
                await sendPaymentSuccessEmail(
                    payment.user.email,
                    payment.user.name || "Utilisateur",
                    payment.plan,
                    `${payment.amount} FCFA`
                );
            } catch (emailError) {
                console.error("[WEBHOOK] Failed to send success email:", emailError);
            }
        }

        return NextResponse.json({ success: true, message: "Payment processed successfully" });

    } catch (error) {
        console.error("[WEBHOOK_ERROR]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
