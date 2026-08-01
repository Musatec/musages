"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function generateMonthlyTuitions(month: number, year: number) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return { error: "Session non valide ou école non configurée." };

    // 1. Récupérer tous les élèves actifs de l'école
    const students = await prisma.student.findMany({
      where: { schoolId, deletedAt: null },
      include: { class: true }
    });

    if (students.length === 0) {
      return { error: "Aucun élève trouvé dans l'établissement." };
    }

    let createdCount = 0;
    const dueDate = new Date(year, month - 1, 5); // Échéance le 5 du mois

    for (const student of students) {
      // Vérifier si la mensualité existe déjà pour cet élève ce mois-ci
      const existing = await prisma.tuitionFee.findFirst({
        where: { schoolId, studentId: student.id, month, year }
      });

      if (!existing) {
        await prisma.tuitionFee.create({
          data: {
            schoolId,
            studentId: student.id,
            month,
            year,
            amount: student.class.monthlyFee || 0,
            status: "PENDING",
            dueDate,
          }
        });
        createdCount++;
      }
    }

    revalidatePath("/tuition");
    return { success: true, count: createdCount };
  } catch (error: any) {
    console.error("[GENERATE_TUITION_ERROR]", error);
    return { error: error.message || "Erreur lors de la génération des écolages." };
  }
}

export async function payTuitionFee(data: {
  tuitionId: string;
  amountPaid: number;
  paymentMethod: "CASH" | "WAVE" | "ORANGE_MONEY" | "CHEQUE" | "BANK_TRANSFER";
  notes?: string;
}) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return { error: "Session non valide." };

    const tuition = await prisma.tuitionFee.findUnique({
      where: { id: data.tuitionId },
      include: { student: true, school: true }
    });

    if (!tuition || tuition.schoolId !== schoolId) {
      return { error: "Écolage non trouvé." };
    }

    const totalPaid = (tuition.amountPaid || 0) + Number(data.amountPaid);
    const newStatus = totalPaid >= tuition.amount ? "PAID" : "PARTIAL";
    const receiptNumber = tuition.receiptNumber || `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const updated = await prisma.$transaction([
      prisma.tuitionFee.update({
        where: { id: data.tuitionId },
        data: {
          amountPaid: totalPaid,
          status: newStatus,
          paymentMethod: data.paymentMethod,
          paidAt: new Date(),
          receiptNumber,
          notes: data.notes || null,
        }
      }),
      // Enregistrer l'entrée de trésorerie dans l'école
      prisma.transaction.create({
        data: {
          schoolId,
          amount: Number(data.amountPaid),
          type: "INCOME",
          category: `ÉCOLAGE_${data.paymentMethod}`,
          description: `Écolage ${tuition.month}/${tuition.year} pour ${tuition.student.firstName} ${tuition.student.lastName} (Matricule: ${tuition.student.matricule})`,
        }
      })
    ]);

    revalidatePath("/tuition");
    return {
      success: true,
      tuition: updated[0],
      receiptUrl: `/receipts/${receiptNumber}`,
      whatsappMessage: `Bonjour ${tuition.student.parentName}, nous vous confirmons le paiement de ${data.amountPaid} FCFA pour l'écolage du mois ${tuition.month}/${tuition.year} de ${tuition.student.firstName}. Reçu N° ${receiptNumber}. Merci !`
    };
  } catch (error: any) {
    console.error("[PAY_TUITION_ERROR]", error);
    return { error: error.message || "Erreur lors du paiement de l'écolage." };
  }
}
