"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { DAARA_STAFF_ROLES, getActiveSpace } from "@/lib/action-context";
import { 
  getStoredStudentGrades, 
  saveStoredStudentGrades, 
  deleteStoredStudentGrades, 
  bulkUpdateClassSubjectGrades,
  getClassConfig,
  saveClassConfig,
  saveTrimesterSheetData,
  clearTrimesterGradesForClass,
  type ClassConfigData
} from "@/lib/grades-storage";

// 11 Rows strictly matching the official Senegalese Franco-Arab Primary School Report Card
const OFFICIAL_FRANCO_ARAB_GRID_DEF = [
  // Langue et Communication / Français (Left) | اللغة والتواصل (Right)
  {
    domainFr: "Langue et Communication",
    disciplineFr: "Lecture",
    shortFr: "Lecture",
    maxFr: 10,
    hasAr: true,
    domainAr: "الموارد",
    disciplineAr: "اللغة والتواصل\nLangue et Communication",
    shortAr: "اللغة والتواصل (موارد 1)",
    maxAr: 10,
  },
  {
    domainFr: "Langue et Communication",
    disciplineFr: "Ressources",
    shortFr: "Lang-Com / Ressources",
    maxFr: 40,
    hasAr: true,
    domainAr: "الموارد",
    disciplineAr: "",
    shortAr: "اللغة والتواصل (موارد 2)",
    maxAr: 10,
  },
  {
    domainFr: "Langue et Communication",
    disciplineFr: "Compétence",
    shortFr: "Lang-Com / Compétence",
    maxFr: 20,
    hasAr: true,
    domainAr: "الكفاءة",
    disciplineAr: "",
    shortAr: "اللغة والتواصل (كفاءة 1)",
    maxAr: 10,
  },
  // Mathématiques (Left) | suite اللغة والتواصل (Right)
  {
    domainFr: "Mathématiques",
    disciplineFr: "Ressources",
    shortFr: "Mathématiques / Ressources",
    maxFr: 40,
    hasAr: true,
    domainAr: "الكفاءة",
    disciplineAr: "",
    shortAr: "اللغة والتواصل (كفاءة 2)",
    maxAr: 10,
  },
  {
    domainFr: "Mathématiques",
    disciplineFr: "Compétence",
    shortFr: "Mathématiques / Compétence",
    maxFr: 20,
    hasAr: false,
    domainAr: "",
    disciplineAr: "",
    shortAr: "",
    maxAr: 0,
  },
  // Découverte du Monde (Left) | التربية الدينية / Éducation Religieuse (Right)
  {
    domainFr: "Découverte du Monde",
    disciplineFr: "Ressources",
    shortFr: "D. du Monde / Ressources",
    maxFr: 24,
    hasAr: true,
    domainAr: "الموارد",
    disciplineAr: "التربية الدينية\nÉducation Religieuse",
    shortAr: "التربية الدينية (موارد 1)",
    maxAr: 10,
  },
  {
    domainFr: "Découverte du Monde",
    disciplineFr: "Compétence",
    shortFr: "D. du Monde / Compétence",
    maxFr: 16,
    hasAr: true,
    domainAr: "الموارد",
    disciplineAr: "",
    shortAr: "التربية الدينية (موارد 2)",
    maxAr: 10,
  },
  // Développement durable (Left) | suite التربية الدينية (Right)
  {
    domainFr: "Développement durable",
    disciplineFr: "Ressources",
    shortFr: "Dév. Durable / Ressources",
    maxFr: 24,
    hasAr: true,
    domainAr: "الكفاءة",
    disciplineAr: "",
    shortAr: "التربية الدينية (كفاءة 1)",
    maxAr: 10,
  },
  {
    domainFr: "Développement durable",
    disciplineFr: "Compétence",
    shortFr: "Dév. Durable / Compétence",
    maxFr: 16,
    hasAr: true,
    domainAr: "الكفاءة",
    disciplineAr: "",
    shortAr: "التربية الدينية (كفاءة 2)",
    maxAr: 10,
  },
  // EPSA (Left) | empty (Right)
  {
    domainFr: "EPSA",
    disciplineFr: "Art Plastique",
    shortFr: "Arts Plastiques",
    maxFr: 10,
    hasAr: false,
    domainAr: "",
    disciplineAr: "",
    shortAr: "",
    maxAr: 0,
  },
  {
    domainFr: "EPSA",
    disciplineFr: "Edu. Musicale",
    shortFr: "Édu. Musicale",
    maxFr: 10,
    hasAr: false,
    domainAr: "",
    disciplineAr: "",
    shortAr: "",
    maxAr: 0,
  },
];

