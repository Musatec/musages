"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { subDays, startOfDay } from "date-fns";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function getMindInsights() {
    const session = await auth();
    const storeId = session?.user?.storeId;

    if (!storeId) return { error: "Non autorisé" };
    if (!process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY.includes('XXXX')) {
        return { error: "Clé API non configurée." };
    }

    try {
        const now = new Date();
        const thirtyDaysAgo = subDays(now, 30);

        // 1. DATA HARVESTING
        const [sales, outOfStock, debts] = await Promise.all([
            // Recent volume
            prisma.sale.findMany({
                where: { storeId, createdAt: { gte: thirtyDaysAgo } },
                include: { items: { include: { product: true } } }
            }),
            // Shortages
            prisma.stock.findMany({
                where: { storeId, quantity: 0 },
                include: { product: true }
            }),
            // Unpaid issues
            prisma.sale.findMany({
                where: { storeId, status: "PARTIAL" },
                select: { totalAmount: true, amountPaid: true, customerName: true }
            })
        ]);

        // 2. DATA AGGREGATION FOR AI
        const totalRev = sales.reduce((acc, s) => acc + s.totalAmount, 0);
        const topProducts = sales.flatMap(s => s.items)
            .reduce((acc: any, item) => {
                const name = item.product.name;
                acc[name] = (acc[name] || 0) + item.quantity;
                return acc;
            }, {});
        
        const topSelling = Object.entries(topProducts)
            .sort(([, a]: any, [, b]: any) => b - a)
            .slice(0, 5)
            .map(([name, qty]) => `${name} (${qty} unités)`);

        const debtTotal = debts.reduce((acc, d) => acc + (d.totalAmount - d.amountPaid), 0);

        // 3. THE PROMPT : ENGINEERED FOR BUSINESS ELITE
        const prompt = `
            Tu es MindInsight, l'expert IA intégré à l'ERP Musages. 
            Analyse ces données de boutique du mois passé (30 jours) :
            - Chiffre d'Affaire : ${totalRev.toLocaleString()} FCFA
            - Top Ventes : ${topSelling.join(", ")}
            - Ruptures de Stock : ${outOfStock.length} articles
            - Créances Clients (Dettes) : ${debtTotal.toLocaleString()} FCFA

            Donne 3 conseils stratégiques très courts et percutants pour le gérant (Style commercial "Elite", pro, direct). 
            Utilise des emojis. Format : JSON simple avec une clé "insights" qui est une liste de 3 chaînes de caractères.
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Parsing clean JSON from AI output
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return { success: true, insights: parsed.insights };
        }

        return { success: true, insights: ["Optimisez vos stocks", "Relancez les impayés", "Boostez les ventes"] };

    } catch (error) {
        console.error("[AI_ACTION] Error:", error);
        return { error: "L'IA est actuellement fatiguée. Réessayez." };
    }
}
