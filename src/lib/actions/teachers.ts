"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { TransactionType } from "@prisma/client";
import { DAARA_MANAGER_ROLES, getActionContext } from "@/lib/action-context";

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
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    if (!context) return { error: "Non autorisé." };
    const firstName = typeof data?.firstName === "string" ? data.firstName.trim() : "";
    const lastName = typeof data?.lastName === "string" ? data.lastName.trim() : "";
    const phone = typeof data?.phone === "string" ? data.phone.trim() : "";
    const email = typeof data?.email === "string" ? data.email.trim().toLowerCase() : "";
    if (firstName.length < 2 || firstName.length > 80 || lastName.length < 2 || lastName.length > 80 || !phone || phone.length > 40 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
      return { error: "Vérifiez le nom, le téléphone et l'adresse e-mail." };
    }

    const user = await prisma.user.create({
      data: {
        daaraId: context.daaraId,
        space: context.space,
        name: `${firstName} ${lastName}`,
        phone,
        email: email || null,
        role: "OUSTAZ",
      },
      select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
    });

    revalidatePath("/teachers");
    return { success: true, teacher: user, user };
  } catch (error: any) {
    console.error("[ADD_OUSTAZ_ERROR]", error);
    if (error?.code === "P2002") {
      return { error: "Un compte ou un Oustaz utilise déjà cet e-mail." };
    }
    return { error: "Erreur lors de l'ajout de l'Oustaz." };
  }
}

export async function bulkImportTeachers(teachersList: {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  mainSubject?: string;
  contractType?: string;
}[]) {
  try {
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    if (!context) return { error: "Non autorisé." };
    if (!Array.isArray(teachersList) || teachersList.length === 0) {
      return { error: "Aucun enseignant à importer." };
    }

    const created: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < teachersList.length; i++) {
      const row = teachersList[i];
      const firstName = typeof row.firstName === "string" ? row.firstName.trim() : "";
      const lastName = typeof row.lastName === "string" ? row.lastName.trim() : "";
      const phone = typeof row.phone === "string" ? row.phone.trim() : "";
      const email = typeof row.email === "string" && row.email.trim() ? row.email.trim().toLowerCase() : null;

      if (!firstName || !lastName || !phone) {
        errors.push(`Ligne ${i + 1} ignorée (prénom, nom ou téléphone manquant)`);
        continue;
      }

      try {
        const user = await prisma.user.create({
          data: {
            daaraId: context.daaraId,
            space: context.space,
            name: `${firstName} ${lastName}`,
            phone,
            email,
            role: "OUSTAZ",
          },
          select: { id: true, name: true, phone: true, email: true }
        });
        created.push(user);
      } catch (err: any) {
        if (err?.code === "P2002") {
          errors.push(`Ligne ${i + 1}: email ${email} déjà utilisé`);
        } else {
          errors.push(`Ligne ${i + 1}: erreur lors de l'insertion`);
        }
      }
    }

    revalidatePath("/teachers");
    return {
      success: true,
      importedCount: created.length,
      errorsCount: errors.length,
      errors,
    };
  } catch (error: any) {
    console.error("[BULK_IMPORT_TEACHERS_ERROR]", error);
    return { error: "Erreur lors de l'importation." };
  }
}


export async function payTeacher(data: {
  teacherId: string;
  amount: number;
  description: string;
}) {
  try {
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    if (!context) return { error: "Non autorisé." };
    const amount = Number(data?.amount);
    const description = typeof data?.description === "string" ? data.description.trim() : "";
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000 || !description || description.length > 500) {
      return { error: "Vérifiez le montant et le motif du paiement." };
    }

    const user = await prisma.user.findFirst({
      where: { id: data.teacherId, daaraId: context.daaraId, space: context.space, role: "OUSTAZ", deletedAt: null },
      select: { id: true, name: true },
    });

    if (!user) return { error: "Oustaz introuvable." };

    const transaction = await prisma.transaction.create({
      data: {
        daaraId: context.daaraId,
        space: context.space,
        amount,
        type: TransactionType.EXPENSE,
        category: "SALAIRE_OUSTAZ",
        description: `Paiement ${user.name || "Oustaz"} - ${description}`,
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
    const context = await getActionContext(DAARA_MANAGER_ROLES);
    if (!context) return { error: "Non autorisé." };

    const result = await prisma.user.updateMany({
      where: { id, daaraId: context.daaraId, role: "OUSTAZ", deletedAt: null },
      data: { deletedAt: new Date() }
    });
    if (result.count !== 1) return { error: "Oustaz introuvable." };

    revalidatePath("/teachers");
    return { success: true };
  } catch {
    return { error: "Impossible de supprimer l'Oustaz." };
  }
}
