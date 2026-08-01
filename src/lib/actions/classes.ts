"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// --- ACTIONS POUR LES CLASSES ---

export async function addClass(data: {
  name: string;
  description?: string;
  level?: string;
  tuitionFee: number;
}) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return { error: "Session non valide ou école non configurée." };

    const newClass = await prisma.class.create({
      data: {
        schoolId,
        name: data.name,
        description: data.description,
        level: data.level,
        tuitionFee: Number(data.tuitionFee),
      }
    });

    revalidatePath("/classes");
    return { success: true, class: newClass };
  } catch (error: any) {
    console.error("[ADD_CLASS_ERROR]", error);
    return { error: error.message || "Erreur lors de la création de la classe." };
  }
}

export async function deleteClass(id: string) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return { error: "Session non valide." };

    const classWithStudents = await prisma.class.findUnique({
      where: { id },
      include: { students: true }
    });

    if (classWithStudents && classWithStudents.students.length > 0) {
      return { error: "Impossible de supprimer cette classe car elle contient des élèves." };
    }

    await prisma.class.delete({
      where: { id, schoolId }
    });

    revalidatePath("/classes");
    return { success: true };
  } catch (error: any) {
    return { error: "Erreur lors de la suppression." };
  }
}

// --- ACTIONS POUR LES MATIÈRES ---

export async function addSubject(data: {
  name: string;
  code?: string;
  coefficient: number;
}) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return { error: "Session non valide." };

    const subject = await prisma.subject.create({
      data: {
        schoolId,
        name: data.name,
        code: data.code,
        coefficient: Number(data.coefficient),
      }
    });

    revalidatePath("/classes");
    return { success: true, subject };
  } catch (error: any) {
    console.error("[ADD_SUBJECT_ERROR]", error);
    return { error: error.message || "Erreur lors de la création de la matière." };
  }
}

export async function deleteSubject(id: string) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return { error: "Session non valide." };

    await prisma.subject.delete({
      where: { id, schoolId }
    });

    revalidatePath("/classes");
    return { success: true };
  } catch (error: any) {
    return { error: "Impossible de supprimer cette matière car des notes y sont associées." };
  }
}
