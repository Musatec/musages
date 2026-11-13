"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { DAARA_MANAGER_ROLES, DAARA_STAFF_ROLES, getActiveSpace } from "@/lib/action-context";

export interface StudentInput {
  classId?: string;
  matricule?: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  status?: "INTERNE" | "EXTERNE" | "DEMI_PENSION";
  healthNotes?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
}

export async function createStudent(data: StudentInput) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { error: "Non autorisé" };
    if (!DAARA_MANAGER_ROLES.includes(session.user.role)) return { error: "Non autorisé" };
    if (!data || typeof data !== "object") return { error: "Les informations du Talibé ne sont pas valides." };

    const firstName = typeof data?.firstName === "string" ? data.firstName.trim() : "";
    const lastName = typeof data?.lastName === "string" ? data.lastName.trim() : "";
    const matriculeInput = typeof data?.matricule === "string" ? data.matricule.trim() : "";
    const birthDate = data?.dateOfBirth ? new Date(data.dateOfBirth) : undefined;
    if (firstName.length < 2 || firstName.length > 100 || lastName.length < 2 || lastName.length > 100) {
      return { error: "Le prénom et le nom sont obligatoires." };
    }
    if ((data.classId !== undefined && (typeof data.classId !== "string" || data.classId.length > 100)) ||
        (data.dateOfBirth !== undefined && typeof data.dateOfBirth !== "string") ||
        matriculeInput.length > 100 || (data.gender !== undefined && !["M", "F"].includes(data.gender)) ||
        (data.status !== undefined && !["INTERNE", "EXTERNE", "DEMI_PENSION"].includes(data.status)) ||
        (birthDate && (Number.isNaN(birthDate.getTime()) || birthDate > new Date()))) {
      return { error: "Vérifiez le matricule, le sexe, le statut et la date de naissance." };
    }
    if ([data.healthNotes, data.parentName, data.parentPhone, data.parentEmail].some((value) => value !== undefined && value !== null && typeof value !== "string")) {
      return { error: "Les coordonnées et notes doivent être du texte." };
    }
    if ([data.healthNotes, data.parentName, data.parentPhone, data.parentEmail].some((value) => typeof value === "string" && value.length > 500)) {
      return { error: "Un des champs saisis dépasse la longueur autorisée." };
    }
    if (data.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.parentEmail)) {
      return { error: "L'adresse e-mail du parent n'est pas valide." };
    }

    const space = await getActiveSpace();
    const prefix = space === "school" ? "ECO" : "DAA";
    const matricule = matriculeInput || `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (data.classId) {
      const halqa = await prisma.halqa.findFirst({ where: { id: data.classId, daaraId, space } });
      if (!halqa) return { error: "Classe introuvable dans cet établissement." };
    }

    const talibe = await prisma.talibe.create({
      data: {
        daaraId,
        space,
        halqaId: data.classId || null,
        matricule,
        firstName,
        lastName,
        gender: data.gender || "M",
        dateOfBirth: birthDate || null,
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
    if (error?.code === "P2002") {
      return { error: "Ce matricule est déjà utilisé dans cet établissement." };
    }
    return { error: "Erreur lors de la création du Talibé." };
  }
}

export async function updateStudent(id: string, data: Partial<StudentInput>) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { error: "Non autorisé" };
    if (!DAARA_MANAGER_ROLES.includes(session.user.role)) return { error: "Non autorisé" };
    if (!id || !data || typeof data !== "object") return { error: "Informations de modification non valides." };
    const updatedBirthDate = typeof data.dateOfBirth === "string" && data.dateOfBirth ? new Date(data.dateOfBirth) : undefined;
    if ((data.firstName !== undefined && (typeof data.firstName !== "string" || data.firstName.trim().length < 2 || data.firstName.trim().length > 100)) ||
        (data.lastName !== undefined && (typeof data.lastName !== "string" || data.lastName.trim().length < 2 || data.lastName.trim().length > 100)) ||
        (data.matricule !== undefined && (typeof data.matricule !== "string" || data.matricule.trim().length < 1 || data.matricule.trim().length > 100)) ||
        (data.classId !== undefined && (typeof data.classId !== "string" || data.classId.length > 100)) ||
        (data.dateOfBirth !== undefined && typeof data.dateOfBirth !== "string") ||
        (data.gender !== undefined && !["M", "F"].includes(data.gender)) ||
        (data.status !== undefined && !["INTERNE", "EXTERNE", "DEMI_PENSION"].includes(data.status)) ||
        (updatedBirthDate && (Number.isNaN(updatedBirthDate.getTime()) || updatedBirthDate > new Date())) ||
        [data.healthNotes, data.parentName, data.parentPhone, data.parentEmail].some((value) => typeof value === "string" && value.length > 500)) {
      return { error: "Vérifiez les informations du Talibé." };
    }
    if ([data.healthNotes, data.parentName, data.parentPhone, data.parentEmail].some((value) => value !== undefined && value !== null && typeof value !== "string")) {
      return { error: "Les coordonnées et notes doivent être du texte." };
    }
    if (data.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.parentEmail)) {
      return { error: "L'adresse e-mail du parent n'est pas valide." };
    }

    const space = await getActiveSpace();
    const existing = await prisma.talibe.findFirst({
      where: { id, daaraId, space, deletedAt: null }
    });

    if (!existing) {
      return { error: "Talibé introuvable." };
    }

    if (data.classId) {
      const halqa = await prisma.halqa.findFirst({ where: { id: data.classId, daaraId, space } });
      if (!halqa) return { error: "Classe introuvable dans cet établissement." };
    }

    const updateResult = await prisma.talibe.updateMany({
      where: { id, daaraId, deletedAt: null },
      data: {
        ...(data.matricule !== undefined ? { matricule: data.matricule.trim() } : {}),
        ...(data.firstName ? { firstName: data.firstName.trim() } : {}),
        ...(data.lastName ? { lastName: data.lastName.trim() } : {}),
        ...(data.classId !== undefined ? { halqaId: data.classId || null } : {}),
        ...(data.gender ? { gender: data.gender } : {}),
        ...(data.dateOfBirth !== undefined ? { dateOfBirth: updatedBirthDate || null } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.healthNotes !== undefined ? { healthNotes: data.healthNotes } : {}),
        ...(data.parentName !== undefined ? { parentName: data.parentName } : {}),
        ...(data.parentPhone !== undefined ? { parentPhone: data.parentPhone } : {}),
        ...(data.parentEmail !== undefined ? { parentEmail: data.parentEmail } : {}),
      }
    });
    if (updateResult.count !== 1) return { error: "Talibé introuvable." };
    const updated = await prisma.talibe.findFirst({ where: { id, daaraId, deletedAt: null } });

    revalidatePath("/students");
    revalidatePath(`/students/${id}`);
    return { success: true, student: updated };
  } catch (error: any) {
    console.error("[UPDATE_TALIBE_ERROR]", error);
    if (error?.code === "P2002") {
      return { error: "Ce matricule est déjà utilisé dans cet établissement." };
    }
    return { error: "Erreur lors de la mise à jour du Talibé." };
  }
}

export async function deleteStudent(id: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { error: "Non autorisé" };
    if (!DAARA_MANAGER_ROLES.includes(session.user.role)) return { error: "Non autorisé" };
    if (typeof id !== "string" || !id) return { error: "Talibé introuvable ou déjà supprimé." };

    const existing = await prisma.talibe.findFirst({
      where: { id, daaraId, deletedAt: null }
    });

    if (!existing) {
      return { error: "Talibé introuvable ou déjà supprimé." };
    }

    const result = await prisma.talibe.updateMany({
      where: { id, daaraId, deletedAt: null },
      data: { deletedAt: new Date() }
    });
    if (result.count !== 1) return { error: "Talibé introuvable ou déjà supprimé." };

    revalidatePath("/students");
    return { success: true };
  } catch (error: any) {
    console.error("[DELETE_TALIBE_ERROR]", error);
    return { error: "Erreur lors de la suppression." };
  }
}

export async function getStudentById(id: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { student: null };
    if (!DAARA_STAFF_ROLES.includes(session.user.role)) return { student: null };
    if (typeof id !== "string" || !id) return { student: null };

    const studentWhere = { id, daaraId, deletedAt: null };
    const student = DAARA_MANAGER_ROLES.includes(session.user.role)
      ? await prisma.talibe.findFirst({
          where: studentWhere,
          include: {
            halqa: true,
            hifzRecords: { orderBy: { date: "desc" }, take: 10 },
            sponsorships: true,
          },
        })
      : await prisma.talibe.findFirst({
          where: studentWhere,
          select: {
            id: true, daaraId: true, halqaId: true, matricule: true, firstName: true,
            lastName: true, gender: true, status: true, parentName: true, parentPhone: true,
            halqa: true,
            hifzRecords: { orderBy: { date: "desc" }, take: 10 },
          },
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
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { students: [], talibes: [] };
    if (!DAARA_STAFF_ROLES.includes(session.user.role)) return { students: [], talibes: [] };
    if (classId !== undefined && (typeof classId !== "string" || classId.length > 100)) return { students: [], talibes: [] };

    const space = await getActiveSpace();
    const studentWhere = {
      daaraId,
      space,
      deletedAt: null,
      ...(classId ? { halqaId: classId } : {}),
    };
    const talibes = DAARA_MANAGER_ROLES.includes(session.user.role)
      ? await prisma.talibe.findMany({ where: studentWhere, include: { halqa: true }, orderBy: { lastName: "asc" } })
      : await prisma.talibe.findMany({
          where: studentWhere,
          select: {
            id: true, daaraId: true, halqaId: true, matricule: true, firstName: true,
            lastName: true, gender: true, status: true, parentName: true, parentPhone: true,
            halqa: true,
          },
          orderBy: { lastName: "asc" },
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
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { students: [] };
    if (!DAARA_STAFF_ROLES.includes(session.user.role)) return { students: [] };
    if (typeof query !== "string" || query.trim().length < 1 || query.length > 100) return { students: [] };

    const space = await getActiveSpace();
    const results = await prisma.talibe.findMany({
      where: {
        daaraId,
        space,
        deletedAt: null,
        OR: [
          { firstName: { contains: query.trim() } },
          { lastName: { contains: query.trim() } },
          { matricule: { contains: query.trim() } },
        ]
      },
      select: {
        id: true, daaraId: true, halqaId: true, matricule: true, firstName: true,
        lastName: true, gender: true, status: true, parentName: true, parentPhone: true,
        halqa: true,
      },
      take: 20
    });

    return { students: results };
  } catch (error: any) {
    console.error("[SEARCH_STUDENTS_ERROR]", error);
    return { students: [] };
  }
}

export async function bulkImportStudents(studentsList: StudentInput[]) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId) return { error: "Non autorisé" };
    if (!DAARA_MANAGER_ROLES.includes(session.user.role)) return { error: "Non autorisé" };
    if (!Array.isArray(studentsList) || studentsList.length === 0) {
      return { error: "Aucune ligne valide à importer." };
    }

    const space = await getActiveSpace();
    const prefix = space === "school" ? "ECO" : "DAA";
    const currentYear = new Date().getFullYear();

    const created: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < studentsList.length; i++) {
      const row = studentsList[i];
      const firstName = typeof row.firstName === "string" ? row.firstName.trim() : "";
      const lastName = typeof row.lastName === "string" ? row.lastName.trim() : "";

      if (!firstName || !lastName) {
        errors.push(`Ligne ${i + 1} ignorée (prénom ou nom manquant)`);
        continue;
      }

      const matricule = row.matricule?.trim() || `${prefix}-${currentYear}-${Math.floor(10000 + Math.random() * 90000)}`;

      try {
        const student = await prisma.talibe.create({
          data: {
            daaraId,
            space,
            matricule,
            firstName,
            lastName,
            gender: row.gender === "F" ? "F" : "M",
            status: row.status === "INTERNE" || row.status === "EXTERNE" || row.status === "DEMI_PENSION" ? row.status : (space === "school" ? "EXTERNE" : "INTERNE"),
            parentName: row.parentName ? row.parentName.trim() : null,
            parentPhone: row.parentPhone ? row.parentPhone.trim() : null,
            parentEmail: row.parentEmail ? row.parentEmail.trim() : null,
            healthNotes: row.healthNotes ? row.healthNotes.trim() : null,
          }
        });
        created.push(student);
      } catch (err: any) {
        if (err?.code === "P2002") {
          errors.push(`Ligne ${i + 1}: matricule ${matricule} déjà existant`);
        } else {
          errors.push(`Ligne ${i + 1}: erreur lors de l'insertion de ${firstName} ${lastName}`);
        }
      }
    }

    revalidatePath("/students");
    revalidatePath("/classes");
    return {
      success: true,
      importedCount: created.length,
      errorsCount: errors.length,
      errors,
    };
  } catch (error: any) {
    console.error("[BULK_IMPORT_STUDENTS_ERROR]", error);
    return { error: "Erreur technique lors de l'importation." };
  }
}


