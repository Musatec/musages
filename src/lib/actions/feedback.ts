"use server";

import { auth } from "@/auth";

export async function submitFeedback(_data: { rating: number; category: string; comment: string }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { error: "Non connecté." };

    return { success: false, error: "L'envoi de commentaires n'est pas encore disponible." };
  } catch {
    return { error: "Erreur lors de l'envoi." };
  }
}
