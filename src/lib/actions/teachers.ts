"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { TransactionType } from "@prisma/client";

export async function addTeacher(data: {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  mainSubject?: string;
  contractType?: string;
  hourlyRate?: number;
}) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide ou Daara non configuré." };

    const user = await prisma.user.create({
      data: {
        daaraId,
        name: `${data.firstName} ${data.lastName}`,
        phone: data.phone,
        email: data.email || null,
        role: "OUSTAZ",
      }
    });

    revalidatePath("/teachers");
    return { success: true, teacher: user, user };
  } catch (error: any) {
    console.error("[ADD_OUSTAZ_ERROR]", error);
    return { error: error.message || "Erreur lors de l'ajout de l'Oustaz." };
  }
}

export async function payTeacher(data: {
  teacherId: string;
  amount: number;
  description: string;
}) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };

    const user = await prisma.user.findUnique({
      where: { id: data.teacherId }
    });

    if (!user || user.daaraId !== daaraId) {
      return { error: "Oustaz introuvable." };
    }

    const transaction = await prisma.transaction.create({
      data: {
        daaraId,
        amount: Number(data.amount),
        type: TransactionType.EXPENSE,
        category: "SALAIRE_OUSTAZ",
        description: `Paiement ${user.name || "Oustaz"} - ${data.description}`,
      }
    });

    revalidatePath("/teachers");
    revalidatePath("/expenses");
    return { success: true, transaction };
  } catch (error: any) {
    console.error("[PAY_OUSTAZ_ERROR]", error);
    return { error: "Erreur lors du paiement." };
  }
}

export async function deleteTeacher(id: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    revalidatePath("/teachers");
    return { success: true };
  } catch (error: any) {
    return { error: "Impossible de supprimer l'Oustaz." };
  }
}
