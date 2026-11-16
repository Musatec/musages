"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Clock, 
  Download, 
  Plus, 
  BookOpen, 
  FileText, 
  Printer, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  Palette,
  Edit3,
  Save,
  RotateCcw,
  Users,
  MoveHorizontal,
  Settings,
  Trash2,
  UserPlus,
  Table2,
  Sliders
} from "lucide-react";
import { 
  getStudentReportCard, 
  getClassReportCards, 
  saveStudentReportCard,
  resetStudentReportCard,
  saveClassGecConfig,
  saveClassTrimesterSheet,
  clearClassTrimesterSheet,
  addClassStudentInGec,
  updateClassStudentInGec,
  deleteClassStudentInGec
} from "@/lib/actions/grades";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSpace } from "@/components/providers/space-provider";

interface GradesClientProps {
  classes: any[];
  subjects: any[];
  recentGrades: any[];
  schoolName: string;
}

type GecTab = "PARAMETRES" | "LISTE" | "TRIMESTRE_1" | "TRIMESTRE_2" | "TRIMESTRE_3" | "BULLETINS";

const TERMS = [
  { value: "TRIMESTRE_1", labelFr: "Semestre 1", labelAr: "الفصل 1", compoKey: "c1" as const },
  { value: "TRIMESTRE_2", labelFr: "Semestre 2", labelAr: "الفصل 2", compoKey: "c2" as const },
  { value: "TRIMESTRE_3", labelFr: "Semestre 3 & Bilan Général", labelAr: "الفصل 3 والتقرير العام", compoKey: "c3" as const },
];

const OFFICIAL_SUBJECT_METAS = [
  { rowIndex: 0, domainFr: "Langue et Communication", disciplineFr: "Lecture", shortFr: "Lecture", hasAr: true, shortAr: "اللغة والتواصل (موارد 1)", defaultFr: 10, defaultAr: 10 },
  { rowIndex: 1, domainFr: "Langue et Communication", disciplineFr: "Ressources", shortFr: "Lang-Com / Ressources", hasAr: true, shortAr: "اللغة والتواصل (موارد 2)", defaultFr: 40, defaultAr: 10 },
  { rowIndex: 2, domainFr: "Langue et Communication", disciplineFr: "Compétence", shortFr: "Lang-Com / Compétence", hasAr: true, shortAr: "اللغة والتواصل (كفاءة 1)", defaultFr: 20, defaultAr: 10 },
  { rowIndex: 3, domainFr: "Mathématiques", disciplineFr: "Ressources", shortFr: "Mathématiques / Ressources", hasAr: true, shortAr: "اللغة والتواصل (كفاءة 2)", defaultFr: 40, defaultAr: 10 },
  { rowIndex: 4, domainFr: "Mathématiques", disciplineFr: "Compétence", shortFr: "Mathématiques / Compétence", hasAr: false, shortAr: "", defaultFr: 20, defaultAr: 0 },
  { rowIndex: 5, domainFr: "Découverte du Monde", disciplineFr: "Ressources", shortFr: "D. du Monde / Ressources", hasAr: true, shortAr: "التربية الدينية (موارد 1)", defaultFr: 24, defaultAr: 10 },
  { rowIndex: 6, domainFr: "Découverte du Monde", disciplineFr: "Compétence", shortFr: "D. du Monde / Compétence", hasAr: true, shortAr: "التربية الدينية (موارد 2)", defaultFr: 16, defaultAr: 10 },
  { rowIndex: 7, domainFr: "Développement durable", disciplineFr: "Ressources", shortFr: "Dév. Durable / Ressources", hasAr: true, shortAr: "التربية الدينية (كفاءة 1)", defaultFr: 24, defaultAr: 10 },
  { rowIndex: 8, domainFr: "Développement durable", disciplineFr: "Compétence", shortFr: "Dév. Durable / Compétence", hasAr: true, shortAr: "التربية الدينية (كفاءة 2)", defaultFr: 16, defaultAr: 10 },
  { rowIndex: 9, domainFr: "EPSA", disciplineFr: "Art Plastique", shortFr: "Arts Plastiques", hasAr: false, shortAr: "", defaultFr: 10, defaultAr: 0 },
  { rowIndex: 10, domainFr: "EPSA", disciplineFr: "Edu. Musicale", shortFr: "Édu. Musicale", hasAr: false, shortAr: "", defaultFr: 10, defaultAr: 0 },
];

// Helper to compute official report card statistics with dynamic pondérations
function computeCardSummary(rows: any[], passingThreshold: number = 5.0) {
  const maxTotalFrByTerm = {
    c1: rows.reduce((acc, r) => acc + (r.maxFrByTerm?.c1 ?? r.maxFr ?? 0), 0) || 1,
    c2: rows.reduce((acc, r) => acc + (r.maxFrByTerm?.c2 ?? r.maxFr ?? 0), 0) || 1,
    c3: rows.reduce((acc, r) => acc + (r.maxFrByTerm?.c3 ?? r.maxFr ?? 0), 0) || 1,
  };
  const totalC1Fr = rows.reduce((acc, r) => acc + (Number(r.notesFr?.c1) || 0), 0);
  const totalC2Fr = rows.reduce((acc, r) => acc + (Number(r.notesFr?.c2) || 0), 0);
  const totalC3Fr = rows.reduce((acc, r) => acc + (Number(r.notesFr?.c3) || 0), 0);

  const moyC1Fr = Number(((totalC1Fr / maxTotalFrByTerm.c1) * 10).toFixed(2));
  const moyC2Fr = Number(((totalC2Fr / maxTotalFrByTerm.c2) * 10).toFixed(2));
  const moyC3Fr = Number(((totalC3Fr / maxTotalFrByTerm.c3) * 10).toFixed(2));

  const maxTotalArByTerm = {
    c1: rows.reduce((acc, r) => acc + (r.hasAr ? (r.maxArByTerm?.c1 ?? r.maxAr ?? 0) : 0), 0) || 1,
    c2: rows.reduce((acc, r) => acc + (r.hasAr ? (r.maxArByTerm?.c2 ?? r.maxAr ?? 0) : 0), 0) || 1,
    c3: rows.reduce((acc, r) => acc + (r.hasAr ? (r.maxArByTerm?.c3 ?? r.maxAr ?? 0) : 0), 0) || 1,
  };
  const totalC1Ar = rows.reduce((acc, r) => acc + (r.hasAr ? (Number(r.notesAr?.c1) || 0) : 0), 0);
  const totalC2Ar = rows.reduce((acc, r) => acc + (r.hasAr ? (Number(r.notesAr?.c2) || 0) : 0), 0);
  const totalC3Ar = rows.reduce((acc, r) => acc + (r.hasAr ? (Number(r.notesAr?.c3) || 0) : 0), 0);

  const moyC1Ar = Number(((totalC1Ar / maxTotalArByTerm.c1) * 10).toFixed(2));
  const moyC2Ar = Number(((totalC2Ar / maxTotalArByTerm.c2) * 10).toFixed(2));
  const moyC3Ar = Number(((totalC3Ar / maxTotalArByTerm.c3) * 10).toFixed(2));

  const maxTotalGenByTerm = {
    c1: maxTotalFrByTerm.c1 + (rows.some(r => r.hasAr && (r.maxArByTerm?.c1 ?? r.maxAr ?? 0) > 0) ? maxTotalArByTerm.c1 : 0),
    c2: maxTotalFrByTerm.c2 + (rows.some(r => r.hasAr && (r.maxArByTerm?.c2 ?? r.maxAr ?? 0) > 0) ? maxTotalArByTerm.c2 : 0),
    c3: maxTotalFrByTerm.c3 + (rows.some(r => r.hasAr && (r.maxArByTerm?.c3 ?? r.maxAr ?? 0) > 0) ? maxTotalArByTerm.c3 : 0),
  };

  const totalGenC1 = totalC1Fr + totalC1Ar;
  const totalGenC2 = totalC2Fr + totalC2Ar;
  const totalGenC3 = totalC3Fr + totalC3Ar;

  const moyGenC1 = Number(((totalGenC1 / (maxTotalGenByTerm.c1 || 1)) * 10).toFixed(2));
  const moyGenC2 = Number(((totalGenC2 / (maxTotalGenByTerm.c2 || 1)) * 10).toFixed(2));
  const moyGenC3 = Number(((totalGenC3 / (maxTotalGenByTerm.c3 || 1)) * 10).toFixed(2));

  const totalAnnuel = totalGenC1 + totalGenC2 + totalGenC3;
  const maxAnnuel = maxTotalGenByTerm.c1 + maxTotalGenByTerm.c2 + maxTotalGenByTerm.c3;
  const moyAnnuelle = Number(((moyGenC1 + moyGenC2 + moyGenC3) / 3).toFixed(2));

  const totalAnnuelFr = totalC1Fr + totalC2Fr + totalC3Fr;
  const moyAnnuelleFr = Number(((moyC1Fr + moyC2Fr + moyC3Fr) / 3).toFixed(2));

  const totalAnnuelAr = totalC1Ar + totalC2Ar + totalC3Ar;
  const moyAnnuelleAr = Number(((moyC1Ar + moyC2Ar + moyC3Ar) / 3).toFixed(2));

  const isPassing = moyAnnuelle >= passingThreshold;

  let appreciation = "Travail passable";
  let appreciationAr = "مستوى مقبول";
  if (moyAnnuelle >= 8.0) {
    appreciation = "Excellent travail, félicitations";
    appreciationAr = "ممتاز، تهانينا";
  } else if (moyAnnuelle >= 7.0) {
    appreciation = "Très bon travail, tableau d'honneur";
    appreciationAr = "جيد جداً، لوحة الشرف";
  } else if (moyAnnuelle >= 6.0) {
    appreciation = "Bon travail, encouragements";
    appreciationAr = "جيد، تشجيع";
  } else if (moyAnnuelle >= passingThreshold) {
    appreciation = "Travail passable, doit progresser";
    appreciationAr = "مقبول، ينبغي بذل المزيد";
  } else {
    appreciation = "Insuffisant, redoublement proposé";
    appreciationAr = "ضعيف، إعادة السنة";
  }

  return {
    maxTotalFr: maxTotalFrByTerm.c1,
    maxTotalAr: maxTotalArByTerm.c1,
    maxTotalGeneral: maxTotalGenByTerm.c1,
    maxTotalFrByTerm,
    maxTotalArByTerm,
    maxTotalGenByTerm,
    totalFr: { c1: totalC1Fr, c2: totalC2Fr, c3: totalC3Fr },
    moyFr: { c1: moyC1Fr, c2: moyC2Fr, c3: moyC3Fr },
    totalAr: { c1: totalC1Ar, c2: totalC2Ar, c3: totalC3Ar },
    moyAr: { c1: moyC1Ar, c2: moyC2Ar, c3: moyC3Ar },
    totalGen: { c1: totalGenC1, c2: totalGenC2, c3: totalGenC3 },
    moyGen: { c1: moyGenC1, c2: moyGenC2, c3: moyGenC3 },
    annual: {
      totalPts: totalAnnuel,
      moyenne: moyAnnuelle,
      totalFr: totalAnnuelFr,
      moyFr: moyAnnuelleFr,
      totalAr: totalAnnuelAr,
      moyAr: moyAnnuelleAr,
      maxPts: maxAnnuel,
      appreciation,
      appreciationAr,
      isPassing,
      decisionFr: isPassing ? "Passe" : "Redouble",
      decisionAr: isPassing ? "ناجح(ة)" : "راسب(ة)",
    }
  };
}

