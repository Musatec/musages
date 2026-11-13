"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { DAARA_STAFF_ROLES } from "@/lib/action-context";

export async function addGrade(_data: {
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
    if (!session?.user?.id || !DAARA_STAFF_ROLES.includes(session.user.role)) return { error: "Non autorisé." };

    return { error: "L'enregistrement des notes n'est pas encore disponible." };
  } catch (error: any) {
    console.error("[ADD_GRADE_ERROR]", error);
    return { error: "Erreur lors de l'enregistrement." };
  }
}

export async function getStudentReportCard(studentId: string, _term: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };
    if (!session?.user?.id || !DAARA_STAFF_ROLES.includes(session.user.role)) return { error: "Non autorisé." };

    const talibe = await prisma.talibe.findFirst({
      where: { id: studentId, daaraId, deletedAt: null },
      include: { halqa: true, daara: true }
    });

    if (!talibe) return { error: "Talibé non trouvé." };

    return { error: "Le calcul des bulletins n'est pas encore disponible." };
  } catch (error: any) {
    console.error("[GET_REPORT_CARD_ERROR]", error);
    return { error: "Erreur lors du calcul du bulletin." };
  }
}

export async function getClassReportCards(
  classId: string,
  _term: string
): Promise<{ reportCards?: any[]; error?: string }> {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId || !DAARA_STAFF_ROLES.includes(session.user.role)) return { error: "Non autorisé." };

    const halqa = await prisma.halqa.findFirst({ where: { id: classId, daaraId }, select: { id: true } });
    if (!halqa) return { error: "Classe introuvable." };
    return { error: "La génération des bulletins de classe n'est pas encore disponible." };
  } catch (error: any) {
    console.error("[GET_CLASS_REPORT_CARDS_ERROR]", error);
    return { error: "Erreur lors de la génération." };
  }
}

export async function getClassSynthesisReport(classId: string, _term: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId || !DAARA_STAFF_ROLES.includes(session.user.role)) return { error: "Non autorisé." };

    const halqa = await prisma.halqa.findFirst({ where: { id: classId, daaraId }, select: { id: true } });
    if (!halqa) return { error: "Classe introuvable." };
    return { error: "La synthèse des notes n'est pas encore disponible." };
  } catch (error: any) {
    console.error("[GET_CLASS_SYNTHESIS_ERROR]", error);
    return { error: "Erreur lors de la génération du rapport." };
  }
}

export async function getAnnualReport(classId: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId || !DAARA_STAFF_ROLES.includes(session.user.role)) return { error: "Non autorisé." };

    const halqa = await prisma.halqa.findFirst({ where: { id: classId, daaraId }, select: { id: true } });
    if (!halqa) return { error: "Classe introuvable." };
    return { error: "Le rapport annuel n'est pas encore disponible." };
  } catch (error: any) {
    console.error("[GET_ANNUAL_REPORT_ERROR]", error);
    return { error: "Erreur lors de la génération." };
  }
}
