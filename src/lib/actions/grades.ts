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
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };

    revalidatePath("/grades");
    return { success: true };
  } catch (error: any) {
    console.error("[ADD_GRADE_ERROR]", error);
    return { error: error.message || "Erreur lors de l'enregistrement." };
  }
}

export async function getStudentReportCard(studentId: string, term: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };

    const talibe = await prisma.talibe.findUnique({
      where: { id: studentId },
      include: { halqa: true, daara: true }
    });

    if (!talibe || talibe.daaraId !== daaraId) return { error: "Talibé non trouvé." };

    return {
      success: true,
      student: talibe,
      term,
      schoolConfig: {},
      subjectSummaries: [],
      grandTotalCoefficients: 0,
      grandTotalWeightedGrade: 0,
      overallAverage: 0,
      rawTotalObtained: 0,
      rawTotalMax: 0,
      rawAverage: 0,
      mention: "Passable",
      classStats: {
        rank: 1,
        totalStudents: 1,
        classAverage: 0,
        highestAverage: 0,
        lowestAverage: 0
      },
      discipline: {
        absences: 0,
        delays: 0
      }
    };
  } catch (error: any) {
    console.error("[GET_REPORT_CARD_ERROR]", error);
    return { error: error.message || "Erreur lors du calcul du bulletin." };
  }
}

export async function getClassReportCards(classId: string, term: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };

    return { success: true, reportCards: [] };
  } catch (error: any) {
    console.error("[GET_CLASS_REPORT_CARDS_ERROR]", error);
    return { error: error.message || "Erreur lors de la génération." };
  }
}

export async function getClassSynthesisReport(classId: string, term: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };

    return {
      success: true,
      term,
      synthesisResult: [],
      subjectSuccessRates: []
    };
  } catch (error: any) {
    console.error("[GET_CLASS_SYNTHESIS_ERROR]", error);
    return { error: error.message || "Erreur lors de la génération du rapport." };
  }
}

export async function getAnnualReport(classId: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };

    return {
      success: true,
      studentsData: [],
      passThreshold: 10
    };
  } catch (error: any) {
    console.error("[GET_ANNUAL_REPORT_ERROR]", error);
    return { error: error.message || "Erreur lors de la génération." };
  }
}