// --- Exact Reproduction of the Official Senegalese Franco-Arab Primary School Report Card ---
const OfficialReportCard = ({ 
  data, 
  schoolName, 
  reportClass,
  isGreenPaper = true,
  isEditing = false,
  highlightPeriod = "TRIMESTRE_1",
  onNoteChange,
  onDecisionChange,
}: { 
  data: any; 
  schoolName: string; 
  reportClass: any;
  isGreenPaper?: boolean;
  isEditing?: boolean;
  highlightPeriod?: string;
  onNoteChange?: (rowIndex: number, field: "notesFr" | "notesAr", compo: "c1" | "c2" | "c3", val: number) => void;
  onDecisionChange?: (decision: "Passe" | "Redouble") => void;
}) => {
  if (!data?.rows) return null;

  const rows = data.rows || [];
  const summary = data.summary || {};
  const student = data.student || {};
  const className = student.class?.name || reportClass?.name || "CI-CP";

  const isThreeCompos = highlightPeriod === "TRIMESTRE_3" || highlightPeriod === "ALL";
  const isCompo1Only = highlightPeriod === "TRIMESTRE_1";
  const isCompo2Only = highlightPeriod === "TRIMESTRE_2";

  const getMaxForCell = (rIdx: number, field: "notesFr" | "notesAr", compo: "c1" | "c2" | "c3") => {
    const r = rows[rIdx];
    if (!r) return 0;
    if (field === "notesFr") {
      return r.maxFrByTerm?.[compo] ?? r.maxFr ?? 0;
    }
    return r.hasAr ? (r.maxArByTerm?.[compo] ?? r.maxAr ?? 0) : 0;
  };

  const renderCell = (rIdx: number, field: "notesFr" | "notesAr", compo: "c1" | "c2" | "c3", hasVal: boolean) => {
    const max = getMaxForCell(rIdx, field, compo);
    if (!hasVal || max <= 0) {
      return <span className="text-slate-400 font-bold">—</span>;
    }

    const currentVal = data.rows[rIdx]?.[field]?.[compo] ?? 0;

    if (isEditing) {
      return (
        <div className="flex items-center justify-center gap-0.5">
          <input
            type="number"
            min={0}
            max={max}
            step={0.5}
            value={currentVal}
            onChange={(e) => {
              const num = Math.max(0, Math.min(max, Number(e.target.value) || 0));
              onNoteChange?.(rIdx, field, compo, num);
            }}
            className="w-10 sm:w-11 px-1 py-0.5 text-center font-mono font-bold bg-white text-slate-950 border border-slate-700 rounded shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-[10px] sm:text-[11px]"
          />
          <span className="text-[8px] sm:text-[9px] text-slate-600 font-bold">/{max}</span>
        </div>
      );
    }

    return (
      <span className="font-mono font-bold text-slate-950 transition-all text-[10px] sm:text-[11px]">
        {currentVal} <span className="text-[8px] sm:text-[9px] text-slate-600 font-normal">/{max}</span>
      </span>
    );
  };

  const renderFrCells = (rIdx: number) => {
    if (isThreeCompos) {
      return (
        <>
          <td className="border-r border-slate-950 p-1">{renderCell(rIdx, "notesFr", "c1", true)}</td>
          <td className="border-r border-slate-950 p-1">{renderCell(rIdx, "notesFr", "c2", true)}</td>
          <td className="border-r-2 border-slate-950 p-1">{renderCell(rIdx, "notesFr", "c3", true)}</td>
        </>
      );
    }
    if (isCompo1Only) {
      return <td className="border-r-2 border-slate-950 p-1">{renderCell(rIdx, "notesFr", "c1", true)}</td>;
    }
    return <td className="border-r-2 border-slate-950 p-1">{renderCell(rIdx, "notesFr", "c2", true)}</td>;
  };

  const renderArCells = (rIdx: number, hasAr: boolean) => {
    if (isThreeCompos) {
      return (
        <>
          <td className="border-r border-slate-950 p-1">{renderCell(rIdx, "notesAr", "c1", hasAr)}</td>
          <td className="border-r border-slate-950 p-1">{renderCell(rIdx, "notesAr", "c2", hasAr)}</td>
          <td className="border-r-2 border-slate-950 p-1">{renderCell(rIdx, "notesAr", "c3", hasAr)}</td>
        </>
      );
    }
    if (isCompo1Only) {
      return <td className="border-r-2 border-slate-950 p-1">{renderCell(rIdx, "notesAr", "c1", hasAr)}</td>;
    }
    return <td className="border-r-2 border-slate-950 p-1">{renderCell(rIdx, "notesAr", "c2", hasAr)}</td>;
  };

  const maxFrC1 = summary.maxTotalFrByTerm?.c1 ?? summary.maxTotalFr ?? 230;
  const maxFrC2 = summary.maxTotalFrByTerm?.c2 ?? summary.maxTotalFr ?? 230;
  const maxFrC3 = summary.maxTotalFrByTerm?.c3 ?? summary.maxTotalFr ?? 230;

  const maxArC1 = summary.maxTotalArByTerm?.c1 ?? summary.maxTotalAr ?? 80;
  const maxArC2 = summary.maxTotalArByTerm?.c2 ?? summary.maxTotalAr ?? 80;
  const maxArC3 = summary.maxTotalArByTerm?.c3 ?? summary.maxTotalAr ?? 80;

  return (
    <div className={cn(
      "p-3 sm:p-5 md:p-8 rounded-xl sm:rounded-2xl shadow-xl mx-auto w-full max-w-[950px] border border-slate-400 font-sans relative text-slate-950 print:border-none print:shadow-none print:p-2 print:max-w-none print:m-0",
      isGreenPaper ? "bg-[#cbf3d2] text-[#051c0d]" : "bg-white text-slate-950"
    )}>
      
      {/* 1. EN-TÊTE OFFICIEL BILINGUE (alimenté depuis Paramètres de Personnalisation) */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-1.5 sm:gap-2 mb-2 text-[10px] sm:text-xs font-bold leading-tight uppercase">
        <div className="space-y-0.5">
          <p className="tracking-wide">IA : {data.ia || "SANGALKAM"}</p>
          <p className="tracking-wide">IEF : {data.ief || "SANGALKAM"} — ÉCOLE FRANCO-ARABE : {data.schoolName || schoolName?.toUpperCase() || "PATHÉ POGNE"}</p>
        </div>
        <div className="sm:text-right space-y-0.5 font-bold">
          <p className="tracking-wide">ANNÉE SCOLAIRE : {data.schoolYear || "2025-2026"}</p>
          <p className="tracking-wide">
            CLASSE : <span className="font-black text-xs sm:text-sm underline">{className}</span>
            {data.teacherFrName && (
              <span className="ml-2 text-[9px] sm:text-[10px] font-semibold">
                (Tenue par {data.teacherFrCivility === "Madame" ? "Mme" : "M."} {data.teacherFrName})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 2. TITRE DU DOCUMENT */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between border-b-2 border-slate-900 pb-1 mb-2 gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-sm sm:text-base md:text-lg font-black uppercase tracking-wider text-slate-950">
            BULLETIN DE NOTES
          </h1>
          {isCompo1Only && (
            <span className="text-[9px] sm:text-[10px] font-black bg-emerald-800 text-white px-2 py-0.5 rounded uppercase">
              Semestre 1
            </span>
          )}
          {isCompo2Only && (
            <span className="text-[9px] sm:text-[10px] font-black bg-blue-800 text-white px-2 py-0.5 rounded uppercase">
              Semestre 2
            </span>
          )}
          {isThreeCompos && (
            <span className="text-[9px] sm:text-[10px] font-black bg-purple-800 text-white px-2 py-0.5 rounded uppercase">
              Semestre 3 & Bilan Général
            </span>
          )}
        </div>
        <h1 className="text-sm sm:text-base md:text-lg font-black font-arabic tracking-wider text-slate-950 dir-rtl self-end xs:self-auto">
          كشف الدرجات
        </h1>
      </div>

      {/* 3. LIGNE DU NOM ET PRÉNOM DE L'ÉLÈVE */}
      <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between mb-3 text-xs sm:text-sm font-bold border-b border-slate-800 pb-2 gap-1.5">
        <div>
          <span>PRÉNOMS : </span>
          <span className="font-black underline text-xs sm:text-base uppercase tracking-wide">
            {student.firstName || "—"}
          </span>
        </div>
        <div className="text-left xs:text-right flex items-center gap-2">
          <span>NOM : </span>
          <span className="font-black underline text-xs sm:text-base uppercase tracking-wide">
            {student.lastName || "—"}
          </span>
          {student.matricule && (
            <span className="font-mono text-[9px] sm:text-[10px] text-slate-700 bg-white/60 px-1.5 py-0.5 rounded border border-slate-400">
              Matricule : {student.matricule}
            </span>
          )}
        </div>
      </div>

      {/* Indication de défilement horizontal pour mobile */}
      {isThreeCompos && (
        <div className="flex items-center justify-end text-[10px] text-slate-700 sm:hidden mb-1 font-semibold italic gap-1 print:hidden">
          <MoveHorizontal className="w-3 h-3 text-emerald-800 animate-pulse" />
          <span>Défiler le tableau horizontalement ↔️</span>
        </div>
      )}

      {/* 4. LA GRANDE GRILLE BILINGUE FRANÇAIS / ARABE */}
      <div className="w-full overflow-x-auto touch-pan-x -webkit-overflow-scrolling-touch border-2 border-slate-950 mb-3 bg-white/40 shadow-inner">
        <table className={cn(
          "w-full border-collapse text-center text-[10px] sm:text-[11px] leading-tight font-sans",
          isThreeCompos ? "min-w-[700px]" : "min-w-[480px]"
        )}>
          <thead>
            <tr className="border-b-2 border-slate-950 font-black uppercase text-[9px] sm:text-[11px]">
              <th rowSpan={2} className="border-r-2 border-slate-950 p-1 w-24 sm:w-28 bg-slate-900/5">Domaine</th>
              <th rowSpan={2} className="border-r-2 border-slate-950 p-1 w-20 sm:w-24 bg-slate-900/5">Discipline</th>
              <th colSpan={isThreeCompos ? 3 : 1} className="border-r-2 border-slate-950 p-1 bg-slate-900/5">Notes</th>
              <th colSpan={isThreeCompos ? 3 : 1} className="border-r-2 border-slate-950 p-1 font-arabic bg-slate-900/5">الدرجات</th>
              <th rowSpan={2} className="border-r-2 border-slate-950 p-1 w-16 sm:w-20 font-arabic bg-slate-900/5">
                <div>المجال</div>
                <div className="font-sans text-[8px] sm:text-[9px] font-bold">Domaine</div>
              </th>
              <th rowSpan={2} className="p-1 w-24 sm:w-28 font-arabic bg-slate-900/5">
                <div>المواد</div>
                <div className="font-sans text-[8px] sm:text-[9px] font-bold">Disciplines</div>
              </th>
            </tr>
            <tr className="border-b-2 border-slate-950 font-bold text-[8px] sm:text-[10px]">
              {isThreeCompos ? (
                <>
                  <th className="border-r border-slate-950 p-1 w-14 bg-slate-900/5 font-black">Semestre 1</th>
                  <th className="border-r border-slate-950 p-1 w-14 font-black">Semestre 2</th>
                  <th className="border-r-2 border-slate-950 p-1 w-14 font-black">Semestre 3</th>
                  <th className="border-r border-slate-950 p-1 w-12 font-arabic bg-slate-900/5 font-black">الفصل 1</th>
                  <th className="border-r border-slate-950 p-1 w-12 font-arabic font-black">الفصل 2</th>
                  <th className="border-r-2 border-slate-950 p-1 w-12 font-arabic font-black">الفصل 3</th>
                </>
              ) : isCompo1Only ? (
                <>
                  <th className="border-r-2 border-slate-950 p-1 w-16 sm:w-20 bg-slate-900/5 font-black">Semestre 1</th>
                  <th className="border-r-2 border-slate-950 p-1 w-16 sm:w-20 font-arabic bg-slate-900/5 font-black">الفصل 1</th>
                </>
              ) : (
                <>
                  <th className="border-r-2 border-slate-950 p-1 w-16 sm:w-20 bg-slate-900/5 font-black">Semestre 2</th>
                  <th className="border-r-2 border-slate-950 p-1 w-16 sm:w-20 font-arabic bg-slate-900/5 font-black">الفصل 2</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {/* Row 0: Langue et Communication / Lecture */}
            <tr className="border-b border-slate-950">
              <td rowSpan={3} className="border-r-2 border-slate-950 p-1 font-extrabold text-left align-middle pl-1.5 sm:pl-2 bg-slate-900/5">
                Langue et<br />Communication
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-1.5 sm:pl-2">Lecture</td>
              {renderFrCells(0)}
              {renderArCells(0, true)}
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الموارد</td>
              <td rowSpan={4} className="p-1 font-bold align-middle bg-slate-900/5 leading-snug">
                <div className="font-arabic text-xs sm:text-sm text-slate-950">اللغة والتواصل</div>
                <div className="text-[8px] sm:text-[9px] font-sans text-slate-800">Langue et Communication</div>
              </td>
            </tr>

            {/* Row 1: Ressources */}
            <tr className="border-b border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-1.5 sm:pl-2">Ressources</td>
              {renderFrCells(1)}
              {renderArCells(1, true)}
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الموارد</td>
            </tr>

            {/* Row 2: Compétence */}
            <tr className="border-b-2 border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-1.5 sm:pl-2">Compétence</td>
              {renderFrCells(2)}
              {renderArCells(2, true)}
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الكفاءة</td>
            </tr>

            {/* Row 3: Mathématiques / Ressources */}
            <tr className="border-b border-slate-950">
              <td rowSpan={2} className="border-r-2 border-slate-950 p-1 font-extrabold text-left align-middle pl-1.5 sm:pl-2 bg-slate-900/5">
                Mathématiques
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-1.5 sm:pl-2">Ressources</td>
              {renderFrCells(3)}
              {renderArCells(3, true)}
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الكفاءة</td>
            </tr>

            {/* Row 4: Mathématiques / Compétence */}
            <tr className="border-b-2 border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-1.5 sm:pl-2">Compétence</td>
              {renderFrCells(4)}
              {renderArCells(4, false)}
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td className="p-1 text-slate-400">—</td>
            </tr>

            {/* Row 5: Découverte du Monde / Ressources */}
            <tr className="border-b border-slate-950">
              <td rowSpan={2} className="border-r-2 border-slate-950 p-1 font-extrabold text-left align-middle pl-1.5 sm:pl-2 bg-slate-900/5">
                Découverte du<br />Monde
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-1.5 sm:pl-2">Ressources</td>
              {renderFrCells(5)}
              {renderArCells(5, true)}
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الموارد</td>
              <td rowSpan={4} className="p-1 font-bold align-middle bg-slate-900/5 leading-snug">
                <div className="font-arabic text-xs sm:text-sm text-slate-950">التربية الدينية</div>
                <div className="text-[8px] sm:text-[9px] font-sans text-slate-800">Éducation Religieuse</div>
              </td>
            </tr>

            {/* Row 6: Compétence */}
            <tr className="border-b-2 border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-1.5 sm:pl-2">Compétence</td>
              {renderFrCells(6)}
              {renderArCells(6, true)}
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الموارد</td>
            </tr>

            {/* Row 7: Développement durable / Ressources */}
            <tr className="border-b border-slate-950">
              <td rowSpan={2} className="border-r-2 border-slate-950 p-1 font-extrabold text-left align-middle pl-1.5 sm:pl-2 bg-slate-900/5">
                Développement<br />durable
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-1.5 sm:pl-2">Ressources</td>
              {renderFrCells(7)}
              {renderArCells(7, true)}
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الكفاءة</td>
            </tr>

            {/* Row 8: Compétence */}
            <tr className="border-b-2 border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-1.5 sm:pl-2">Compétence</td>
              {renderFrCells(8)}
              {renderArCells(8, true)}
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الكفاءة</td>
            </tr>

            {/* Row 9: EPSA / Art Plastique */}
            <tr className="border-b border-slate-950">
              <td rowSpan={2} className="border-r-2 border-slate-950 p-1 font-extrabold text-left align-middle pl-1.5 sm:pl-2 bg-slate-900/5">
                EPSA
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-1.5 sm:pl-2">Art Plastique</td>
              {renderFrCells(9)}
              {renderArCells(9, false)}
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td className="p-1 text-slate-400">—</td>
            </tr>

            {/* Row 10: Edu. Musicale */}
            <tr className="border-b-2 border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-1.5 sm:pl-2">Edu. Musicale</td>
              {renderFrCells(10)}
              {renderArCells(10, false)}
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td className="p-1 text-slate-400">—</td>
            </tr>

            {/* TOTAL */}
            <tr className="border-b border-slate-950 font-black text-[10px] sm:text-xs bg-slate-900/10">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">TOTAL</td>
              {isThreeCompos ? (
                <>
                  <td className="border-r border-slate-950 p-1 font-mono font-black text-emerald-950">{summary.totalFr?.c1} / {maxFrC1}</td>
                  <td className="border-r border-slate-950 p-1 font-mono font-black text-blue-950">{summary.totalFr?.c2} / {maxFrC2}</td>
                  <td className="border-r-2 border-slate-950 p-1 font-mono font-black text-purple-950">{summary.totalFr?.c3} / {maxFrC3}</td>
                  <td className="border-r border-slate-950 p-1 font-mono font-black text-emerald-950">{summary.totalAr?.c1} / {maxArC1}</td>
                  <td className="border-r border-slate-950 p-1 font-mono font-black text-blue-950">{summary.totalAr?.c2} / {maxArC2}</td>
                  <td className="border-r-2 border-slate-950 p-1 font-mono font-black text-purple-950">{summary.totalAr?.c3} / {maxArC3}</td>
                </>
              ) : isCompo1Only ? (
                <>
                  <td className="border-r-2 border-slate-950 p-1 font-mono font-black text-emerald-950">{summary.totalFr?.c1} / {maxFrC1}</td>
                  <td className="border-r-2 border-slate-950 p-1 font-mono font-black text-emerald-950">{summary.totalAr?.c1} / {maxArC1}</td>
                </>
              ) : (
                <>
                  <td className="border-r-2 border-slate-950 p-1 font-mono font-black text-blue-950">{summary.totalFr?.c2} / {maxFrC2}</td>
                  <td className="border-r-2 border-slate-950 p-1 font-mono font-black text-blue-950">{summary.totalAr?.c2} / {maxArC2}</td>
                </>
              )}
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">المجموع</td>
            </tr>

            {/* MOYENNE */}
            <tr className="border-b border-slate-950 font-black text-[10px] sm:text-xs bg-slate-900/5">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">MOYENNE</td>
              {isThreeCompos ? (
                <>
                  <td className="border-r border-slate-950 p-1 font-mono font-bold text-emerald-900">{summary.moyFr?.c1} <span className="text-[8px] sm:text-[9px]">/ 10</span></td>
                  <td className="border-r border-slate-950 p-1 font-mono font-bold text-blue-900">{summary.moyFr?.c2} <span className="text-[8px] sm:text-[9px]">/ 10</span></td>
                  <td className="border-r-2 border-slate-950 p-1 font-mono font-bold text-purple-900">{summary.moyFr?.c3} <span className="text-[8px] sm:text-[9px]">/ 10</span></td>
                  <td className="border-r border-slate-950 p-1 font-mono font-bold text-emerald-900">{summary.moyAr?.c1} <span className="text-[8px] sm:text-[9px]">/ 10</span></td>
                  <td className="border-r border-slate-950 p-1 font-mono font-bold text-blue-900">{summary.moyAr?.c2} <span className="text-[8px] sm:text-[9px]">/ 10</span></td>
                  <td className="border-r-2 border-slate-950 p-1 font-mono font-bold text-purple-900">{summary.moyAr?.c3} <span className="text-[8px] sm:text-[9px]">/ 10</span></td>
                </>
              ) : isCompo1Only ? (
                <>
                  <td className="border-r-2 border-slate-950 p-1 font-mono font-bold text-emerald-900">{summary.moyFr?.c1} <span className="text-[8px] sm:text-[9px]">/ 10</span></td>
                  <td className="border-r-2 border-slate-950 p-1 font-mono font-bold text-emerald-900">{summary.moyAr?.c1} <span className="text-[8px] sm:text-[9px]">/ 10</span></td>
                </>
              ) : (
                <>
                  <td className="border-r-2 border-slate-950 p-1 font-mono font-bold text-blue-900">{summary.moyFr?.c2} <span className="text-[8px] sm:text-[9px]">/ 10</span></td>
                  <td className="border-r-2 border-slate-950 p-1 font-mono font-bold text-blue-900">{summary.moyAr?.c2} <span className="text-[8px] sm:text-[9px]">/ 10</span></td>
                </>
              )}
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">المعدل</td>
            </tr>

            {/* RANG */}
            <tr className="border-b-2 border-slate-950 font-bold text-[10px] sm:text-xs">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">RANG</td>
              {isThreeCompos ? (
                <>
                  <td className="border-r border-slate-950 p-1">{summary.rankFr?.c1}e Élèves</td>
                  <td className="border-r border-slate-950 p-1">{summary.rankFr?.c2}e Élèves</td>
                  <td className="border-r-2 border-slate-950 p-1">{summary.rankFr?.c3}e Élèves</td>
                  <td className="border-r border-slate-950 p-1 font-arabic">{summary.rankAr?.c1} تلميذاً</td>
                  <td className="border-r border-slate-950 p-1 font-arabic">{summary.rankAr?.c2} تلميذاً</td>
                  <td className="border-r-2 border-slate-950 p-1 font-arabic">{summary.rankAr?.c3} تلميذاً</td>
                </>
              ) : isCompo1Only ? (
                <>
                  <td className="border-r-2 border-slate-950 p-1 font-bold">{summary.rankFr?.c1}e Élèves</td>
                  <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">{summary.rankAr?.c1} تلميذاً</td>
                </>
              ) : (
                <>
                  <td className="border-r-2 border-slate-950 p-1 font-bold">{summary.rankFr?.c2}e Élèves</td>
                  <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">{summary.rankAr?.c2} تلميذاً</td>
                </>
              )}
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">الترتيب</td>
            </tr>

            {/* TOTAL GENERAL */}
            <tr className="border-b border-slate-950 font-black text-[10px] sm:text-xs bg-slate-900/10">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">TOTAL GENERAL</td>
              {isThreeCompos ? (
                <>
                  <td className="border-r border-slate-950 p-1 font-mono font-black text-emerald-950">{summary.totalGen?.c1}</td>
                  <td className="border-r border-slate-950 p-1 font-mono font-black text-blue-950">{summary.totalGen?.c2}</td>
                  <td className="border-r-2 border-slate-950 p-1 font-mono font-black text-purple-950">{summary.totalGen?.c3}</td>
                  <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
                  <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
                  <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
                </>
              ) : isCompo1Only ? (
                <>
                  <td className="border-r-2 border-slate-950 p-1 font-mono font-black text-emerald-950">{summary.totalGen?.c1}</td>
                  <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
                </>
              ) : (
                <>
                  <td className="border-r-2 border-slate-950 p-1 font-mono font-black text-blue-950">{summary.totalGen?.c2}</td>
                  <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
                </>
              )}
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">المجموع العام</td>
            </tr>

            {/* MOYENNE GENERALE */}
            <tr className="border-b border-slate-950 font-black text-[10px] sm:text-xs bg-slate-900/5">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">MOYENNE GENERAL</td>
              {isThreeCompos ? (
                <>
                  <td className="border-r border-slate-950 p-1 font-mono text-emerald-950 font-black bg-emerald-600/15">{summary.moyGen?.c1} <span className="text-[8px] sm:text-[9px]">/ 10</span></td>
                  <td className="border-r border-slate-950 p-1 font-mono text-emerald-950 font-black bg-blue-600/15">{summary.moyGen?.c2} <span className="text-[8px] sm:text-[9px]">/ 10</span></td>
                  <td className="border-r-2 border-slate-950 p-1 font-mono text-emerald-950 font-black bg-purple-600/15">{summary.moyGen?.c3} <span className="text-[8px] sm:text-[9px]">/ 10</span></td>
                  <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
                  <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
                  <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
                </>
              ) : isCompo1Only ? (
                <>
                  <td className="border-r-2 border-slate-950 p-1 font-mono text-emerald-950 font-black bg-emerald-600/15">{summary.moyGen?.c1} <span className="text-[8px] sm:text-[9px]">/ 10</span></td>
                  <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
                </>
              ) : (
                <>
                  <td className="border-r-2 border-slate-950 p-1 font-mono text-emerald-950 font-black bg-blue-600/15">{summary.moyGen?.c2} <span className="text-[8px] sm:text-[9px]">/ 10</span></td>
                  <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
                </>
              )}
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">المعدل العام</td>
            </tr>

            {/* RANG GENERAL */}
            <tr className="border-b-2 border-slate-950 font-bold text-[10px] sm:text-xs">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">RANG GENERAL</td>
              {isThreeCompos ? (
                <>
                  <td className="border-r border-slate-950 p-1 font-black">{summary.rankGen?.c1}e Élèves</td>
                  <td className="border-r border-slate-950 p-1 font-black">{summary.rankGen?.c2}e Élèves</td>
                  <td className="border-r-2 border-slate-950 p-1 font-black">{summary.rankGen?.c3}e Élèves</td>
                  <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
                  <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
                  <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
                </>
              ) : isCompo1Only ? (
                <>
                  <td className="border-r-2 border-slate-950 p-1 font-black">{summary.rankGen?.c1}e Élèves</td>
                  <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
                </>
              ) : (
                <>
                  <td className="border-r-2 border-slate-950 p-1 font-black">{summary.rankGen?.c2}e Élèves</td>
                  <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
                </>
              )}
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">الترتيب العام</td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* 5. BILAN ANNUEL (SEULEMENT POUR LA 3ÈME COMPOSITION) */}
      {isThreeCompos ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 mb-4 text-[10px] sm:text-xs font-sans">
          
          {/* Cartouche Gauche : Bilan Annuel Français */}
          <div className="border-2 border-slate-950 p-2 sm:p-2.5 space-y-1 sm:space-y-1.5 bg-white/50">
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="font-extrabold uppercase">TOTAL ANNUELLE :</span>
              <span className="font-mono font-black text-xs sm:text-sm">
                {summary.annual?.totalPts} pts
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="font-extrabold uppercase">MOY. ANNUELLE :</span>
              <span className="font-mono font-black text-xs sm:text-sm text-emerald-950">
                {summary.annual?.moyenne} / 10
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="font-extrabold uppercase">RANG ANNUELLE :</span>
              <span className="font-black">
                {summary.annual?.rank}e / {summary.totalStudents || 19} Élèves
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1">
              <span className="font-extrabold uppercase">Appréciations :</span>
              <span className="font-bold italic">
                {summary.annual?.appreciation || "Travail passable"}
              </span>
            </div>
            <div className="pt-1 flex items-center justify-between font-bold">
              <span className="uppercase font-black text-[10px] sm:text-[11px]">
                Décision du conseil :
              </span>
              <div className="flex items-center gap-3 sm:gap-4">
                <label 
                  className={cn("flex items-center gap-1.5", isEditing ? "cursor-pointer" : "cursor-default")}
                  onClick={() => isEditing && onDecisionChange?.("Passe")}
                >
                  <span className={cn(
                    "w-3.5 h-3.5 sm:w-4 sm:h-4 border border-slate-950 flex items-center justify-center font-bold text-[9px] sm:text-[10px]",
                    summary.annual?.isPassing ? "bg-slate-950 text-white" : "bg-white text-transparent"
                  )}>
                    {summary.annual?.isPassing ? "✓" : ""}
                  </span>
                  <span>Passe</span>
                </label>
                <label 
                  className={cn("flex items-center gap-1.5", isEditing ? "cursor-pointer" : "cursor-default")}
                  onClick={() => isEditing && onDecisionChange?.("Redouble")}
                >
                  <span className={cn(
                    "w-3.5 h-3.5 sm:w-4 sm:h-4 border border-slate-950 flex items-center justify-center font-bold text-[9px] sm:text-[10px]",
                    !summary.annual?.isPassing ? "bg-slate-950 text-white" : "bg-white text-transparent"
                  )}>
                    {!summary.annual?.isPassing ? "✓" : ""}
                  </span>
                  <span>Redouble</span>
                </label>
              </div>
            </div>
          </div>

          {/* Cartouche Droite : Bilan Annuel Arabe */}
          <div className="border-2 border-slate-950 p-2 sm:p-2.5 space-y-1 sm:space-y-1.5 dir-rtl font-arabic bg-white/50">
            <div className="flex justify-between border-b border-slate-800 pb-1 font-bold">
              <span>المجموع السنوي :</span>
              <span className="font-mono font-black text-xs sm:text-sm font-sans">
                {summary.annual?.totalAr} / {(maxArC1 + maxArC2 + maxArC3)}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1 font-bold">
              <span>المعدل السنوي :</span>
              <span className="font-mono font-black text-xs sm:text-sm text-emerald-950 font-sans">
                {summary.annual?.moyAr} / 10
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1 font-bold">
              <span>الترتيب السنوي :</span>
              <span>
                {summary.annual?.rank} تلميذاً
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1 font-bold">
              <span>التقديرات :</span>
              <span className="font-bold">
                {summary.annual?.appreciationAr || "مستوى مقبول"}
              </span>
            </div>
            <div className="pt-1 flex items-center justify-between font-bold">
              <span className="font-black text-[11px] sm:text-[12px]">
                قرار مجلس المعلمين :
              </span>
              <div className="flex items-center gap-3 sm:gap-4 font-sans text-xs">
                <label 
                  className={cn("flex items-center gap-1.5", isEditing ? "cursor-pointer" : "cursor-default")}
                  onClick={() => isEditing && onDecisionChange?.("Passe")}
                >
                  <span className={cn(
                    "w-3.5 h-3.5 sm:w-4 sm:h-4 border border-slate-950 flex items-center justify-center font-bold text-[9px] sm:text-[10px]",
                    summary.annual?.isPassing ? "bg-slate-950 text-white" : "bg-white text-transparent"
                  )}>
                    {summary.annual?.isPassing ? "✓" : ""}
                  </span>
                  <span className="font-arabic">ناجح(ة)</span>
                </label>
                <label 
                  className={cn("flex items-center gap-1.5", isEditing ? "cursor-pointer" : "cursor-default")}
                  onClick={() => isEditing && onDecisionChange?.("Redouble")}
                >
                  <span className={cn(
                    "w-3.5 h-3.5 sm:w-4 sm:h-4 border border-slate-950 flex items-center justify-center font-bold text-[9px] sm:text-[10px]",
                    !summary.annual?.isPassing ? "bg-slate-950 text-white" : "bg-white text-transparent"
                  )}>
                    {!summary.annual?.isPassing ? "✓" : ""}
                  </span>
                  <span className="font-arabic">راسب(ة)</span>
                </label>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="border-2 border-slate-950 p-2.5 sm:p-3 mb-4 bg-white/50 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="font-extrabold uppercase text-[11px] text-slate-800">Appréciations du Maître : </span>
            <span className="font-bold italic text-slate-950">
              {isCompo1Only 
                ? (summary.moyGen?.c1 >= 5 ? "Bon travail au Semestre 1, continue ainsi." : "Travail à intensifier au Semestre 2.")
                : (summary.moyGen?.c2 >= 5 ? "Résultats satisfaisants au Semestre 2." : "Efforts nécessaires pour le Semestre 3.")}
            </span>
          </div>
          <div className="text-right font-arabic font-bold text-slate-950 dir-rtl text-xs">
            <span>ملاحظات المعلم : </span>
            <span>{isCompo1Only ? "عمل جيد في الفصل الأول، واصل على هذا المنوال" : "نتائج مرضية في الفصل الثاني"}</span>
          </div>
        </div>
      )}

      {/* 6. SIGNATURES OFFICIELLES (LE MAÎTRE / LE DIRECTEUR / LE PARENT) */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center text-[9px] sm:text-xs pt-2 border-t-2 border-slate-950">
        
        {/* Le Maître / المعلم */}
        <div className="flex flex-col items-center justify-between min-h-[4.5rem] sm:min-h-[5rem]">
          <div className="font-black uppercase tracking-wider text-[9px] sm:text-[11px] leading-tight">
            <span>Le Maître</span> / <span className="font-arabic">المعلم</span>
          </div>
          <div className="font-serif italic text-slate-800 text-[10px] sm:text-xs border-b border-dotted border-slate-700 w-24 sm:w-36 pb-0.5 sm:pb-1">
            {data.teacherFrName || "M. SANE/KONE"}
          </div>
        </div>

        {/* Le Directeur / المدير avec Cachet Officiel Pathé Pogne */}
        <div className="flex flex-col items-center justify-between min-h-[4.5rem] sm:min-h-[5rem] relative">
          <div className="font-black uppercase tracking-wider text-[9px] sm:text-[11px] leading-tight">
            <span>Le Directeur</span> / <span className="font-arabic">المدير</span>
          </div>
          
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border border-dashed border-blue-800/80 p-0.5 flex flex-col items-center justify-center text-blue-900 rotate-[-10deg] select-none opacity-85 my-auto">
            <span className="text-[5px] sm:text-[6px] font-black uppercase tracking-tighter leading-none">ÉCOLE FRANCO ARABE</span>
            <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-tight text-center">{data.schoolName || "PATHÉ POGNE"}</span>
            <span className="text-[4px] sm:text-[5px] font-bold uppercase tracking-widest text-center">DIRECTION</span>
          </div>

          <div className="text-[8px] sm:text-[10px] text-slate-700 font-bold">
            {data.directorName || "OUMAR POGNE"}
          </div>
        </div>

        {/* Le Parent / الولي */}
        <div className="flex flex-col items-center justify-between min-h-[4.5rem] sm:min-h-[5rem]">
          <div className="font-black uppercase tracking-wider text-[9px] sm:text-[11px] leading-tight">
            <span>Le parent</span> / <span className="font-arabic">الولي</span>
          </div>
          <div className="text-[8px] sm:text-[10px] italic text-slate-600 border-b border-dotted border-slate-700 w-20 sm:w-32 pb-0.5 sm:pb-1">
            Signature du parent
          </div>
        </div>

      </div>

    </div>
  );
};

export function GradesClient({ 
  classes: initialClasses, 
  schoolName: rawSchoolName
}: GradesClientProps) {
  const { activeSpace } = useSpace();
  const isSchool = activeSpace === "school";
  const defaultSchoolName = isSchool ? "PATHE POGNE" : rawSchoolName;

  const [classes, setClasses] = useState<any[]>(initialClasses);
  const [activeTab, setActiveTab] = useState<GecTab>("TRIMESTRE_1");
  const [selectedClassId, setSelectedClassId] = useState(initialClasses[0]?.id || "");
  const [isGreenPaper, setIsGreenPaper] = useState(true);

  // Full class data (reportCards of all students in selectedClassId + classConfig)
  const [classReportCards, setClassReportCards] = useState<any[]>([]);
  const [classConfig, setClassConfig] = useState<any>({
    schoolYear: "2025-2026",
    ia: "SANGALKAM",
    ief: "SANGALKAM",
    schoolName: defaultSchoolName,
    directorName: "OUMAR POGNE",
    directorCivility: "Monsieur",
    teacherFrName: "SANE/KONE",
    teacherFrCivility: "Monsieur",
    teacherArName: "الأستاذ جوب",
    passingThreshold: 5.0,
    ponderations: OFFICIAL_SUBJECT_METAS.map(m => ({
      maxFr: { c1: m.defaultFr, c2: m.defaultFr, c3: m.defaultFr },
      maxAr: { c1: m.defaultAr, c2: m.defaultAr, c3: m.defaultAr },
    })),
  });
  const [isLoadingClass, setIsLoadingClass] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isSavingSheet, setIsSavingSheet] = useState(false);

  // Filter on Trimester Grid: "BOTH" | "FR" | "AR"
  const [gridLangFilter, setGridLangFilter] = useState<"BOTH" | "FR" | "AR">("BOTH");

  // Liste Nominative states
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newGender, setNewGender] = useState<"M" | "F">("M");
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editGender, setEditGender] = useState<"M" | "F">("M");

  // Bulletin tab state
  const [reportStudentId, setReportStudentId] = useState("");
  const [reportPeriod, setReportPeriod] = useState("TRIMESTRE_1");
  const [isClassReport, setIsClassReport] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // Load full class report cards and config whenever selectedClassId changes
  const loadClassFullData = async (cid: string) => {
    if (!cid) return;
    setIsLoadingClass(true);
    const res = await getClassReportCards(cid, "TRIMESTRE_1");
    if (!res.error) {
      const cards = res.reportCards || [];
      setClassReportCards(cards);
      if (res.classConfig) {
        setClassConfig(res.classConfig);
      }
      if (cards.length > 0 && (!reportStudentId || !cards.some((c: any) => c.student.id === reportStudentId))) {
        setReportStudentId(cards[0].student.id);
      }
    }
    setIsLoadingClass(false);
  };

  useEffect(() => {
    if (selectedClassId) {
      loadClassFullData(selectedClassId);
    }
  }, [selectedClassId]);

  // Recompute rankings and summaries in-memory whenever a note or presence or threshold changes
  const recomputeAllCardsInMemory = (cards: any[], cfg = classConfig) => {
    const threshold = Number(cfg.passingThreshold ?? 5.0);

    const updatedCards = cards.map(card => {
      const rowsWithPond = card.rows.map((r: any, rIdx: number) => {
        const pond = cfg.ponderations?.[rIdx];
        const maxFrByTerm = {
          c1: pond ? Number(pond.maxFr?.c1 ?? r.maxFr) : r.maxFr,
          c2: pond ? Number(pond.maxFr?.c2 ?? r.maxFr) : r.maxFr,
          c3: pond ? Number(pond.maxFr?.c3 ?? r.maxFr) : r.maxFr,
        };
        const maxArByTerm = {
          c1: r.hasAr ? (pond ? Number(pond.maxAr?.c1 ?? r.maxAr) : r.maxAr) : 0,
          c2: r.hasAr ? (pond ? Number(pond.maxAr?.c2 ?? r.maxAr) : r.maxAr) : 0,
          c3: r.hasAr ? (pond ? Number(pond.maxAr?.c3 ?? r.maxAr) : r.maxAr) : 0,
        };
        return {
          ...r,
          maxFrByTerm,
          maxArByTerm,
        };
      });

      const newSum = computeCardSummary(rowsWithPond, threshold);
      return {
        ...card,
        schoolYear: cfg.schoolYear,
        ia: cfg.ia,
        ief: cfg.ief,
        schoolName: cfg.schoolName,
        directorName: cfg.directorName,
        directorCivility: cfg.directorCivility,
        teacherFrName: cfg.teacherFrName,
        teacherFrCivility: cfg.teacherFrCivility,
        teacherArName: cfg.teacherArName,
        passingThreshold: threshold,
        rows: rowsWithPond,
        summary: {
          ...card.summary,
          ...newSum,
          totalStudents: cards.length,
        }
      };
    });

    // Rank calculation per term among present students
    (["c1", "c2", "c3"] as const).forEach(termKey => {
      const sortedGen = [...updatedCards].sort((a, b) => {
        const presA = a.presence?.[termKey] !== "A" ? 1 : 0;
        const presB = b.presence?.[termKey] !== "A" ? 1 : 0;
        if (presA !== presB) return presB - presA;
        return (b.summary.moyGen[termKey] || 0) - (a.summary.moyGen[termKey] || 0);
      });
      sortedGen.forEach((c, idx) => {
        c.summary.rankGen[termKey] = idx + 1;
      });

      const sortedFr = [...updatedCards].sort((a, b) => (b.summary.moyFr[termKey] || 0) - (a.summary.moyFr[termKey] || 0));
      sortedFr.forEach((c, idx) => {
        c.summary.rankFr[termKey] = idx + 1;
      });

      const sortedAr = [...updatedCards].sort((a, b) => (b.summary.moyAr[termKey] || 0) - (a.summary.moyAr[termKey] || 0));
      sortedAr.forEach((c, idx) => {
        c.summary.rankAr[termKey] = idx + 1;
      });
    });

    const sortedAnnual = [...updatedCards].sort((a, b) => b.summary.annual.moyenne - a.summary.annual.moyenne);
    sortedAnnual.forEach((c, idx) => {
      c.summary.annual.rank = idx + 1;
    });

    setClassReportCards(updatedCards);
  };

  // --- Handlers for Paramètres & Pondérations ---
  const handleSaveConfig = async () => {
    if (!selectedClassId) return;
    setIsSavingConfig(true);
    toast.loading("Enregistrement des paramètres et pondérations...");
    const res = await saveClassGecConfig(selectedClassId, classConfig);
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message || "Paramètres enregistrés !");
      recomputeAllCardsInMemory(classReportCards, classConfig);
    }
    setIsSavingConfig(false);
  };

  const handlePonderationChange = (
    rowIndex: number,
    lang: "maxFr" | "maxAr",
    compo: "c1" | "c2" | "c3",
    val: number
  ) => {
    const newPonds = [...(classConfig.ponderations || [])];
    if (!newPonds[rowIndex]) return;
    newPonds[rowIndex] = {
      ...newPonds[rowIndex],
      [lang]: {
        ...newPonds[rowIndex][lang],
        [compo]: Math.max(0, val),
      }
    };
    const nextCfg = { ...classConfig, ponderations: newPonds };
    setClassConfig(nextCfg);
  };

  // --- Handlers for Liste Nominative ---
  const handleAddStudentToList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;
    if (!newFirstName.trim() || !newLastName.trim()) {
      toast.error("Veuillez saisir le prénom et le nom de l'élève.");
      return;
    }
    setIsAddingStudent(true);
    toast.loading("Ajout de l'élève dans la liste nominative...");
    const res = await addClassStudentInGec(selectedClassId, {
      firstName: newFirstName.trim(),
      lastName: newLastName.trim().toUpperCase(),
      gender: newGender,
    });
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Élève ajouté avec succès (disponible sur les 3 trimestres) !");
      setNewFirstName("");
      setNewLastName("");
      await loadClassFullData(selectedClassId);
    }
    setIsAddingStudent(false);
  };

  const handleSaveEditStudent = async (sid: string) => {
    if (!editFirstName.trim() || !editLastName.trim()) {
      toast.error("Prénom et nom requis.");
      return;
    }
    toast.loading("Mise à jour de l'élève...");
    const res = await updateClassStudentInGec(sid, {
      firstName: editFirstName.trim(),
      lastName: editLastName.trim().toUpperCase(),
      gender: editGender,
    });
    toast.dismiss();
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Élève modifié !");
      setEditingStudentId(null);
      await loadClassFullData(selectedClassId);
    }
  };

  const handleDeleteStudentFromList = async (sid: string, fullName: string) => {
    if (!confirm(`Retirer définitivement ${fullName} de la liste nominative ?`)) return;
    toast.loading("Suppression...");
    const res = await deleteClassStudentInGec(sid);
    toast.dismiss();
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Élève retiré de la liste.");
      await loadClassFullData(selectedClassId);
    }
  };

  // --- Handlers for Trimester Sheets (Trimestre 1, 2, 3) ---
  const handleSheetCellChange = (
    studentId: string,
    rowIndex: number,
    field: "notesFr" | "notesAr",
    compo: "c1" | "c2" | "c3",
    val: number
  ) => {
    const nextCards = classReportCards.map(c => {
      if (c.student.id !== studentId) return c;
      const newRows = [...c.rows];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        [field]: {
          ...newRows[rowIndex][field],
          [compo]: val,
        }
      };
      return { ...c, rows: newRows };
    });
    recomputeAllCardsInMemory(nextCards);
  };

  const handleTogglePresence = (studentId: string, compo: "c1" | "c2" | "c3") => {
    const nextCards = classReportCards.map(c => {
      if (c.student.id !== studentId) return c;
      const currentPres = c.presence?.[compo] || "P";
      const nextPres = currentPres === "P" ? "A" : "P";
      return {
        ...c,
        presence: {
          ...(c.presence || { c1: "P", c2: "P", c3: "P" }),
          [compo]: nextPres,
        }
      };
    });
    recomputeAllCardsInMemory(nextCards);
  };

  const handleSaveTrimesterSheet = async (compo: "c1" | "c2" | "c3") => {
    if (!selectedClassId) return;
    setIsSavingSheet(true);
    toast.loading("Enregistrement de la feuille d'évaluation...");

    // Also save threshold if changed on T3
    await saveClassGecConfig(selectedClassId, classConfig);

    const entries = classReportCards.map(c => ({
      studentId: c.student.id,
      presence: (c.presence?.[compo] || "P") as "P" | "A",
      notesFr: c.rows.map((r: any) => Number(r.notesFr?.[compo]) || 0),
      notesAr: c.rows.map((r: any) => Number(r.notesAr?.[compo]) || 0),
      baseRows: c.rows,
    }));

    const res = await saveClassTrimesterSheet(selectedClassId, compo, entries);
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message || "Feuille du trimestre enregistrée !");
    }
    setIsSavingSheet(false);
  };

  const handleClearTrimesterSheet = async (compo: "c1" | "c2" | "c3") => {
    const label = compo === "c1" ? "1er Trimestre" : compo === "c2" ? "2ème Trimestre" : "3ème Trimestre";
    if (!confirm(`Voulez-vous vraiment EFFACER toutes les notes du ${label} pour cette classe ?`)) return;

    toast.loading("Remise à zéro des notes du trimestre...");
    const res = await clearClassTrimesterSheet(selectedClassId, compo);
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message || "Notes effacées.");
      await loadClassFullData(selectedClassId);
    }
  };

  // --- Handlers for Individual Bulletin Tab ---
  const activeStudentCard = useMemo(() => {
    return classReportCards.find(c => c.student.id === reportStudentId) || classReportCards[0] || null;
  }, [classReportCards, reportStudentId]);

  const currentStudentIndex = classReportCards.findIndex(c => c.student.id === activeStudentCard?.student?.id);

  const handleSaveSingleBulletin = async () => {
    if (!activeStudentCard) return;
    setIsSavingReport(true);
    toast.loading("Enregistrement du bulletin...");
    const res = await saveStudentReportCard(activeStudentCard.student.id, activeStudentCard.rows, {
      presence: activeStudentCard.presence,
      decision: activeStudentCard.summary?.annual?.decisionFr,
      appreciation: activeStudentCard.summary?.annual?.appreciation,
      appreciationAr: activeStudentCard.summary?.annual?.appreciationAr,
    });
    toast.dismiss();
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Bulletin enregistré avec succès !");
      setIsEditingReport(false);
    }
    setIsSavingReport(false);
  };

  const handleDecisionChangeOnBulletin = (decision: "Passe" | "Redouble") => {
    if (!activeStudentCard) return;
    const nextCards = classReportCards.map(c => {
      if (c.student.id !== activeStudentCard.student.id) return c;
      return {
        ...c,
        summary: {
          ...c.summary,
          annual: {
            ...c.summary.annual,
            isPassing: decision === "Passe",
            decisionFr: decision,
            decisionAr: decision === "Passe" ? "ناجح(ة)" : "راسب(ة)",
          }
        }
      };
    });
    setClassReportCards(nextCards);
  };

  // Render Trimester/Semestre Evaluation Sheet (GEC Excel style)
  const renderTrimesterEvaluationSheet = (compo: "c1" | "c2" | "c3") => {
    const titleLabel =
      compo === "c1"
        ? "ÉVALUATION DU SEMESTRE 1"
        : compo === "c2"
        ? "ÉVALUATION DU SEMESTRE 2"
        : "ÉVALUATION DU SEMESTRE 3";

    const presentCards = classReportCards.filter(c => (c.presence?.[compo] || "P") === "P");
    const ontCompose = presentCards.length;
    const garconsCount = presentCards.filter(c => c.student.gender !== "F").length;
    const fillesCount = presentCards.filter(c => c.student.gender === "F").length;

    // Determine active columns based on pondérations > 0
    const activeFrCols = OFFICIAL_SUBJECT_METAS.filter((m, idx) => {
      const max = classConfig.ponderations?.[idx]?.maxFr?.[compo] ?? m.defaultFr;
      return max > 0 && (gridLangFilter === "BOTH" || gridLangFilter === "FR");
    });

    const activeArCols = OFFICIAL_SUBJECT_METAS.filter((m, idx) => {
      if (!m.hasAr) return false;
      const max = classConfig.ponderations?.[idx]?.maxAr?.[compo] ?? m.defaultAr;
      return max > 0 && (gridLangFilter === "BOTH" || gridLangFilter === "AR");
    });

    const totalMaxFr = activeFrCols.reduce(
      (acc, m) => acc + Number(classConfig.ponderations?.[m.rowIndex]?.maxFr?.[compo] ?? m.defaultFr),
      0
    );
    const totalMaxAr = activeArCols.reduce(
      (acc, m) => acc + Number(classConfig.ponderations?.[m.rowIndex]?.maxAr?.[compo] ?? m.defaultAr),
      0
    );
    const totalMaxCombined = totalMaxFr + totalMaxAr;

    return (
      <div className="space-y-4">
        {/* Bandeau Supérieur Style GEC (Capture 1, 3, 6) */}
        <div className="bg-card border-2 border-slate-800 rounded-xl p-3 sm:p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Gauche : Classe + Titre */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="border-2 border-slate-800 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded text-center">
                <div className="text-[9px] font-bold uppercase text-slate-500">Classe</div>
                <div className="text-sm font-black text-slate-950 dark:text-white">{selectedClass?.name || "CI-CP"}</div>
              </div>

              <div className="border-2 border-slate-800 bg-[#f6e6d5] text-slate-950 px-4 py-2 rounded font-black text-xs sm:text-sm md:text-base tracking-wide uppercase shadow-2xs">
                {titleLabel}
              </div>
            </div>

            {/* Centre : Statistiques Ont composé / Garçons / Filles */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-bold">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-400 px-2.5 py-1.5 rounded">
                <span className="text-slate-600 dark:text-slate-300 text-[11px]">Ont composé :</span>
                <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-400">{ontCompose}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-400 px-2.5 py-1.5 rounded">
                <span className="text-slate-600 dark:text-slate-300 text-[11px]">G :</span>
                <span className="font-mono font-black text-sm text-blue-700 dark:text-blue-400">{garconsCount}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-400 px-2.5 py-1.5 rounded">
                <span className="text-slate-600 dark:text-slate-300 text-[11px]">F :</span>
                <span className="font-mono font-black text-sm text-pink-700 dark:text-pink-400">{fillesCount}</span>
              </div>

              {/* Préciser la moyenne de passage (uniquement au 3e trimestre comme sur Capture 1) */}
              {compo === "c3" && (
                <div className="flex items-center gap-1.5 bg-amber-50 border-2 border-amber-700/60 px-2.5 py-1 rounded text-slate-900">
                  <span className="text-[10px] font-black uppercase leading-tight">Moyenne<br/>de passage :</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    step={0.25}
                    value={classConfig.passingThreshold ?? 5}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 5;
                      const nextCfg = { ...classConfig, passingThreshold: val };
                      setClassConfig(nextCfg);
                      recomputeAllCardsInMemory(classReportCards, nextCfg);
                    }}
                    className="w-14 px-1.5 py-1 text-center font-mono font-black text-sm bg-white border border-slate-700 rounded"
                  />
                </div>
              )}
            </div>

            {/* Droite : Actions Enregistrer / Effacer les notes */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleSaveTrimesterSheet(compo)}
                disabled={isSavingSheet}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[11px] tracking-wider px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 transition-all"
              >
                {isSavingSheet ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Enregistrer Tout</span>
              </button>
              <button
                type="button"
                onClick={() => handleClearTrimesterSheet(compo)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] tracking-wider px-3 py-2 rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Effacer les notes</span>
              </button>
            </div>

          </div>

          {/* Barre de filtre des colonnes (Français + Arabe / Français seul / Arabe seul) */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-border/50 text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-muted-foreground text-[11px]">Colonnes affichées :</span>
              <button
                type="button"
                onClick={() => setGridLangFilter("BOTH")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-bold transition-all",
                  gridLangFilter === "BOTH" ? "bg-slate-900 text-white font-black" : "bg-muted text-muted-foreground"
                )}
              >
                Français & Arabe ({activeFrCols.length + activeArCols.length} matières)
              </button>
              <button
                type="button"
                onClick={() => setGridLangFilter("FR")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-bold transition-all",
                  gridLangFilter === "FR" ? "bg-emerald-700 text-white font-black" : "bg-muted text-muted-foreground"
                )}
              >
                Français seul ({activeFrCols.length})
              </button>
              <button
                type="button"
                onClick={() => setGridLangFilter("AR")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-bold transition-all font-arabic",
                  gridLangFilter === "AR" ? "bg-teal-700 text-white font-black" : "bg-muted text-muted-foreground"
                )}
              >
                العربية فقط ({activeArCols.length})
              </button>
            </div>

            <div className="text-[11px] text-muted-foreground font-medium">
              💡 Cliquez sur <span className="font-black text-emerald-700">P</span> (Présent) ou <span className="font-black text-rose-600">A</span> (Absent) pour pointer la présence d'un élève à la composition.
            </div>
          </div>
        </div>

        {/* GRANDE GRILLE TABLEUR D'ÉVALUATION */}
        <div className="w-full overflow-x-auto touch-pan-x -webkit-overflow-scrolling-touch border-2 border-slate-900 rounded-xl bg-white text-slate-950 shadow-md">
          <table className="w-full border-collapse text-[11px] font-sans">
            <thead>
              {/* Ligne 1 : "Note sur" (Barèmes en haut de chaque colonne comme sur Captures 1, 3, 6) */}
              <tr className="bg-slate-200 border-b border-slate-800 font-black text-center">
                <th colSpan={4} className="border-r-2 border-slate-800 p-1.5 text-right pr-3 italic text-slate-800 text-xs">
                  Note sur
                </th>
                {activeFrCols.map((m) => {
                  const max = classConfig.ponderations?.[m.rowIndex]?.maxFr?.[compo] ?? m.defaultFr;
                  return (
                    <th key={`max-fr-${m.rowIndex}`} className="border-r border-slate-700 p-1 w-14 bg-emerald-50 text-emerald-950 font-mono text-xs">
                      {max}
                    </th>
                  );
                })}
                {activeArCols.map((m) => {
                  const max = classConfig.ponderations?.[m.rowIndex]?.maxAr?.[compo] ?? m.defaultAr;
                  return (
                    <th key={`max-ar-${m.rowIndex}`} className="border-r border-slate-700 p-1 w-14 bg-teal-50 text-teal-950 font-mono text-xs">
                      {max}
                    </th>
                  );
                })}
                <th className="border-r border-slate-800 p-1 w-14 bg-amber-100 font-mono text-xs">{totalMaxCombined}</th>
                <th className="border-r border-slate-800 p-1 w-14 bg-amber-100 font-mono text-xs">10</th>
                <th className="border-r-2 border-slate-800 p-1 w-12 bg-amber-100 font-mono text-xs">{ontCompose}</th>

                {/* Bloc Récapitulatif Annuel à droite (exclusivement au Semestre 3) */}
                {compo === "c3" && (
                  <th colSpan={6} className="p-1 bg-[#f6e6d5] text-slate-950 font-black uppercase tracking-wider text-xs border-l-2 border-slate-900">
                    BILAN & PASSAGE ANNUEL (3 SEMESTRES)
                  </th>
                )}
              </tr>

              {/* Ligne 2 : Noms des colonnes */}
              <tr className="bg-slate-100 border-b-2 border-slate-900 font-black text-[10px] text-center">
                <th className="border-r border-slate-700 p-1.5 w-8">N°</th>
                <th className="border-r border-slate-700 p-1.5 min-w-[170px] text-left pl-2">PRÉNOMS ET NOM</th>
                <th className="border-r border-slate-700 p-1 w-10">SEXE</th>
                <th className="border-r-2 border-slate-800 p-1 w-14" title="Présent (P) ou Absent (A)">PRÉSENCE</th>

                {activeFrCols.map((m) => (
                  <th key={`lbl-fr-${m.rowIndex}`} className="border-r border-slate-700 p-1.5 w-14 bg-emerald-50/50 leading-tight">
                    <div className="line-clamp-2">{m.shortFr}</div>
                  </th>
                ))}

                {activeArCols.map((m) => (
                  <th key={`lbl-ar-${m.rowIndex}`} className="border-r border-slate-700 p-1.5 w-14 bg-teal-50/50 font-arabic leading-tight">
                    <div className="line-clamp-2">{m.shortAr}</div>
                  </th>
                ))}

                <th className="border-r border-slate-800 p-1.5 w-14 bg-amber-50/70">TOTAL</th>
                <th className="border-r border-slate-800 p-1.5 w-14 bg-amber-50/70">MOYENNE</th>
                <th className="border-r-2 border-slate-800 p-1.5 w-12 bg-amber-50/70">RANG</th>

                {compo === "c3" && (
                  <>
                    <th className="border-r border-slate-700 p-1 w-12 bg-[#fdf4eb]">SEM. 1</th>
                    <th className="border-r border-slate-700 p-1 w-12 bg-[#fdf4eb]">SEM. 2</th>
                    <th className="border-r border-slate-700 p-1 w-12 bg-[#fdf4eb]">SEM. 3</th>
                    <th className="border-r border-slate-700 p-1 w-14 bg-amber-100 font-black">MOY. ANNUELLE</th>
                    <th className="border-r border-slate-700 p-1 w-12 bg-amber-100 font-black">RANG GÉN.</th>
                    <th className="p-1 w-16 bg-amber-100 font-black">PASSAGE</th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {classReportCards.length === 0 ? (
                <tr>
                  <td colSpan={20} className="p-8 text-center text-slate-500 italic">
                    Aucun élève dans cette classe. Allez dans l'onglet « 📋 Liste Nominative » pour ajouter les élèves une fois pour toute l'année.
                  </td>
                </tr>
              ) : (
                classReportCards.map((card, idx) => {
                  const sid = card.student.id;
                  const pres = (card.presence?.[compo] || "P") as "P" | "A";
                  const isAbsent = pres === "A";

                  // Compute displayed total and average according to active filter
                  const rowTotalFr = activeFrCols.reduce(
                    (acc, m) => acc + (Number(card.rows[m.rowIndex]?.notesFr?.[compo]) || 0),
                    0
                  );
                  const rowTotalAr = activeArCols.reduce(
                    (acc, m) => acc + (Number(card.rows[m.rowIndex]?.notesAr?.[compo]) || 0),
                    0
                  );
                  const displayedTotal = rowTotalFr + rowTotalAr;
                  const displayedMoy =
                    totalMaxCombined > 0
                      ? Number(((displayedTotal / totalMaxCombined) * 10).toFixed(2))
                      : 0;
                  const displayedRank =
                    gridLangFilter === "FR"
                      ? card.summary.rankFr?.[compo]
                      : gridLangFilter === "AR"
                      ? card.summary.rankAr?.[compo]
                      : card.summary.rankGen?.[compo];

                  return (
                    <tr
                      key={sid}
                      className={cn(
                        "border-b border-slate-300 transition-colors",
                        isAbsent ? "bg-rose-50/60 opacity-65" : idx % 2 === 1 ? "bg-slate-50/70" : "bg-white"
                      )}
                    >
                      <td className="border-r border-slate-400 p-1.5 text-center font-mono font-bold text-slate-600">
                        {idx + 1}
                      </td>
                      <td className="border-r border-slate-400 p-1.5 font-bold uppercase text-slate-950 pl-2">
                        {card.student.firstName} {card.student.lastName}
                      </td>
                      <td className={cn(
                        "border-r border-slate-400 p-1 text-center font-black",
                        card.student.gender === "F" ? "text-pink-700" : "text-slate-800"
                      )}>
                        {card.student.gender || "M"}
                      </td>
                      <td className="border-r-2 border-slate-800 p-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePresence(sid, compo)}
                          title="Cliquer pour basculer Présent (P) / Absent (A)"
                          className={cn(
                            "w-7 h-6 rounded font-black text-xs inline-flex items-center justify-center border shadow-2xs transition-all",
                            pres === "P"
                              ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
                              : "bg-rose-600 text-white border-rose-700 hover:bg-rose-700"
                          )}
                        >
                          {pres}
                        </button>
                      </td>

                      {/* Cellules Matières Français */}
                      {activeFrCols.map((m) => {
                        const max = classConfig.ponderations?.[m.rowIndex]?.maxFr?.[compo] ?? m.defaultFr;
                        const val = card.rows[m.rowIndex]?.notesFr?.[compo] ?? 0;
                        return (
                          <td key={`cell-fr-${sid}-${m.rowIndex}`} className="border-r border-slate-300 p-1 text-center">
                            {isAbsent ? (
                              <span className="text-[10px] font-bold text-rose-500">ABS</span>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                max={max}
                                step={0.5}
                                value={val}
                                onChange={(e) => {
                                  const num = Math.max(0, Math.min(max, Number(e.target.value) || 0));
                                  handleSheetCellChange(sid, m.rowIndex, "notesFr", compo, num);
                                }}
                                className="w-12 px-1 py-0.5 text-center font-mono font-bold text-xs bg-white border border-slate-300 rounded focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                              />
                            )}
                          </td>
                        );
                      })}

                      {/* Cellules Matières Arabe */}
                      {activeArCols.map((m) => {
                        const max = classConfig.ponderations?.[m.rowIndex]?.maxAr?.[compo] ?? m.defaultAr;
                        const val = card.rows[m.rowIndex]?.notesAr?.[compo] ?? 0;
                        return (
                          <td key={`cell-ar-${sid}-${m.rowIndex}`} className="border-r border-slate-300 p-1 text-center bg-teal-50/20">
                            {isAbsent ? (
                              <span className="text-[10px] font-bold text-rose-500">ABS</span>
                            ) : (
                              <input
                                type="number"
                                min={0}
                                max={max}
                                step={0.5}
                                value={val}
                                onChange={(e) => {
                                  const num = Math.max(0, Math.min(max, Number(e.target.value) || 0));
                                  handleSheetCellChange(sid, m.rowIndex, "notesAr", compo, num);
                                }}
                                className="w-12 px-1 py-0.5 text-center font-mono font-bold text-xs bg-white border border-slate-300 rounded focus:border-teal-600 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                              />
                            )}
                          </td>
                        );
                      })}

                      {/* TOTAL / MOYENNE / RANG du Trimestre */}
                      <td className="border-r border-slate-400 p-1.5 text-center font-mono font-black text-blue-700 bg-amber-50/40">
                        {isAbsent ? "—" : displayedTotal}
                      </td>
                      <td className="border-r border-slate-400 p-1.5 text-center font-mono font-black text-slate-950 bg-amber-50/40">
                        {isAbsent ? "—" : displayedMoy.toFixed(2)}
                      </td>
                      <td className="border-r-2 border-slate-800 p-1.5 text-center font-mono font-black text-slate-900 bg-amber-50/40">
                        {isAbsent ? "ABS" : displayedRank}
                      </td>

                      {/* Colonnes Bilan Annuel (uniquement sur Trimestre 3) */}
                      {compo === "c3" && (
                        <>
                          <td className="border-r border-slate-400 p-1 text-center font-mono text-slate-700 bg-[#fdf4eb]/60">
                            {card.summary.moyGen?.c1?.toFixed(2)}
                          </td>
                          <td className="border-r border-slate-400 p-1 text-center font-mono text-slate-700 bg-[#fdf4eb]/60">
                            {card.summary.moyGen?.c2?.toFixed(2)}
                          </td>
                          <td className="border-r border-slate-400 p-1 text-center font-mono text-slate-700 bg-[#fdf4eb]/60">
                            {card.summary.moyGen?.c3?.toFixed(2)}
                          </td>
                          <td className="border-r border-slate-400 p-1 text-center font-mono font-black text-emerald-950 bg-amber-100/60">
                            {card.summary.annual?.moyenne?.toFixed(2)}
                          </td>
                          <td className="border-r border-slate-400 p-1 text-center font-mono font-black text-slate-950 bg-amber-100/60">
                            {card.summary.annual?.rank}
                          </td>
                          <td className="p-1 text-center font-black bg-amber-100/60">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] uppercase",
                              card.summary.annual?.isPassing
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : "bg-rose-100 text-rose-800 border border-rose-300"
                            )}>
                              {card.summary.annual?.decisionFr || "Passe"}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full overflow-hidden pb-10">
      
      {/* EN-TÊTE PRINCIPAL + SÉLECTEUR DE CLASSE PERMANENT */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border/50 pb-4 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              Système GEC • École {classConfig.schoolName || "Pathé Pogne"}
            </span>
            <span className="text-[11px] text-muted-foreground font-semibold">
              • Année {classConfig.schoolYear || "2025-2026"} • IA {classConfig.ia || "SANGALKAM"}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>Gestion des Évaluations & Bulletins Bilingues</span>
          </h1>
        </div>

        {/* Sélecteur de Classe Global (CI-CP, CE1-CE2, CM1-CM2) */}
        <div className="flex items-center gap-2 bg-card p-2 rounded-xl border-2 border-emerald-600/40 shadow-xs">
          <span className="text-xs font-black uppercase px-2 text-emerald-800 dark:text-emerald-300">
            Classe active :
          </span>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-1.5 text-xs sm:text-sm font-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.students?.length || 0} élèves)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BARRE D'ONGLETS STYLE CLASSEUR EXCEL GEC (6 FEUILLES) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("PARAMETRES")}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 border",
            activeTab === "PARAMETRES"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-card text-muted-foreground border-border hover:bg-muted"
          )}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>1. Paramètres & Pondérations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("LISTE")}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 border",
            activeTab === "LISTE"
              ? "bg-blue-700 text-white border-blue-800 shadow-sm"
              : "bg-card text-muted-foreground border-border hover:bg-muted"
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>2. Liste ({classReportCards.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("TRIMESTRE_1")}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 border",
            activeTab === "TRIMESTRE_1"
              ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm"
              : "bg-card text-muted-foreground border-border hover:bg-muted"
          )}
        >
          <Table2 className="w-3.5 h-3.5" />
          <span>3. Semestre 1</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("TRIMESTRE_2")}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 border",
            activeTab === "TRIMESTRE_2"
              ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm"
              : "bg-card text-muted-foreground border-border hover:bg-muted"
          )}
        >
          <Table2 className="w-3.5 h-3.5" />
          <span>4. Semestre 2</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("TRIMESTRE_3")}
          className={cn(
            "px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 border",
            activeTab === "TRIMESTRE_3"
              ? "bg-amber-500 text-slate-950 border-amber-600 shadow-sm"
              : "bg-card text-muted-foreground border-border hover:bg-muted"
          )}
        >
          <Table2 className="w-3.5 h-3.5" />
          <span>5. Semestre 3 (Bilan)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("BULLETINS")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 border",
            activeTab === "BULLETINS"
              ? "bg-emerald-600 text-white border-emerald-700 shadow-md"
              : "bg-card text-muted-foreground border-border hover:bg-muted"
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>6. Bulletins Officiels</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* FEUILLE 1 : PARAMÈTRES DE PERSONNALISATION & PONDÉRATIONS (Captures 5 & 7) */}
      {/* ===================================================================== */}
      {activeTab === "PARAMETRES" && (
        <div className="space-y-6">
          
          {/* BLOC A : PARAMÈTRES DE PERSONNALISATION (Capture 7) */}
          <div className="bg-card border-2 border-slate-800 rounded-2xl overflow-hidden shadow-md">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400" />
                <h2 className="font-black uppercase tracking-wider text-sm sm:text-base">
                  PARAMÈTRES DE PERSONNALISATION — CLASSE DE {selectedClass?.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSavingConfig}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              >
                {isSavingConfig ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Enregistrer</span>
              </button>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/40 p-2.5 rounded-lg border border-border gap-2">
                <label className="font-black uppercase text-xs text-slate-700 dark:text-slate-300">Année scolaire :</label>
                <input
                  type="text"
                  value={classConfig.schoolYear || ""}
                  onChange={(e) => setClassConfig({ ...classConfig, schoolYear: e.target.value })}
                  className="sm:w-60 bg-background border border-slate-400 rounded px-3 py-1.5 font-bold"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/40 p-2.5 rounded-lg border border-border gap-2">
                <label className="font-black uppercase text-xs text-slate-700 dark:text-slate-300">École :</label>
                <input
                  type="text"
                  value={classConfig.schoolName || ""}
                  onChange={(e) => setClassConfig({ ...classConfig, schoolName: e.target.value })}
                  className="sm:w-60 bg-background border border-slate-400 rounded px-3 py-1.5 font-bold uppercase"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/40 p-2.5 rounded-lg border border-border gap-2">
                <label className="font-black uppercase text-xs text-slate-700 dark:text-slate-300">Inspection d'Académie (IA) :</label>
                <input
                  type="text"
                  value={classConfig.ia || ""}
                  onChange={(e) => setClassConfig({ ...classConfig, ia: e.target.value })}
                  className="sm:w-60 bg-background border border-slate-400 rounded px-3 py-1.5 font-bold uppercase"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/40 p-2.5 rounded-lg border border-border gap-2">
                <label className="font-black uppercase text-xs text-slate-700 dark:text-slate-300">Inspection (IEF) :</label>
                <input
                  type="text"
                  value={classConfig.ief || ""}
                  onChange={(e) => setClassConfig({ ...classConfig, ief: e.target.value })}
                  className="sm:w-60 bg-background border border-slate-400 rounded px-3 py-1.5 font-bold uppercase"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/40 p-2.5 rounded-lg border border-border gap-2">
                <label className="font-black uppercase text-xs text-slate-700 dark:text-slate-300">Prénoms & Nom Directeur(trice) :</label>
                <input
                  type="text"
                  value={classConfig.directorName || ""}
                  onChange={(e) => setClassConfig({ ...classConfig, directorName: e.target.value })}
                  className="sm:w-60 bg-background border border-slate-400 rounded px-3 py-1.5 font-bold uppercase"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/40 p-2.5 rounded-lg border border-border gap-2">
                <label className="font-black uppercase text-xs text-slate-700 dark:text-slate-300">Civilité Directeur(trice) :</label>
                <select
                  value={classConfig.directorCivility || "Monsieur"}
                  onChange={(e) => setClassConfig({ ...classConfig, directorCivility: e.target.value })}
                  className="sm:w-60 bg-background border border-slate-400 rounded px-3 py-1.5 font-bold"
                >
                  <option value="Monsieur">Monsieur</option>
                  <option value="Madame">Madame</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/40 p-2.5 rounded-lg border border-border gap-2">
                <label className="font-black uppercase text-xs text-slate-700 dark:text-slate-300">Prénoms & Nom Enseignant(e) :</label>
                <input
                  type="text"
                  value={classConfig.teacherFrName || ""}
                  onChange={(e) => setClassConfig({ ...classConfig, teacherFrName: e.target.value })}
                  className="sm:w-60 bg-background border border-slate-400 rounded px-3 py-1.5 font-bold uppercase"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-muted/40 p-2.5 rounded-lg border border-border gap-2">
                <label className="font-black uppercase text-xs text-slate-700 dark:text-slate-300">Moyenne de passage (/10) :</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  step={0.25}
                  value={classConfig.passingThreshold ?? 5.0}
                  onChange={(e) => setClassConfig({ ...classConfig, passingThreshold: Number(e.target.value) || 5.0 })}
                  className="sm:w-60 bg-background border border-slate-400 rounded px-3 py-1.5 font-mono font-black text-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* BLOC B : PARAMÈTRES DES PONDÉRATIONS DES 3 TRIMESTRES (Capture 5) */}
          <div className="bg-card border-2 border-slate-800 rounded-2xl overflow-hidden shadow-md">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h2 className="font-black uppercase tracking-wider text-sm sm:text-base">
                  PARAMÈTRES DES PONDÉRATIONS (BARÈMES « NOTE SUR » PAR TRIMESTRE)
                </h2>
              </div>
              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={isSavingConfig}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Appliquer les Barèmes</span>
              </button>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
              {(["c1", "c2", "c3"] as const).map((compo, tIdx) => {
                const title =
                  tIdx === 0 ? "SEMESTRE 1" : tIdx === 1 ? "SEMESTRE 2" : "SEMESTRE 3";
                const headerColor =
                  tIdx === 0 ? "bg-[#dce79c]" : tIdx === 1 ? "bg-[#f3e5ab]" : "bg-[#f5d5c6]";

                const sumFr = OFFICIAL_SUBJECT_METAS.reduce(
                  (acc, m) => acc + Number(classConfig.ponderations?.[m.rowIndex]?.maxFr?.[compo] ?? m.defaultFr),
                  0
                );
                const sumAr = OFFICIAL_SUBJECT_METAS.reduce(
                  (acc, m) => acc + (m.hasAr ? Number(classConfig.ponderations?.[m.rowIndex]?.maxAr?.[compo] ?? m.defaultAr) : 0),
                  0
                );

                return (
                  <div key={compo} className="border-2 border-slate-800 rounded-xl overflow-hidden bg-white text-slate-950">
                    <div className={cn("p-2 text-center font-black uppercase text-xs border-b-2 border-slate-800", headerColor)}>
                      {title}
                    </div>
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-white font-bold text-[10px] uppercase">
                          <th className="p-1.5 w-8 text-center">N°</th>
                          <th className="p-1.5 text-left">Matières (Fr & Ar)</th>
                          <th className="p-1.5 w-16 text-center">Note Fr</th>
                          <th className="p-1.5 w-16 text-center">Note Ar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {OFFICIAL_SUBJECT_METAS.map((m, idx) => {
                          const valFr = classConfig.ponderations?.[idx]?.maxFr?.[compo] ?? m.defaultFr;
                          const valAr = classConfig.ponderations?.[idx]?.maxAr?.[compo] ?? m.defaultAr;
                          return (
                            <tr key={idx} className="border-b border-slate-300 hover:bg-slate-50">
                              <td className="p-1.5 text-center font-mono font-bold bg-slate-100 border-r border-slate-300">
                                {idx + 1}
                              </td>
                              <td className="p-1.5 font-bold border-r border-slate-300 leading-tight">
                                <div>{m.shortFr}</div>
                                {m.hasAr && <div className="text-[10px] text-teal-800 font-arabic">{m.shortAr}</div>}
                              </td>
                              <td className="p-1 text-center border-r border-slate-300 bg-amber-50/40">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={valFr}
                                  onChange={(e) => handlePonderationChange(idx, "maxFr", compo, Number(e.target.value))}
                                  className="w-12 px-1 py-0.5 text-center font-mono font-black bg-white border border-slate-400 rounded"
                                />
                              </td>
                              <td className="p-1 text-center bg-teal-50/40">
                                {m.hasAr ? (
                                  <input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={valAr}
                                    onChange={(e) => handlePonderationChange(idx, "maxAr", compo, Number(e.target.value))}
                                    className="w-12 px-1 py-0.5 text-center font-mono font-black bg-white border border-slate-400 rounded"
                                  />
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-slate-100 font-black text-xs border-t-2 border-slate-800">
                          <td colSpan={2} className="p-2 text-right pr-3 uppercase">Total Barème :</td>
                          <td className="p-2 text-center font-mono text-emerald-800">{sumFr} pts</td>
                          <td className="p-2 text-center font-mono text-teal-800">{sumAr} pts</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* FEUILLE 2 : LISTE NOMINATIVE DE LA CLASSE (Capture 8)                  */}
      {/* ===================================================================== */}
      {activeTab === "LISTE" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Tableau Liste Nominative (8 colonnes) */}
          <div className="lg:col-span-8 bg-white text-slate-950 border-2 border-slate-900 rounded-2xl overflow-hidden shadow-md">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h2 className="font-black uppercase tracking-wider text-sm sm:text-base">
                LISTE NOMINATIVE — {selectedClass?.name} ({classReportCards.length} élèves)
              </h2>
              <div className="text-xs font-mono">
                G : {classReportCards.filter(c => c.student.gender !== "F").length} | F : {classReportCards.filter(c => c.student.gender === "F").length}
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-blue-700 text-white font-black uppercase text-xs">
                    <th className="p-2.5 w-12 text-center border-r border-blue-600">N°</th>
                    <th className="p-2.5 text-left border-r border-blue-600">PRÉNOMS</th>
                    <th className="p-2.5 text-left border-r border-blue-600">NOM</th>
                    <th className="p-2.5 w-20 text-center border-r border-blue-600">SEXE</th>
                    <th className="p-2.5 w-28 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {classReportCards.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                        Aucun élève enregistré dans cette classe. Utilisez le formulaire à droite pour ajouter vos élèves.
                      </td>
                    </tr>
                  ) : (
                    classReportCards.map((c, idx) => {
                      const st = c.student;
                      const isEditingRow = editingStudentId === st.id;
                      return (
                        <tr key={st.id} className={cn("border-b border-slate-300", idx % 2 === 1 ? "bg-slate-50" : "bg-white")}>
                          <td className="p-2 text-center font-mono font-bold text-slate-600 border-r border-slate-300 bg-blue-50/40">
                            {idx + 1}
                          </td>
                          <td className="p-2 font-bold uppercase border-r border-slate-300">
                            {isEditingRow ? (
                              <input
                                type="text"
                                value={editFirstName}
                                onChange={(e) => setEditFirstName(e.target.value)}
                                className="w-full border border-blue-600 rounded px-2 py-1 text-xs font-bold"
                              />
                            ) : (
                              st.firstName
                            )}
                          </td>
                          <td className="p-2 font-black uppercase border-r border-slate-300">
                            {isEditingRow ? (
                              <input
                                type="text"
                                value={editLastName}
                                onChange={(e) => setEditLastName(e.target.value)}
                                className="w-full border border-blue-600 rounded px-2 py-1 text-xs font-bold uppercase"
                              />
                            ) : (
                              st.lastName
                            )}
                          </td>
                          <td className="p-2 text-center font-black italic border-r border-slate-300">
                            {isEditingRow ? (
                              <select
                                value={editGender}
                                onChange={(e) => setEditGender(e.target.value as "M" | "F")}
                                className="border border-blue-600 rounded px-1.5 py-1 text-xs font-bold"
                              >
                                <option value="M">M</option>
                                <option value="F">F</option>
                              </select>
                            ) : (
                              <span className={st.gender === "F" ? "text-pink-700" : "text-slate-900"}>
                                {st.gender || "M"}
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {isEditingRow ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEditStudent(st.id)}
                                  className="bg-emerald-600 text-white px-2 py-1 rounded text-[10px] font-black uppercase"
                                >
                                  OK
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingStudentId(null)}
                                  className="bg-slate-300 text-slate-800 px-2 py-1 rounded text-[10px] font-bold"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingStudentId(st.id);
                                    setEditFirstName(st.firstName);
                                    setEditLastName(st.lastName);
                                    setEditGender(st.gender === "F" ? "F" : "M");
                                  }}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  title="Modifier"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStudentFromList(st.id, `${st.firstName} ${st.lastName}`)}
                                  className="text-rose-600 hover:text-rose-800 p-1"
                                  title="Retirer de la liste"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Formulaire "AJOUTER UN ÉLÈVE" + Instructions GEC (4 colonnes) */}
          <div className="lg:col-span-4 space-y-4">
            <form onSubmit={handleAddStudentToList} className="bg-card border-2 border-blue-700 rounded-2xl p-5 shadow-md space-y-4">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-black uppercase text-sm border-b pb-2">
                <UserPlus className="w-5 h-5" />
                <span>Ajouter un Élève ({selectedClass?.name})</span>
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-muted-foreground block mb-1">Prénoms *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: MOUHAMED SAHIR"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-muted-foreground block mb-1">Nom *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: DIEYE"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-black uppercase text-muted-foreground block mb-1">Sexe (M / F) *</label>
                <select
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value as "M" | "F")}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="M">M (Garçon)</option>
                  <option value="F">F (Fille)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isAddingStudent}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                {isAddingStudent ? <Clock className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>Ajouter à la Liste Nominative</span>
              </button>
            </form>

            {/* Encadré d'information fidèle à la Capture 8 */}
            <div className="bg-[#f8f3d4] border-2 border-amber-600 rounded-xl p-4 text-slate-900 text-xs space-y-2">
              <div className="bg-rose-600 text-white font-black uppercase text-center py-1 rounded text-[11px]">
                FONCTIONNEMENT DE LA LISTE PERMANENTE
              </div>
              <p className="leading-relaxed font-medium">
                <strong>1. Saisie unique :</strong> Les élèves inscrits dans cette liste nominative pour la classe <strong>{selectedClass?.name}</strong> sont automatiquement reportés sur le <strong>1er Trimestre</strong>, le <strong>2ème Trimestre</strong>, le <strong>3ème Trimestre</strong> et les <strong>Bulletins</strong>.
              </p>
              <p className="leading-relaxed font-medium">
                <strong>2. Ajout en cours d'année :</strong> Si un nouvel élève rejoint la classe au 2e ou 3e trimestre, ajoutez-le simplement ci-dessus. S'il était absent à un trimestre précédent, cochez <strong>« A » (Absent)</strong> sur la feuille de ce trimestre.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ===================================================================== */}
      {/* FEUILLES 3, 4, 5 : ÉVALUATIONS TRIMESTRIELLES (Captures 1, 3, 6)       */}
      {/* ===================================================================== */}
      {activeTab === "TRIMESTRE_1" && renderTrimesterEvaluationSheet("c1")}
      {activeTab === "TRIMESTRE_2" && renderTrimesterEvaluationSheet("c2")}
      {activeTab === "TRIMESTRE_3" && renderTrimesterEvaluationSheet("c3")}

      {/* ===================================================================== */}
      {/* FEUILLE 6 : BULLETINS OFFICIELS BILINGUES (Captures 2, 4 + Photo)      */}
      {/* ===================================================================== */}
      {activeTab === "BULLETINS" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* PANNEAU LATÉRAL GAUCHE STYLE GEC (Captures 2 & 4) */}
          <div className="lg:col-span-3 bg-[#9e5439] text-white rounded-2xl p-4 shadow-lg space-y-4 print:hidden">
            <div className="text-center border-b border-white/20 pb-3">
              <div className="text-xs font-black uppercase tracking-widest text-amber-200">Panneau de Contrôle</div>
              <div className="text-base font-black uppercase mt-0.5">Bulletins — {selectedClass?.name}</div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase block text-amber-100">
                Choisir un semestre
              </label>
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="w-full bg-white text-slate-950 rounded-lg px-3 py-2 text-xs font-black focus:outline-none"
              >
                {TERMS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.labelFr}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase block text-amber-100">
                Choisir un élève
              </label>
              <select
                value={activeStudentCard?.student?.id || ""}
                onChange={(e) => {
                  setReportStudentId(e.target.value);
                  setIsClassReport(false);
                }}
                className="w-full bg-white text-slate-950 rounded-lg px-3 py-2 text-xs font-black focus:outline-none"
              >
                {classReportCards.map((c, idx) => (
                  <option key={c.student.id} value={c.student.id}>
                    {idx + 1}. {c.student.firstName} {c.student.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* 4 Boutons d'Impression & PDF style GEC (Captures 2 & 4) */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsClassReport(false);
                  setTimeout(() => window.print(), 150);
                }}
                className="w-full bg-[#f3e19c] hover:bg-[#f7e9b3] text-slate-950 font-black text-xs py-2.5 px-3 rounded-lg shadow border border-amber-900/30 transition-all"
              >
                Imprimer un bulletin
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsClassReport(true);
                  setTimeout(() => window.print(), 300);
                }}
                className="w-full bg-[#f5ab52] hover:bg-[#f7b96e] text-slate-950 font-black text-xs py-2.5 px-3 rounded-lg shadow border border-amber-900/30 transition-all"
              >
                Imprimer tous les bulletins ({classReportCards.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsClassReport(false);
                  toast.info("Sélectionnez « Enregistrer au format PDF » dans la fenêtre d'impression.");
                  setTimeout(() => window.print(), 200);
                }}
                className="w-full bg-[#9ce682] hover:bg-[#b0ee9a] text-slate-950 font-black text-xs py-2.5 px-3 rounded-lg shadow border border-emerald-900/30 transition-all"
              >
                Rendu PDF un bulletin
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsClassReport(true);
                  toast.info("Sélectionnez « Enregistrer au format PDF » pour exporter toute la classe.");
                  setTimeout(() => window.print(), 300);
                }}
                className="w-full bg-[#2cf516] hover:bg-[#52f740] text-slate-950 font-black text-xs py-2.5 px-3 rounded-lg shadow border border-emerald-900/30 transition-all"
              >
                Rendu PDF tous les bulletins
              </button>
            </div>

            {/* Options supplémentaires : Saisie directe & Couleur du papier */}
            <div className="pt-3 border-t border-white/20 space-y-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingReport(!isEditingReport)}
                  className={cn(
                    "flex-1 py-2 px-2 rounded-lg text-[11px] font-black uppercase flex items-center justify-center gap-1 transition-all",
                    isEditingReport ? "bg-amber-400 text-slate-950" : "bg-white/15 text-white hover:bg-white/25"
                  )}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingReport ? "Mode Saisie Actif" : "Modifier Notes"}</span>
                </button>
                {isEditingReport && (
                  <button
                    type="button"
                    onClick={handleSaveSingleBulletin}
                    disabled={isSavingReport}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[11px] uppercase py-2 px-3 rounded-lg"
                  >
                    Sauver
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-100">Papier :</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setIsGreenPaper(true)}
                    className={cn(
                      "px-2 py-1 rounded text-[10px] font-black",
                      isGreenPaper ? "bg-[#cbf3d2] text-slate-950" : "bg-white/10 text-white"
                    )}
                  >
                    🟢 Vert Menthe
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsGreenPaper(false)}
                    className={cn(
                      "px-2 py-1 rounded text-[10px] font-black",
                      !isGreenPaper ? "bg-white text-slate-950" : "bg-white/10 text-white"
                    )}
                  >
                    ⚪ Blanc
                  </button>
                </div>
              </div>

              {/* Navigation Précédent / Suivant */}
              {!isClassReport && classReportCards.length > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    disabled={currentStudentIndex <= 0}
                    onClick={() => {
                      const prev = classReportCards[currentStudentIndex - 1];
                      if (prev) setReportStudentId(prev.student.id);
                    }}
                    className="bg-white/15 hover:bg-white/25 disabled:opacity-40 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Préc.
                  </button>
                  <span className="text-xs font-mono font-bold">
                    {currentStudentIndex + 1} / {classReportCards.length}
                  </span>
                  <button
                    type="button"
                    disabled={currentStudentIndex >= classReportCards.length - 1}
                    onClick={() => {
                      const next = classReportCards[currentStudentIndex + 1];
                      if (next) setReportStudentId(next.student.id);
                    }}
                    className="bg-white/15 hover:bg-white/25 disabled:opacity-40 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1"
                  >
                    Suiv. <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ZONE D'APERÇU DU BULLETIN OFFICIEL (9 colonnes) */}
          <div className="lg:col-span-9 w-full">
            <style>{`
              @media print {
                @page { size: A4 portrait; margin: 8mm; }
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                header, aside, .print\\:hidden, button, nav { display: none !important; }
                .print\\:break-after { page-break-after: always; break-after: page; }
              }
            `}</style>

            {isClassReport ? (
              <div className="space-y-8">
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-3 rounded-xl flex items-center justify-between text-xs font-bold print:hidden">
                  <span>Affichage groupé des {classReportCards.length} bulletins de la classe {selectedClass?.name}</span>
                  <button
                    type="button"
                    onClick={() => setIsClassReport(false)}
                    className="bg-emerald-700 text-white px-3 py-1 rounded-lg text-[11px]"
                  >
                    Revenir au bulletin individuel
                  </button>
                </div>
                {classReportCards.map((r, i) => (
                  <div key={r.student.id || i} className="w-full print:break-after mb-8 print:mb-0">
                    <OfficialReportCard
                      data={r}
                      schoolName={classConfig.schoolName}
                      reportClass={selectedClass}
                      isGreenPaper={isGreenPaper}
                      highlightPeriod={reportPeriod}
                    />
                  </div>
                ))}
              </div>
            ) : activeStudentCard ? (
              <OfficialReportCard
                data={activeStudentCard}
                schoolName={classConfig.schoolName}
                reportClass={selectedClass}
                isGreenPaper={isGreenPaper}
                isEditing={isEditingReport}
                highlightPeriod={reportPeriod}
                onNoteChange={(rIdx, field, compo, val) => {
                  handleSheetCellChange(activeStudentCard.student.id, rIdx, field, compo, val);
                }}
                onDecisionChange={handleDecisionChangeOnBulletin}
              />
            ) : (
              <div className="p-12 text-center bg-card border border-border rounded-2xl">
                <p className="text-sm font-bold text-muted-foreground">
                  Aucun élève dans cette classe. Ajoutez d'abord les élèves dans l'onglet « 2. Liste ».
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
