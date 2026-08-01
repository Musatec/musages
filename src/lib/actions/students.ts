"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createStudent(data: {
  classId: string;
  matricule?: string;
  firstName: string;
  lastName: string;
  gender?: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
}) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return { error: "Session non valide ou école non configurée." };

    const matricule = data.matricule || `MAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const student = await prisma.student.create({
      data: {
        schoolId,
        classId: data.classId,
        matricule,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender || "M",
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        parentEmail: data.parentEmail || null,
      }
    });

    revalidatePath("/students");
    return { success: true, student };
  } catch (error: any) {
    console.error("[CREATE_STUDENT_ERROR]", error);
    return { error: error.message || "Erreur lors de la création de l'élève." };
  }
}

export async function getStudentsByClass(classId?: string) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return { students: [] };

    const students = await prisma.student.findMany({
      where: {
        schoolId,
        deletedAt: null,
        ...(classId ? { classId } : {})
      },
      include: { class: true },
      orderBy: { lastName: "asc" }
    });

    return { students };
  } catch (error: any) {
    console.error("[GET_STUDENTS_ERROR]", error);
    return { students: [] };
  }
}