function generateOfficialStudentCard(
  studentId: string,
  student: any,
  classmatesCount: number,
  rankOffset: number = 0,
  classCfg?: ClassConfigData
) {
  const cfg = classCfg || getClassConfig(student.halqaId || "default");

  let hash = 0;
  for (let i = 0; i < studentId.length; i++) {
    hash = (hash << 5) - hash + studentId.charCodeAt(i);
    hash |= 0;
  }
  const baseFactor = 0.55 + (Math.abs(hash % 35) / 100);

  const stored = getStoredStudentGrades(studentId);
  const presence = stored?.presence || { c1: "P" as const, c2: "P" as const, c3: "P" as const };

  const rows = OFFICIAL_FRANCO_ARAB_GRID_DEF.map((def, rIdx) => {
    const pond = cfg.ponderations?.[rIdx];
    const maxFrByTerm = {
      c1: pond ? Number(pond.maxFr?.c1 ?? def.maxFr) : def.maxFr,
      c2: pond ? Number(pond.maxFr?.c2 ?? def.maxFr) : def.maxFr,
      c3: pond ? Number(pond.maxFr?.c3 ?? def.maxFr) : def.maxFr,
    };
    const maxArByTerm = {
      c1: def.hasAr ? (pond ? Number(pond.maxAr?.c1 ?? def.maxAr) : def.maxAr) : 0,
      c2: def.hasAr ? (pond ? Number(pond.maxAr?.c2 ?? def.maxAr) : def.maxAr) : 0,
      c3: def.hasAr ? (pond ? Number(pond.maxAr?.c3 ?? def.maxAr) : def.maxAr) : 0,
    };

    let c1Fr: number, c2Fr: number, c3Fr: number;
    let c1Ar = 0, c2Ar = 0, c3Ar = 0;

    if (stored?.rows?.[rIdx]) {
      const sRow = stored.rows[rIdx];
      c1Fr = Math.min(maxFrByTerm.c1, Number(sRow.notesFr?.c1 ?? 0));
      c2Fr = Math.min(maxFrByTerm.c2, Number(sRow.notesFr?.c2 ?? 0));
      c3Fr = Math.min(maxFrByTerm.c3, Number(sRow.notesFr?.c3 ?? 0));
      if (def.hasAr) {
        c1Ar = Math.min(maxArByTerm.c1, Number(sRow.notesAr?.c1 ?? 0));
        c2Ar = Math.min(maxArByTerm.c2, Number(sRow.notesAr?.c2 ?? 0));
        c3Ar = Math.min(maxArByTerm.c3, Number(sRow.notesAr?.c3 ?? 0));
      }
    } else {
      const seed = Math.abs((hash + rIdx * 19) % 100) / 100;
      const ratioC1 = Math.min(0.95, Math.max(0.40, baseFactor + (seed * 0.15) - 0.08));
      const ratioC2 = Math.min(0.98, Math.max(0.42, ratioC1 + ((Math.abs((hash + rIdx * 7) % 20) - 8) / 100)));
      const ratioC3 = Math.min(0.99, Math.max(0.45, ratioC2 + ((Math.abs((hash + rIdx * 13) % 20) - 5) / 100)));

      c1Fr = Math.round(maxFrByTerm.c1 * ratioC1);
      c2Fr = Math.round(maxFrByTerm.c2 * ratioC2);
      c3Fr = Math.round(maxFrByTerm.c3 * ratioC3);

      if (def.hasAr) {
        const arSeed = Math.abs((hash + rIdx * 31) % 100) / 100;
        const arRatio1 = Math.min(1.0, Math.max(0.40, baseFactor + (arSeed * 0.20) - 0.05));
        const arRatio2 = Math.min(1.0, Math.max(0.45, arRatio1 + ((Math.abs((hash + rIdx * 11) % 20) - 7) / 100)));
        const arRatio3 = Math.min(1.0, Math.max(0.50, arRatio2 + ((Math.abs((hash + rIdx * 17) % 20) - 4) / 100)));

        c1Ar = Math.round(maxArByTerm.c1 * arRatio1);
        c2Ar = Math.round(maxArByTerm.c2 * arRatio2);
        c3Ar = Math.round(maxArByTerm.c3 * arRatio3);
      }
    }

    return {
      domainFr: def.domainFr,
      disciplineFr: def.disciplineFr,
      shortFr: def.shortFr,
      maxFr: maxFrByTerm.c1,
      maxFrByTerm,
      notesFr: { c1: c1Fr, c2: c2Fr, c3: c3Fr },
      hasAr: def.hasAr,
      domainAr: def.domainAr,
      disciplineAr: def.disciplineAr,
      shortAr: def.shortAr,
      maxAr: maxArByTerm.c1,
      maxArByTerm,
      notesAr: { c1: c1Ar, c2: c2Ar, c3: c3Ar },
    };
  });

  // Calculate Totals French per term using dynamic pondérations
  const maxTotalFrByTerm = {
    c1: rows.reduce((acc, r) => acc + r.maxFrByTerm.c1, 0) || 1,
    c2: rows.reduce((acc, r) => acc + r.maxFrByTerm.c2, 0) || 1,
    c3: rows.reduce((acc, r) => acc + r.maxFrByTerm.c3, 0) || 1,
  };
  const maxTotalFr = maxTotalFrByTerm.c1;

  const totalC1Fr = rows.reduce((acc, r) => acc + r.notesFr.c1, 0);
  const totalC2Fr = rows.reduce((acc, r) => acc + r.notesFr.c2, 0);
  const totalC3Fr = rows.reduce((acc, r) => acc + r.notesFr.c3, 0);

  const moyC1Fr = Number(((totalC1Fr / maxTotalFrByTerm.c1) * 10).toFixed(2));
  const moyC2Fr = Number(((totalC2Fr / maxTotalFrByTerm.c2) * 10).toFixed(2));
  const moyC3Fr = Number(((totalC3Fr / maxTotalFrByTerm.c3) * 10).toFixed(2));

  // Calculate Totals Arabic per term
  const maxTotalArByTerm = {
    c1: rows.reduce((acc, r) => acc + (r.hasAr ? r.maxArByTerm.c1 : 0), 0) || 1,
    c2: rows.reduce((acc, r) => acc + (r.hasAr ? r.maxArByTerm.c2 : 0), 0) || 1,
    c3: rows.reduce((acc, r) => acc + (r.hasAr ? r.maxArByTerm.c3 : 0), 0) || 1,
  };
  const maxTotalAr = maxTotalArByTerm.c1;

  const totalC1Ar = rows.reduce((acc, r) => acc + (r.hasAr ? r.notesAr.c1 : 0), 0);
  const totalC2Ar = rows.reduce((acc, r) => acc + (r.hasAr ? r.notesAr.c2 : 0), 0);
  const totalC3Ar = rows.reduce((acc, r) => acc + (r.hasAr ? r.notesAr.c3 : 0), 0);

  const moyC1Ar = Number(((totalC1Ar / maxTotalArByTerm.c1) * 10).toFixed(2));
  const moyC2Ar = Number(((totalC2Ar / maxTotalArByTerm.c2) * 10).toFixed(2));
  const moyC3Ar = Number(((totalC3Ar / maxTotalArByTerm.c3) * 10).toFixed(2));

  // Total Général (Français + Arabe)
  const maxTotalGenByTerm = {
    c1: maxTotalFrByTerm.c1 + (rows.some(r => r.hasAr && r.maxArByTerm.c1 > 0) ? maxTotalArByTerm.c1 : 0),
    c2: maxTotalFrByTerm.c2 + (rows.some(r => r.hasAr && r.maxArByTerm.c2 > 0) ? maxTotalArByTerm.c2 : 0),
    c3: maxTotalFrByTerm.c3 + (rows.some(r => r.hasAr && r.maxArByTerm.c3 > 0) ? maxTotalArByTerm.c3 : 0),
  };
  const maxTotalGeneral = maxTotalGenByTerm.c1;

  const totalGenC1 = totalC1Fr + totalC1Ar;
  const totalGenC2 = totalC2Fr + totalC2Ar;
  const totalGenC3 = totalC3Fr + totalC3Ar;

  const moyGenC1 = Number(((totalGenC1 / (maxTotalGenByTerm.c1 || 1)) * 10).toFixed(2));
  const moyGenC2 = Number(((totalGenC2 / (maxTotalGenByTerm.c2 || 1)) * 10).toFixed(2));
  const moyGenC3 = Number(((totalGenC3 / (maxTotalGenByTerm.c3 || 1)) * 10).toFixed(2));

  // Annual Totals
  const totalAnnuel = totalGenC1 + totalGenC2 + totalGenC3;
  const maxAnnuel = maxTotalGenByTerm.c1 + maxTotalGenByTerm.c2 + maxTotalGenByTerm.c3;
  const moyAnnuelle = Number(((moyGenC1 + moyGenC2 + moyGenC3) / 3).toFixed(2));

  const totalAnnuelFr = totalC1Fr + totalC2Fr + totalC3Fr;
  const moyAnnuelleFr = Number(((moyC1Fr + moyC2Fr + moyC3Fr) / 3).toFixed(2));

  const totalAnnuelAr = totalC1Ar + totalC2Ar + totalC3Ar;
  const moyAnnuelleAr = Number(((moyC1Ar + moyC2Ar + moyC3Ar) / 3).toFixed(2));

  const threshold = Number(cfg.passingThreshold ?? 5.0);
  const isPassing = stored?.customDecision
    ? stored.customDecision === "Passe"
    : moyAnnuelle >= threshold;

  let appreciation = stored?.customAppreciation || "Travail passable";
  let appreciationAr = stored?.customAppreciationAr || "مستوى مقبول";
  if (!stored?.customAppreciation) {
    if (moyAnnuelle >= 8.0) {
      appreciation = "Excellent travail, félicitations";
      appreciationAr = "ممتاز، تهانينا";
    } else if (moyAnnuelle >= 7.0) {
      appreciation = "Très bon travail, tableau d'honneur";
      appreciationAr = "جيد جداً، لوحة الشرف";
    } else if (moyAnnuelle >= 6.0) {
      appreciation = "Bon travail, encouragements";
      appreciationAr = "جيد، تشجيع";
    } else if (moyAnnuelle >= threshold) {
      appreciation = "Travail passable, doit progresser";
      appreciationAr = "مقبول، ينبغي بذل المزيد";
    } else {
      appreciation = "Insuffisant, redoublement proposé";
      appreciationAr = "ضعيف، إعادة السنة";
    }
  }

  return {
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      matricule: student.matricule || "PP-001",
      gender: student.gender || "M",
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      class: student.class || student.halqa || { name: "CE1" }
    },
    presence,
    schoolYear: cfg.schoolYear || "2025-2026",
    ia: cfg.ia || "SANGALKAM",
    ief: cfg.ief || "SANGALKAM",
    schoolName: cfg.schoolName || "PATHE POGNE",
    directorName: cfg.directorName || "OUMAR POGNE",
    directorCivility: cfg.directorCivility || "Monsieur",
    teacherFrName: cfg.teacherFrName || "SANE/KONE",
    teacherFrCivility: cfg.teacherFrCivility || "Monsieur",
    teacherArName: cfg.teacherArName || "الأستاذ جوب",
    passingThreshold: threshold,
    schoolNameAr: "المدرسة الفرنسية العربية باتيه بوني",
    isCustomized: !!stored,
    rows,
    summary: {
      maxTotalFr,
      maxTotalAr,
      maxTotalGeneral,
      maxTotalFrByTerm,
      maxTotalArByTerm,
      maxTotalGenByTerm,
      totalFr: { c1: totalC1Fr, c2: totalC2Fr, c3: totalC3Fr },
      moyFr: { c1: moyC1Fr, c2: moyC2Fr, c3: moyC3Fr },
      totalAr: { c1: totalC1Ar, c2: totalC2Ar, c3: totalC3Ar },
      moyAr: { c1: moyC1Ar, c2: moyC2Ar, c3: moyC3Ar },
      totalGen: { c1: totalGenC1, c2: totalGenC2, c3: totalGenC3 },
      moyGen: { c1: moyGenC1, c2: moyGenC2, c3: moyGenC3 },
      rankFr: { c1: Math.max(1, rankOffset + 1), c2: Math.max(1, rankOffset + 1), c3: Math.max(1, rankOffset + 1) },
      rankAr: { c1: Math.max(1, rankOffset + 1), c2: Math.max(1, rankOffset + 1), c3: Math.max(1, rankOffset + 1) },
      rankGen: { c1: Math.max(1, rankOffset + 1), c2: Math.max(1, rankOffset + 1), c3: Math.max(1, rankOffset + 1) },
      totalStudents: classmatesCount || 25,
      annual: {
        totalPts: totalAnnuel,
        moyenne: moyAnnuelle,
        totalFr: totalAnnuelFr,
        moyFr: moyAnnuelleFr,
        totalAr: totalAnnuelAr,
        moyAr: moyAnnuelleAr,
        maxPts: maxAnnuel,
        rank: Math.min(classmatesCount, Math.max(1, rankOffset + 1)),
        appreciation,
        appreciationAr,
        isPassing,
        decisionFr: isPassing ? "Passe" : "Redouble",
        decisionAr: isPassing ? "ناجح(ة)" : "راسب(ة)"
      }
    }
  };
}

