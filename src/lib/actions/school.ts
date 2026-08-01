"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createSchool(data: { name: string; address?: string; phone?: string; email?: string; ninea?: string }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return { error: "Vous devez être connecté." };
    }

    const school = await prisma.school.create({
      data: {
        name: data.name,
        address: data.address || null,
        phone: data.phone || null,
        email: data.email || null,
        ninea: data.ninea || null,
        ownerId: userId,
      },
    });

    // Assigner l'utilisateur comme DIRECTEUR de cette école
    await prisma.user.update({
      where: { id: userId },
      data: {
        schoolId: school.id,
        role: "DIRECTEUR",
        hasSeenOnboarding: true,
      },
    });

    revalidatePath("/dashboard");
    return { success: true, school };
  } catch (error: any) {
    console.error("[CREATE_SCHOOL_ERROR]", error);
    return { error: error.message || "Erreur lors de la création de l'école." };
  }
}

export async function createClass(data: { name: string; level?: string; monthlyFee: number }) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) {
      return { error: "Aucun établissement configuré." };
    }

    const newClass = await prisma.class.create({
      data: {
        schoolId,
        name: data.name,
        level: data.level || "ELEMENTAIRE",
        monthlyFee: Number(data.monthlyFee) || 0,
      },
    });

    revalidatePath("/classes");
    return { success: true, class: newClass };
  } catch (error: any) {
    console.error("[CREATE_CLASS_ERROR]", error);
    return { error: error.message || "Erreur lors de la création de la classe." };
  }
}

export async function createSubject(data: { name: string; coefficient: number; code?: string }) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) {
      return { error: "Aucun établissement configuré." };
    }

    const subject = await prisma.subject.create({
      data: {
        schoolId,
        name: data.name,
        coefficient: Number(data.coefficient) || 1,
        code: data.code || data.name.substring(0, 4).toUpperCase(),
      },
    });

    revalidatePath("/subjects");
    return { success: true, subject };
  } catch (error: any) {
    console.error("[CREATE_SUBJECT_ERROR]", error);
    return { error: error.message || "Erreur lors de la création de la matière." };
  }
}
