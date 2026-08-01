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
  contractType: string;
  hourlyRate: number;
}) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return { error: "Session non valide ou école non configurée." };

    const teacher = await prisma.teacher.create({
      data: {
        schoolId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        mainSubject: data.mainSubject,
        contractType: data.contractType,
        hourlyRate: Number(data.hourlyRate),
      }
    });

    revalidatePath("/teachers");
    return { success: true, teacher };
  } catch (error: any) {
    console.error("[ADD_TEACHER_ERROR]", error);
    return { error: error.message || "Erreur lors de l'ajout de l'enseignant." };
  }
}

export async function payTeacher(data: {
  teacherId: string;
  amount: number;
  description: string;
}) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return { error: "Session non valide." };

    const teacher = await prisma.teacher.findUnique({
      where: { id: data.teacherId }
    });

    if (!teacher || teacher.schoolId !== schoolId) {
      return { error: "Enseignant introuvable." };
    }

    const transaction = await prisma.transaction.create({
      data: {
        schoolId,
        amount: Number(data.amount),
        type: TransactionType.EXPENSE,
        category: "SALAIRE_ENSEIGNANT",
        description: `Paiement ${teacher.firstName} ${teacher.lastName} - ${data.description}`,
      }
    });

    revalidatePath("/teachers");
    revalidatePath("/expenses");
    return { success: true, transaction };
  } catch (error: any) {
    console.error("[PAY_TEACHER_ERROR]", error);
    return { error: "Erreur lors du paiement." };
  }
}

export async function deleteTeacher(id: string) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return { error: "Session non valide." };

    await prisma.teacher.update({
      where: { id, schoolId },
      data: { deletedAt: new Date() }
    });

    revalidatePath("/teachers");
    return { success: true };
  } catch (error: any) {
    return { error: "Impossible de supprimer l'enseignant." };
  }
}
