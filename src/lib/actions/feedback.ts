"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const FeedbackSchema = z.object({
    rating: z.number().min(1).max(5),
    category: z.enum(["BUG", "FEATURE", "SUGGESTION", "GENERAL"]),
    comment: z.string().min(5).max(1000),
});

export async function submitFeedback(data: z.infer<typeof FeedbackSchema>) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Non autorisé" };

    try {
        const validated = FeedbackSchema.parse(data);
        
        await prisma.feedback.create({
            data: {
                userId: session.user.id,
                storeId: session.user.storeId,
                ...validated
            }
        });

        revalidatePath("/");
        return { success: true, message: "Merci pour votre retour ! Votre avis nous aide à bâtir l'écosystème MINDOS." };
    } catch (error) {
        console.error("[FEEDBACK_ERROR]", error);
        return { error: "Erreur lors de l'envoi du feedback." };
    }
}