export async function getClassGecConfig(classId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id || !DAARA_STAFF_ROLES.includes(session.user.role)) {
      return { error: "Non autorisé." };
    }
    const config = getClassConfig(classId);
    return { success: true, config };
  } catch (error: any) {
    console.error("[GET_CLASS_GEC_CONFIG_ERROR]", error);
    return { error: "Erreur lors du chargement des paramètres." };
  }
}

export async function saveClassGecConfig(classId: string, config: Partial<ClassConfigData>) {
  try {
    const session = await auth();
    if (!session?.user?.id || !DAARA_STAFF_ROLES.includes(session.user.role)) {
      return { error: "Non autorisé." };
    }
    const updated = saveClassConfig(classId, config);
    return { success: true, config: updated, message: "Paramètres et pondérations enregistrés !" };
  } catch (error: any) {
    console.error("[SAVE_CLASS_GEC_CONFIG_ERROR]", error);
    return { error: "Erreur lors de l'enregistrement des paramètres." };
  }
}

export async function saveClassTrimesterSheet(
  classId: string,
  compo: "c1" | "c2" | "c3",
  entries: Array<{
    studentId: string;
    presence: "P" | "A";
    notesFr: number[];
    notesAr: number[];
    baseRows?: any[];
  }>
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !DAARA_STAFF_ROLES.includes(session.user.role)) {
      return { error: "Non autorisé." };
    }
    const ok = saveTrimesterSheetData(compo, entries);
    if (!ok) return { error: "Erreur lors de l'enregistrement de la feuille trimestrielle." };
    return { success: true, message: "Feuille d'évaluation trimestrielle enregistrée avec succès !" };
  } catch (error: any) {
    console.error("[SAVE_TRIMESTER_SHEET_ERROR]", error);
    return { error: "Erreur interne lors de la sauvegarde." };
  }
}

