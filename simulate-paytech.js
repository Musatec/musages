
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
require('dotenv').config();

async function simulate() {
    // Force the DATABASE_URL if it's not picked up
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("❌ DATABASE_URL missing from process.env");
        return;
    }

    process.env.DATABASE_URL = dbUrl;
    const prisma = new PrismaClient();
    
    console.log("--- PayTech Simulation ---");
    
    // 1. Trouver ou Créer un paiement en attente
    let payment = await prisma.payment.findFirst({
        where: { status: 'PENDING' },
        include: { user: true }
    });

    if (!payment) {
        console.log("No pending payment found, creating one...");
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log("No user found");
            return;
        }
        payment = await prisma.payment.create({
            data: {
                userId: user.id,
                amount: 7000,
                plan: 'BUSINESS',
                status: 'PENDING',
                provider: 'PAYTECH'
            },
            include: { user: true }
        });
    }

    console.log(`Working with payment: ${payment.id} for ${payment.user.email}`);

    // 2. Générer les hashes de sécurité
    const apiKey = process.env.PAYTECH_API_KEY || "";
    const apiSecret = process.env.PAYTECH_SECRET_KEY || "";
    
    const myApiKeyHash = crypto.createHash("sha256").update(apiKey).digest("hex");
    const myApiSecretHash = crypto.createHash("sha256").update(apiSecret).digest("hex");

    // 3. Simuler l'IPN de PayTech
    const payload = new URLSearchParams();
    payload.append("type_event", "sale_complete");
    payload.append("ref_command", payment.id);
    payload.append("item_price", payment.amount.toString());
    payload.append("token", "simulated_token_" + Date.now());
    payload.append("api_key_sha256", myApiKeyHash);
    payload.append("api_secret_sha256", myApiSecretHash);

    console.log("Sending simulated IPN to /api/webhooks/paytech...");

    try {
        const response = await fetch("http://localhost:3000/api/webhooks/paytech", {
            method: "POST",
            body: payload,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        const result = await response.json();
        console.log("Webhook Response:", result);

        if (response.ok) {
            // Vérifier que l'utilisateur a été mis à jour
            const updatedUser = await prisma.user.findUnique({
                where: { id: payment.userId }
            });
            console.log("✅ User Status after Webhook:", updatedUser.subscriptionStatus);
            console.log("✅ User Plan after Webhook:", updatedUser.plan);
        } else {
            console.log("❌ Webhook failed status:", response.status);
        }
    } catch (err) {
        console.error("❌ Error sending request:", err.message);
    } finally {
        await prisma.$disconnect();
    }
}

simulate();
