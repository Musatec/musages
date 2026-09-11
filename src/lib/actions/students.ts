"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface StudentInput {
  classId?: string;
  matricule?: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  status?: "INTERNE" | "EXTERNE";
  healthNotes?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
}

export async function createStudent(data: StudentInput) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

    if (!data.firstName || !data.lastName) {
      return { error: "Le prénom et le nom sont obligatoires." };
    }

    const matricule = data.matricule || `DAA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const talibe = await prisma.talibe.create({
      data: {
        daaraId,
        halqaId: data.classId || null,
        matricule,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        gender: data.gender || "M",
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        status: data.status || "INTERNE",
        healthNotes: data.healthNotes || null,
        parentName: data.parentName ? data.parentName.trim() : null,
        parentPhone: data.parentPhone ? data.parentPhone.trim() : null,
        parentEmail: data.parentEmail ? data.parentEmail.trim() : null,
      }
    });

    revalidatePath("/students");
    revalidatePath("/classes");
    return { success: true, student: talibe, talibe };
  } catch (error: any) {
    console.error("[CREATE_TALIBE_ERROR]", error);
    return { error: error.message || "Erreur lors de la création du Talibé." };
  }
}

export async function updateStudent(id: string, data: Partial<StudentInput>) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

    const existing = await prisma.talibe.findFirst({
      where: { id, daaraId, deletedAt: null }
    });

    if (!existing) {
      return { error: "Talibé introuvable." };
    }

    const updated = await prisma.talibe.update({
      where: { id },
      data: {
        ...(data.firstName ? { firstName: data.firstName.trim() } : {}),
        ...(data.lastName ? { lastName: data.lastName.trim() } : {}),
        ...(data.classId !== undefined ? { halqaId: data.classId || null } : {}),
        ...(data.gender ? { gender: data.gender } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.healthNotes !== undefined ? { healthNotes: data.healthNotes } : {}),
        ...(data.parentName !== undefined ? { parentName: data.parentName } : {}),
        ...(data.parentPhone !== undefined ? { parentPhone: data.parentPhone } : {}),
        ...(data.parentEmail !== undefined ? { parentEmail: data.parentEmail } : {}),
      }
    });

    revalidatePath("/students");
    revalidatePath(`/students/${id}`);
    return { success: true, student: updated };
  } catch (error: any) {
    console.error("[UPDATE_TALIBE_ERROR]", error);
    return { error: error.message || "Erreur lors de la mise à jour du Talibé." };
  }
}

export async function deleteStudent(id: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

    const existing = await prisma.talibe.findFirst({
      where: { id, daaraId, deletedAt: null }
    });

    if (!existing) {
      return { error: "Talibé introuvable ou déjà supprimé." };
    }

    await prisma.talibe.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    revalidatePath("/students");
    return { success: true };
  } catch (error: any) {
    console.error("[DELETE_TALIBE_ERROR]", error);
    return { error: error.message || "Erreur lors de la suppression." };
  }
}

export async function getStudentById(id: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

    const student = await prisma.talibe.findFirst({
      where: { id, daaraId, deletedAt: null },
      include: {
        halqa: true,
        hifzRecords: {
          orderBy: { date: "desc" },
          take: 10,
        },
        sponsorships: true,
      }
    });

    return { student };
  } catch (error: any) {
    console.error("[GET_STUDENT_BY_ID_ERROR]", error);
    return { student: null };
  }
}

export async function getStudentsByClass(classId?: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

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

export async function searchStudents(query: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId || session?.user?.id || "daara_demo_123";

    const results = await prisma.talibe.findMany({
      where: {
        daaraId,
        deletedAt: null,
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { matricule: { contains: query } },
          { parentPhone: { contains: query } },
        ]
      },
      include: { halqa: true },
      take: 20
    });

    return { students: results };
  } catch (error: any) {
    console.error("[SEARCH_STUDENTS_ERROR]", error);
    return { students: [] };
  }
}