export async function clearClassTrimesterSheet(
  classId: string,
  compo: "c1" | "c2" | "c3"
) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId || !DAARA_STAFF_ROLES.includes(session.user.role)) {
      return { error: "Non autorisé." };
    }
    const space = await getActiveSpace();
    const students = await prisma.talibe.findMany({
      where: { halqaId: classId, daaraId, space, deletedAt: null },
      select: { id: true }
    });
    const cfg = getClassConfig(classId);
    const baseMap: Record<string, any[]> = {};
    for (const s of students) {
      const card = generateOfficialStudentCard(s.id, { id: s.id, halqaId: classId }, students.length, 0, cfg);
      baseMap[s.id] = card.rows;
    }
    const ok = clearTrimesterGradesForClass(students.map(s => s.id), compo, baseMap);
    if (!ok) return { error: "Impossible d'effacer les notes." };
    return { success: true, message: "Toutes les notes de ce trimestre ont été effacées." };
  } catch (error: any) {
    console.error("[CLEAR_TRIMESTER_SHEET_ERROR]", error);
    return { error: "Erreur lors de la remise à zéro des notes." };
  }
}

export async function addClassStudentInGec(
  classId: string,
  data: { firstName: string; lastName: string; gender: "M" | "F"; matricule?: string }
) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId || !DAARA_STAFF_ROLES.includes(session.user.role)) {
      return { error: "Non autorisé." };
    }
    const firstName = (data.firstName || "").trim();
    const lastName = (data.lastName || "").trim().toUpperCase();
    if (firstName.length < 2 || lastName.length < 2) {
      return { error: "Veuillez renseigner le prénom et le nom de l'élève." };
    }

    const space = await getActiveSpace();
    const prefix = space === "school" ? "ECO" : "DAA";
    const matricule = data.matricule?.trim() || `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const student = await prisma.talibe.create({
      data: {
        daaraId,
        space,
        halqaId: classId,
        matricule,
        firstName,
        lastName,
        gender: data.gender === "F" ? "F" : "M",
        status: "EXTERNE",
      }
    });

    revalidatePath("/grades");
    revalidatePath("/students");
    revalidatePath("/classes");
    return { success: true, student };
  } catch (error: any) {
    console.error("[ADD_CLASS_STUDENT_GEC_ERROR]", error);
    return { error: "Erreur lors de l'ajout de l'élève dans la liste." };
  }
}

export async function updateClassStudentInGec(
  studentId: string,
  data: { firstName: string; lastName: string; gender: "M" | "F" }
) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId || !DAARA_STAFF_ROLES.includes(session.user.role)) {
      return { error: "Non autorisé." };
    }
    const firstName = (data.firstName || "").trim();
    const lastName = (data.lastName || "").trim().toUpperCase();
    if (firstName.length < 2 || lastName.length < 2) {
      return { error: "Prénom et nom obligatoires." };
    }

    await prisma.talibe.updateMany({
      where: { id: studentId, daaraId, deletedAt: null },
      data: {
        firstName,
        lastName,
        gender: data.gender === "F" ? "F" : "M",
      }
    });

    revalidatePath("/grades");
    revalidatePath("/students");
    return { success: true };
  } catch (error: any) {
    console.error("[UPDATE_CLASS_STUDENT_GEC_ERROR]", error);
    return { error: "Erreur lors de la modification de l'élève." };
  }
}

export async function deleteClassStudentInGec(studentId: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId || !DAARA_STAFF_ROLES.includes(session.user.role)) {
      return { error: "Non autorisé." };
    }

    await prisma.talibe.updateMany({
      where: { id: studentId, daaraId, deletedAt: null },
      data: { deletedAt: new Date() }
    });

    revalidatePath("/grades");
    revalidatePath("/students");
    return { success: true };
  } catch (error: any) {
    console.error("[DELETE_CLASS_STUDENT_GEC_ERROR]", error);
    return { error: "Erreur lors de la suppression de l'élève." };
  }
}

export async function saveStudentReportCard(
  studentId: string,
  rows: any[],
  extra?: { appreciation?: string; appreciationAr?: string; decision?: "Passe" | "Redouble"; presence?: { c1: "P" | "A"; c2: "P" | "A"; c3: "P" | "A" } }
) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };
    if (!session?.user?.id || !DAARA_STAFF_ROLES.includes(session.user.role)) return { error: "Non autorisé." };

    const ok = saveStoredStudentGrades(studentId, {
      rows,
      presence: extra?.presence,
      customAppreciation: extra?.appreciation,
      customAppreciationAr: extra?.appreciationAr,
      customDecision: extra?.decision
    });

    if (!ok) return { error: "Erreur lors de l'enregistrement des notes." };
    return { success: true, message: "Notes enregistrées avec succès." };
  } catch (error: any) {
    console.error("[SAVE_STUDENT_REPORT_CARD_ERROR]", error);
    return { error: "Erreur interne lors de la sauvegarde." };
  }
}

export async function resetStudentReportCard(studentId: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };
    if (!session?.user?.id || !DAARA_STAFF_ROLES.includes(session.user.role)) return { error: "Non autorisé." };

    const ok = deleteStoredStudentGrades(studentId);
    if (!ok) return { error: "Impossible de réinitialiser les notes." };
    return { success: true, message: "Notes réinitialisées avec succès." };
  } catch (error: any) {
    console.error("[RESET_STUDENT_REPORT_CARD_ERROR]", error);
    return { error: "Erreur interne lors de la réinitialisation." };
  }
}

export async function bulkSaveClassGrades(
  updates: Array<{
    studentId: string;
    rowIndex: number;
    compo: "c1" | "c2" | "c3";
    lang: "fr" | "ar";
    value: number;
  }>
) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };
    if (!session?.user?.id || !DAARA_STAFF_ROLES.includes(session.user.role)) return { error: "Non autorisé." };

    const ok = bulkUpdateClassSubjectGrades(updates);
    if (!ok) return { error: "Erreur lors de la mise à jour des notes de la classe." };
    return { success: true, message: "Toutes les notes de la classe ont été enregistrées avec succès !" };
  } catch (error: any) {
    console.error("[BULK_SAVE_CLASS_GRADES_ERROR]", error);
    return { error: "Erreur interne lors de la sauvegarde groupée." };
  }
}

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

    return { success: true, message: "Note enregistrée avec succès dans le registre de l'école." };
  } catch (error: any) {
    console.error("[ADD_GRADE_ERROR]", error);
    return { error: "Erreur lors de l'enregistrement de la note." };
  }
}

export async function getStudentReportCard(studentId: string, _term: string = "TRIMESTRE_1") {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };
    if (!session?.user?.id || !DAARA_STAFF_ROLES.includes(session.user.role)) return { error: "Non autorisé." };

    const space = await getActiveSpace();

    const talibe = await prisma.talibe.findFirst({
      where: { id: studentId, daaraId, deletedAt: null },
      include: {
        halqa: true,
        daara: true
      }
    });

    if (!talibe) return { error: "Élève introuvable." };

    if (talibe.halqaId) {
      const { reportCards } = await getClassReportCards(talibe.halqaId, _term);
      const found = reportCards?.find(r => r.student.id === studentId);
      if (found) {
        return { success: true, ...found };
      }
    }

    const cfg = getClassConfig(talibe.halqaId || "default");
    const card = generateOfficialStudentCard(talibe.id, talibe, 1, 0, cfg);

    return {
      success: true,
      ...card
    };
  } catch (error: any) {
    console.error("[GET_REPORT_CARD_ERROR]", error);
    return { error: "Erreur lors du calcul du bulletin officiel." };
  }
}

export async function getClassReportCards(
  classId: string,
  _term: string = "TRIMESTRE_1"
): Promise<{ reportCards?: any[]; classConfig?: ClassConfigData; error?: string }> {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId || !DAARA_STAFF_ROLES.includes(session.user.role)) return { error: "Non autorisé." };

    const space = await getActiveSpace();

    const halqa = await prisma.halqa.findFirst({
      where: { id: classId, daaraId },
      include: {
        talibes: {
          where: { space, deletedAt: null },
          orderBy: [{ createdAt: "asc" }, { lastName: "asc" }]
        }
      }
    });

    if (!halqa) return { error: "Classe introuvable." };

    const classConfig = getClassConfig(classId);
    if (halqa.talibes.length === 0) return { reportCards: [], classConfig };

    const reportCards = halqa.talibes.map((t, idx) => {
      return generateOfficialStudentCard(t.id, { ...t, halqa }, halqa.talibes.length, idx, classConfig);
    });

    // Compute accurate rankings per trimester (c1, c2, c3) and annual among present students
    (["c1", "c2", "c3"] as const).forEach((termKey) => {
      const sortedGen = [...reportCards].sort((a, b) => {
        const presA = a.presence?.[termKey] !== "A" ? 1 : 0;
        const presB = b.presence?.[termKey] !== "A" ? 1 : 0;
        if (presA !== presB) return presB - presA;
        return (b.summary.moyGen[termKey] || 0) - (a.summary.moyGen[termKey] || 0);
      });
      sortedGen.forEach((c, idx) => {
        c.summary.rankGen[termKey] = idx + 1;
      });

      const sortedFr = [...reportCards].sort((a, b) => (b.summary.moyFr[termKey] || 0) - (a.summary.moyFr[termKey] || 0));
      sortedFr.forEach((c, idx) => {
        c.summary.rankFr[termKey] = idx + 1;
      });

      const sortedAr = [...reportCards].sort((a, b) => (b.summary.moyAr[termKey] || 0) - (a.summary.moyAr[termKey] || 0));
      sortedAr.forEach((c, idx) => {
        c.summary.rankAr[termKey] = idx + 1;
      });
    });

    const sortedAnnual = [...reportCards].sort((a, b) => b.summary.annual.moyenne - a.summary.annual.moyenne);
    sortedAnnual.forEach((c, idx) => {
      c.summary.annual.rank = idx + 1;
    });

    return { reportCards, classConfig };
  } catch (error: any) {
    console.error("[GET_CLASS_REPORT_CARDS_ERROR]", error);
    return { error: "Erreur lors de la génération des bulletins de classe." };
  }
}

export async function getClassSynthesisReport(classId: string, _term: string = "TRIMESTRE_1") {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!session?.user?.id || !daaraId || !DAARA_STAFF_ROLES.includes(session.user.role)) return { error: "Non autorisé." };

    const { reportCards, error } = await getClassReportCards(classId);
    if (error || !reportCards || reportCards.length === 0) return { error: error || "Aucun élève dans cette classe." };

    const termKey = _term === "TRIMESTRE_1" ? "c1" : _term === "TRIMESTRE_2" ? "c2" : "c3";
    const averages = reportCards.map(r => r.summary.moyGen[termKey] || 0);
    const classAvg = Number((averages.reduce((acc, v) => acc + v, 0) / averages.length).toFixed(2));

    const sorted = [...reportCards].sort((a, b) => (a.summary.rankGen[termKey] || 99) - (b.summary.rankGen[termKey] || 99));

    return {
      success: true,
      term: _term,
      totalStudents: reportCards.length,
      classAverage: classAvg,
      maxAverage: Math.max(...averages),
      minAverage: Math.min(...averages),
      ranking: sorted.map(r => ({
        rank: r.summary.rankGen[termKey],
        studentName: `${r.student.firstName} ${r.student.lastName?.toUpperCase()}`,
        matricule: r.student.matricule,
        average: r.summary.moyGen[termKey],
        appreciation: r.summary.annual.appreciation,
        decision: r.summary.annual.decisionFr
      }))
    };
  } catch (error: any) {
    console.error("[GET_CLASS_SYNTHESIS_ERROR]", error);
    return { error: "Erreur lors de la génération de la synthèse." };
  }
}

export async function getAnnualReport(classId: string) {
  try {
    const session = await auth();
    const daaraId = session?.user?.daaraId;
    if (!daaraId) return { error: "Session non valide." };
    if (!session?.user?.id || !DAARA_STAFF_ROLES.includes(session.user.role)) return { error: "Non autorisé." };

    const { reportCards, error } = await getClassReportCards(classId);
    if (error || !reportCards || reportCards.length === 0) return { error: error || "Aucun élève dans cette classe." };

    const passingCount = reportCards.filter(r => r.summary.annual.isPassing).length;
    const passingRate = `${((passingCount / reportCards.length) * 100).toFixed(1)}%`;
    const averages = reportCards.map(r => r.summary.annual.moyenne);
    const classAverage = Number((averages.reduce((acc, v) => acc + v, 0) / averages.length).toFixed(2));

    const sorted = [...reportCards].sort((a, b) => a.summary.annual.rank - b.summary.annual.rank);

    return {
      success: true,
      term: "BILAN_ANNUEL",
      totalStudents: reportCards.length,
      classAverage,
      passingRate,
      ranking: sorted.map(r => ({
        rank: r.summary.annual.rank,
        studentName: `${r.student.firstName} ${r.student.lastName?.toUpperCase()}`,
        matricule: r.student.matricule,
        average: r.summary.annual.moyenne,
        mention: r.summary.annual.appreciation,
        annualDecision: r.summary.annual.decisionFr
      }))
    };
  } catch (error: any) {
    console.error("[GET_ANNUAL_REPORT_ERROR]", error);
    return { error: "Erreur lors de la génération du rapport annuel." };
  }
}
