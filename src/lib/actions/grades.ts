"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function addGrade(data: {
  studentId: string;
  subjectId: string;
  term: "TRIMESTRE_1" | "TRIMESTRE_2" | "TRIMESTRE_3" | "SEMESTRE_1" | "SEMESTRE_2";
  title: string;
  gradeValue: number;
  maxGrade?: number;
  comments?: string;
}) {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return { error: "Session non valide." };

    const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
    if (!subject) return { error: "Matière non trouvée." };

    const grade = await prisma.grade.create({
      data: {
        schoolId,
        studentId: data.studentId,
        subjectId: data.subjectId,
        term: data.term,
        title: data.title,
        gradeValue: Number(data.gradeValue),
        maxGrade: Number(data.maxGrade) || 20,
        coefficient: subject.coefficient || 1,
        comments: data.comments || null,
      }
    });

    revalidatePath("/grades");
    return { success: true, grade };
  } catch (error: any) {
    console.error("[ADD_GRADE_ERROR]", error);
    return { error: error.message || "Erreur lors de l'enregistrement de la note." };
  }
}

export async function getStudentReportCard(studentId: string, term: "TRIMESTRE_1" | "TRIMESTRE_2" | "TRIMESTRE_3") {
  try {
    const session = await auth();
    const schoolId = session?.user?.schoolId;
    if (!schoolId) return { error: "Session non valide." };

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { class: true, school: true }
    });

    if (!student || student.schoolId !== schoolId) return { error: "Élève non trouvé." };

    // Récupérer toutes les notes du trimestre
    const grades = await prisma.grade.findMany({
      where: { studentId, term },
      include: { subject: true }
    });

    // Grouper par matière et calculer les moyennes pondérées
    const subjectMap = new Map<string, { subjectName: string; coefficient: number; totalGrade: number; totalMax: number; count: number }>();

    for (const g of grades) {
      const existing = subjectMap.get(g.subjectId) || {
        subjectName: g.subject.name,
        coefficient: g.subject.coefficient,
        totalGrade: 0,
        totalMax: 0,
        count: 0
      };

      existing.totalGrade += (g.gradeValue / g.maxGrade) * 20; // Ramener sur 20
      existing.count += 1;
      subjectMap.set(g.subjectId, existing);
    }

    let grandTotalWeightedGrade = 0;
    let grandTotalCoefficients = 0;
    const subjectSummaries = [];

    for (const [subjectId, data] of subjectMap.entries()) {
      const averageOn20 = Number((data.totalGrade / data.count).toFixed(2));
      const weightedAverage = averageOn20 * data.coefficient;

      grandTotalWeightedGrade += weightedAverage;
      grandTotalCoefficients += data.coefficient;

      subjectSummaries.push({
        subjectId,
        subjectName: data.subjectName,
        coefficient: data.coefficient,
        averageOn20,
        weightedAverage: Number(weightedAverage.toFixed(2)),
      });
    }

    const overallAverage = grandTotalCoefficients > 0 
      ? Number((grandTotalWeightedGrade / grandTotalCoefficients).toFixed(2))
      : 0;

    let mention = "Passable";
    if (overallAverage >= 16) mention = "Très Bien";
    else if (overallAverage >= 14) mention = "Bien";
    else if (overallAverage >= 12) mention = "Assez Bien";
    else if (overallAverage < 10) mention = "Insuffisant";

    return {
      success: true,
      student,
      term,
      subjectSummaries,
      grandTotalCoefficients,
      grandTotalWeightedGrade: Number(grandTotalWeightedGrade.toFixed(2)),
      overallAverage,
      mention,
    };
  } catch (error: any) {
    console.error("[GET_REPORT_CARD_ERROR]", error);
    return { error: error.message || "Erreur lors du calcul du bulletin." };
  }
}
