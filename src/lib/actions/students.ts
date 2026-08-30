"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createStudent(data: {
  classId?: string;
  matricule?: string;
  firstName: string;
  lastName: string;
  gender?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
}) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide ou Daara non configuré." };

    const matricule = data.matricule || `DAA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const talibe = await prisma.talibe.create({
      data: {
        daaraId,
        halqaId: data.classId || null,
        matricule,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender || "M",
        parentName: data.parentName || null,
        parentPhone: data.parentPhone || null,
        parentEmail: data.parentEmail || null,
      }
    });

    revalidatePath("/students");
    return { success: true, student: talibe, talibe };
  } catch (error: any) {
    console.error("[CREATE_TALIBE_ERROR]", error);
    return { error: error.message || "Erreur lors de la création du Talibé." };
  }
}

export async function getStudentsByClass(classId?: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { students: [] };

    const talibes = await prisma.talibe.findMany({
      where: {
        daaraId,
        deletedAt: null,
        ...(classId ? { halqaId: classId } : {})
      },
      include: { halqa: true },
      orderBy: { lastName: "asc" }
    });

    return { students: talibes, talibes };
  } catch (error: any) {
    console.error("[GET_TALIBES_ERROR]", error);
    return { students: [] };
  }
}
