"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function submitFeedback(data: { rating: number; category: string; comment: string }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { error: "Non connecté." };

    return { success: true };
  } catch (error: any) {
    return { error: "Erreur lors de l'envoi." };
  }
}
