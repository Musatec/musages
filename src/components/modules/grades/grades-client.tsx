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
  Sparkles,
  Users
} from "lucide-react";
import { 
  getStudentReportCard, 
  getClassReportCards, 
  getClassSynthesisReport, 
  getAnnualReport,
  saveStudentReportCard,
  resetStudentReportCard,
  bulkSaveClassGrades
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

const TERMS = [
  { value: "TRIMESTRE_1", labelFr: "1ère Composition (Trimestre 1)", labelAr: "الاختبار 1 (الفصل الأول)", compoKey: "c1" },
  { value: "TRIMESTRE_2", labelFr: "2ème Composition (Trimestre 2)", labelAr: "الاختبار 2 (الفصل الثاني)", compoKey: "c2" },
  { value: "TRIMESTRE_3", labelFr: "3ème Composition & Bilan Général", labelAr: "الاختبار 3 والتقرير العام", compoKey: "c3" },
  { value: "ALL", labelFr: "Toutes les Compositions (Vue Complète)", labelAr: "كل الفصول (عرض سنوي)", compoKey: "all" },
];

const SUBJECT_OPTIONS = [
  { rowIndex: 0, lang: "fr" as const, max: 10, label: "Français - Lecture (/10)" },
  { rowIndex: 1, lang: "fr" as const, max: 40, label: "Français - Ressources LC (/40)" },
  { rowIndex: 2, lang: "fr" as const, max: 20, label: "Français - Compétence LC (/20)" },
  { rowIndex: 3, lang: "fr" as const, max: 40, label: "Mathématiques - Ressources (/40)" },
  { rowIndex: 4, lang: "fr" as const, max: 20, label: "Mathématiques - Compétence (/20)" },
  { rowIndex: 5, lang: "fr" as const, max: 24, label: "Découverte du Monde - Ressources (/24)" },
  { rowIndex: 6, lang: "fr" as const, max: 16, label: "Découverte du Monde - Compétence (/16)" },
  { rowIndex: 7, lang: "fr" as const, max: 24, label: "Développement Durable - Ressources (/24)" },
  { rowIndex: 8, lang: "fr" as const, max: 16, label: "Développement Durable - Compétence (/16)" },
  { rowIndex: 9, lang: "fr" as const, max: 10, label: "EPSA - Art Plastique (/10)" },
  { rowIndex: 10, lang: "fr" as const, max: 10, label: "EPSA - Edu. Musicale (/10)" },
  // Arabe
  { rowIndex: 0, lang: "ar" as const, max: 10, label: "Arabe - الموارد اللغة والتواصل (/10)" },
  { rowIndex: 1, lang: "ar" as const, max: 10, label: "Arabe - الموارد LC (/10)" },
  { rowIndex: 2, lang: "ar" as const, max: 10, label: "Arabe - الكفاءة LC (/10)" },
  { rowIndex: 3, lang: "ar" as const, max: 10, label: "Arabe - الكفاءة Math (/10)" },
  { rowIndex: 5, lang: "ar" as const, max: 10, label: "Arabe - التربية الدينية الموارد (/10)" },
  { rowIndex: 6, lang: "ar" as const, max: 10, label: "Arabe - التربية الدينية الموارد 2 (/10)" },
  { rowIndex: 7, lang: "ar" as const, max: 10, label: "Arabe - التربية الدينية الكفاءة (/10)" },
  { rowIndex: 8, lang: "ar" as const, max: 10, label: "Arabe - التربية الدينية الكفاءة 2 (/10)" },
];

// Helper to compute official report card statistics
function computeCardSummary(rows: any[]) {
  const maxTotalFr = rows.reduce((acc, r) => acc + (r.maxFr || 0), 0); // 230
  const totalC1Fr = rows.reduce((acc, r) => acc + (Number(r.notesFr?.c1) || 0), 0);
  const totalC2Fr = rows.reduce((acc, r) => acc + (Number(r.notesFr?.c2) || 0), 0);
  const totalC3Fr = rows.reduce((acc, r) => acc + (Number(r.notesFr?.c3) || 0), 0);

  const moyC1Fr = Number(((totalC1Fr / maxTotalFr) * 10).toFixed(2));
  const moyC2Fr = Number(((totalC2Fr / maxTotalFr) * 10).toFixed(2));
  const moyC3Fr = Number(((totalC3Fr / maxTotalFr) * 10).toFixed(2));

  const maxTotalAr = rows.reduce((acc, r) => acc + (r.hasAr ? (r.maxAr || 0) : 0), 0); // 80
  const totalC1Ar = rows.reduce((acc, r) => acc + (r.hasAr ? (Number(r.notesAr?.c1) || 0) : 0), 0);
  const totalC2Ar = rows.reduce((acc, r) => acc + (r.hasAr ? (Number(r.notesAr?.c2) || 0) : 0), 0);
  const totalC3Ar = rows.reduce((acc, r) => acc + (r.hasAr ? (Number(r.notesAr?.c3) || 0) : 0), 0);

  const moyC1Ar = Number(((totalC1Ar / maxTotalAr) * 10).toFixed(2));
  const moyC2Ar = Number(((totalC2Ar / maxTotalAr) * 10).toFixed(2));
  const moyC3Ar = Number(((totalC3Ar / maxTotalAr) * 10).toFixed(2));

  const maxTotalGeneral = maxTotalFr + maxTotalAr; // 310
  const totalGenC1 = totalC1Fr + totalC1Ar;
  const totalGenC2 = totalC2Fr + totalC2Ar;
  const totalGenC3 = totalC3Fr + totalC3Ar;

  const moyGenC1 = Number(((totalGenC1 / maxTotalGeneral) * 10).toFixed(2));
  const moyGenC2 = Number(((totalGenC2 / maxTotalGeneral) * 10).toFixed(2));
  const moyGenC3 = Number(((totalGenC3 / maxTotalGeneral) * 10).toFixed(2));

  const totalAnnuel = totalGenC1 + totalGenC2 + totalGenC3;
  const maxAnnuel = maxTotalGeneral * 3; // 930
  const moyAnnuelle = Number(((totalAnnuel / maxAnnuel) * 10).toFixed(2));

  const totalAnnuelFr = totalC1Fr + totalC2Fr + totalC3Fr;
  const moyAnnuelleFr = Number(((totalAnnuelFr / (maxTotalFr * 3)) * 10).toFixed(2));

  const totalAnnuelAr = totalC1Ar + totalC2Ar + totalC3Ar;
  const moyAnnuelleAr = Number(((totalAnnuelAr / (maxTotalAr * 3)) * 10).toFixed(2));

  const isPassing = moyAnnuelle >= 5.0;

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
  } else if (moyAnnuelle >= 5.0) {
    appreciation = "Travail passable, doit progresser";
    appreciationAr = "مقبول، ينبغي بذل المزيد";
  } else {
    appreciation = "Insuffisant, redoublement proposé";
    appreciationAr = "ضعيف، إعادة السنة";
  }

  return {
    maxTotalFr,
    maxTotalAr,
    maxTotalGeneral,
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
  const className = student.class?.name || reportClass?.name || "CE1";

  // Check if each column is visible depending on the selected composition
  const isColVisible = (compo: "c1" | "c2" | "c3") => {
    if (highlightPeriod === "TRIMESTRE_1") return compo === "c1";
    if (highlightPeriod === "TRIMESTRE_2") return compo === "c1" || compo === "c2";
    // For TRIMESTRE_3 or ALL
    return true;
  };

  // Only the 3rd composition or full annual view includes the General Annual Report
  const isAnnualVisible = highlightPeriod === "TRIMESTRE_3" || highlightPeriod === "ALL";

  const renderCell = (rIdx: number, field: "notesFr" | "notesAr", compo: "c1" | "c2" | "c3", max: number, hasVal: boolean) => {
    if (!hasVal) {
      return <span className="text-slate-400 font-bold">—</span>;
    }

    if (!isColVisible(compo)) {
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
            className="w-10 px-1 py-0.5 text-center font-mono font-bold bg-white text-slate-950 border border-slate-700 rounded shadow-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none text-[11px]"
          />
          <span className="text-[9px] text-slate-600 font-bold">/{max}</span>
        </div>
      );
    }

    return (
      <span className="font-mono font-bold text-slate-950 transition-all">
        {currentVal} <span className="text-[9px] text-slate-600 font-normal">/{max}</span>
      </span>
    );
  };

  return (
    <div className={cn(
      "p-6 md:p-8 rounded-xl shadow-xl mx-auto w-full max-w-[950px] border border-slate-400 font-sans relative text-slate-950 print:border-none print:shadow-none print:p-2 print:max-w-none print:m-0",
      isGreenPaper ? "bg-[#cbf3d2] text-[#051c0d]" : "bg-white text-slate-950"
    )}>
      
      {/* 1. EN-TÊTE OFFICIEL BILINGUE */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2 text-xs font-bold leading-tight uppercase">
        <div className="space-y-0.5">
          <p className="tracking-wide">IA: {data.ia || "PIKINE-GUEDIAWAYE"}</p>
          <p className="tracking-wide">IEF: {data.ief || "KEUR MASSAR"} ECOLE FRANCO ARABE: {schoolName?.toUpperCase() || "PATHÉ POGNE"}</p>
        </div>
        <div className="sm:text-right space-y-0.5 font-bold">
          <p className="tracking-wide">ANNÉE SCOLAIRE : {data.schoolYear || "2025.../2026..."}</p>
          <p className="tracking-wide">CLASSE : .........<span className="font-black text-sm underline">{className}</span>.........</p>
        </div>
      </div>

      {/* 2. TITRE DU DOCUMENT */}
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-1 mb-2">
        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-950">
            BULLETIN DE NOTES
          </h1>
          {highlightPeriod === "TRIMESTRE_1" && (
            <span className="text-[10px] font-black bg-emerald-800 text-white px-2 py-0.5 rounded uppercase">
              1ère Composition
            </span>
          )}
          {highlightPeriod === "TRIMESTRE_2" && (
            <span className="text-[10px] font-black bg-blue-800 text-white px-2 py-0.5 rounded uppercase">
              2ème Composition
            </span>
          )}
          {highlightPeriod === "TRIMESTRE_3" && (
            <span className="text-[10px] font-black bg-purple-800 text-white px-2 py-0.5 rounded uppercase">
              3ème Composition & Bilan Général
            </span>
          )}
        </div>
        <h1 className="text-base sm:text-lg font-black font-arabic tracking-wider text-slate-950 dir-rtl">
          كشف الدرجات
        </h1>
      </div>

      {/* 3. LIGNE DU NOM ET PRÉNOM DE L'ÉLÈVE */}
      <div className="flex items-center justify-between mb-3 text-xs sm:text-sm font-bold border-b border-slate-800 pb-2">
        <div>
          <span>PRÉNOMS : </span>
          <span className="font-black underline text-sm sm:text-base uppercase tracking-wide">
            {student.firstName || "عائشة"}
          </span>
        </div>
        <div className="text-right flex items-center gap-2">
          <span>NOM : </span>
          <span className="font-black underline text-sm sm:text-base uppercase tracking-wide">
            {student.lastName || "فال"}
          </span>
          {student.matricule && (
            <span className="font-mono text-[10px] text-slate-700 bg-white/60 px-2 py-0.5 rounded border border-slate-400">
              {student.matricule}
            </span>
          )}
        </div>
      </div>

      {/* 4. LA GRANDE GRILLE BILINGUE FRANÇAIS / ARABE (10 COLONNES) */}
      <div className="w-full overflow-x-auto border-2 border-slate-950 mb-3 bg-white/40">
        <table className="w-full min-w-[760px] border-collapse text-center text-[11px] leading-tight font-sans">
          <thead>
            {/* Ligne d'en-tête 1 */}
            <tr className="border-b-2 border-slate-950 font-black uppercase text-[10px] sm:text-[11px]">
              <th rowSpan={2} className="border-r-2 border-slate-950 p-1 w-28 bg-slate-900/5">Domaine</th>
              <th rowSpan={2} className="border-r-2 border-slate-950 p-1 w-24 bg-slate-900/5">Discipline</th>
              <th colSpan={3} className="border-r-2 border-slate-950 p-1 bg-slate-900/5">Notes</th>
              <th colSpan={3} className="border-r-2 border-slate-950 p-1 font-arabic bg-slate-900/5">الدرجات</th>
              <th rowSpan={2} className="border-r-2 border-slate-950 p-1 w-20 font-arabic bg-slate-900/5">
                <div>المجال</div>
                <div className="font-sans text-[9px] font-bold">Domaine</div>
              </th>
              <th rowSpan={2} className="p-1 w-28 font-arabic bg-slate-900/5">
                <div>المواد</div>
                <div className="font-sans text-[9px] font-bold">Disciplines</div>
              </th>
            </tr>
            {/* Ligne d'en-tête 2 */}
            <tr className="border-b-2 border-slate-950 font-bold text-[9px] sm:text-[10px]">
              <th className="border-r border-slate-950 p-1 w-12 bg-slate-900/5 font-black">1e Compo</th>
              <th className={cn("border-r border-slate-950 p-1 w-12", isColVisible("c2") ? "font-black" : "opacity-50")}>2è Compo</th>
              <th className={cn("border-r-2 border-slate-950 p-1 w-12", isColVisible("c3") ? "font-black" : "opacity-50")}>3è Compo</th>
              <th className="border-r border-slate-950 p-1 w-12 font-arabic bg-slate-900/5 font-black">الاختبار 1</th>
              <th className={cn("border-r border-slate-950 p-1 w-12 font-arabic", isColVisible("c2") ? "font-black" : "opacity-50")}>الاختبار 2</th>
              <th className={cn("border-r-2 border-slate-950 p-1 w-12 font-arabic", isColVisible("c3") ? "font-black" : "opacity-50")}>الاختبار 3</th>
            </tr>
          </thead>
          <tbody>
            {/* Row 0: Langue et Communication / Lecture */}
            <tr className="border-b border-slate-950">
              <td rowSpan={3} className="border-r-2 border-slate-950 p-1 font-extrabold text-left align-middle pl-2 bg-slate-900/5">
                Langue et<br />Communication
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Lecture</td>
              <td className="border-r border-slate-950 p-1">{renderCell(0, "notesFr", "c1", rows[0]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(0, "notesFr", "c2", rows[0]?.maxFr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(0, "notesFr", "c3", rows[0]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(0, "notesAr", "c1", rows[0]?.maxAr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(0, "notesAr", "c2", rows[0]?.maxAr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(0, "notesAr", "c3", rows[0]?.maxAr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الموارد</td>
              <td rowSpan={4} className="p-1 font-bold align-middle bg-slate-900/5 leading-snug">
                <div className="font-arabic text-sm text-slate-950">اللغة والتواصل</div>
                <div className="text-[9px] font-sans text-slate-800">Langue et Communication</div>
              </td>
            </tr>

            {/* Row 1: Ressources */}
            <tr className="border-b border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Ressources</td>
              <td className="border-r border-slate-950 p-1">{renderCell(1, "notesFr", "c1", rows[1]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(1, "notesFr", "c2", rows[1]?.maxFr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(1, "notesFr", "c3", rows[1]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(1, "notesAr", "c1", rows[1]?.maxAr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(1, "notesAr", "c2", rows[1]?.maxAr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(1, "notesAr", "c3", rows[1]?.maxAr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الموارد</td>
            </tr>

            {/* Row 2: Compétence */}
            <tr className="border-b-2 border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Compétence</td>
              <td className="border-r border-slate-950 p-1">{renderCell(2, "notesFr", "c1", rows[2]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(2, "notesFr", "c2", rows[2]?.maxFr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(2, "notesFr", "c3", rows[2]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(2, "notesAr", "c1", rows[2]?.maxAr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(2, "notesAr", "c2", rows[2]?.maxAr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(2, "notesAr", "c3", rows[2]?.maxAr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الكفاءة</td>
            </tr>

            {/* Row 3: Mathématiques / Ressources */}
            <tr className="border-b border-slate-950">
              <td rowSpan={2} className="border-r-2 border-slate-950 p-1 font-extrabold text-left align-middle pl-2 bg-slate-900/5">
                Mathématiques
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Ressources</td>
              <td className="border-r border-slate-950 p-1">{renderCell(3, "notesFr", "c1", rows[3]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(3, "notesFr", "c2", rows[3]?.maxFr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(3, "notesFr", "c3", rows[3]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(3, "notesAr", "c1", rows[3]?.maxAr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(3, "notesAr", "c2", rows[3]?.maxAr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(3, "notesAr", "c3", rows[3]?.maxAr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الكفاءة</td>
            </tr>

            {/* Row 4: Mathématiques / Compétence */}
            <tr className="border-b-2 border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Compétence</td>
              <td className="border-r border-slate-950 p-1">{renderCell(4, "notesFr", "c1", rows[4]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(4, "notesFr", "c2", rows[4]?.maxFr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(4, "notesFr", "c3", rows[4]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(4, "notesAr", "c1", 0, false)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(4, "notesAr", "c2", 0, false)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(4, "notesAr", "c3", 0, false)}</td>
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td className="p-1 text-slate-400">—</td>
            </tr>

            {/* Row 5: Découverte du Monde / Ressources */}
            <tr className="border-b border-slate-950">
              <td rowSpan={2} className="border-r-2 border-slate-950 p-1 font-extrabold text-left align-middle pl-2 bg-slate-900/5">
                Découverte du<br />Monde
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Ressources</td>
              <td className="border-r border-slate-950 p-1">{renderCell(5, "notesFr", "c1", rows[5]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(5, "notesFr", "c2", rows[5]?.maxFr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(5, "notesFr", "c3", rows[5]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(5, "notesAr", "c1", rows[5]?.maxAr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(5, "notesAr", "c2", rows[5]?.maxAr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(5, "notesAr", "c3", rows[5]?.maxAr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الموارد</td>
              <td rowSpan={4} className="p-1 font-bold align-middle bg-slate-900/5 leading-snug">
                <div className="font-arabic text-sm text-slate-950">التربية الدينية</div>
                <div className="text-[9px] font-sans text-slate-800">Éducation Religieuse</div>
              </td>
            </tr>

            {/* Row 6: Compétence */}
            <tr className="border-b-2 border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Compétence</td>
              <td className="border-r border-slate-950 p-1">{renderCell(6, "notesFr", "c1", rows[6]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(6, "notesFr", "c2", rows[6]?.maxFr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(6, "notesFr", "c3", rows[6]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(6, "notesAr", "c1", rows[6]?.maxAr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(6, "notesAr", "c2", rows[6]?.maxAr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(6, "notesAr", "c3", rows[6]?.maxAr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الموارد</td>
            </tr>

            {/* Row 7: Développement durable / Ressources */}
            <tr className="border-b border-slate-950">
              <td rowSpan={2} className="border-r-2 border-slate-950 p-1 font-extrabold text-left align-middle pl-2 bg-slate-900/5">
                Développement<br />durable
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Ressources</td>
              <td className="border-r border-slate-950 p-1">{renderCell(7, "notesFr", "c1", rows[7]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(7, "notesFr", "c2", rows[7]?.maxFr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(7, "notesFr", "c3", rows[7]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(7, "notesAr", "c1", rows[7]?.maxAr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(7, "notesAr", "c2", rows[7]?.maxAr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(7, "notesAr", "c3", rows[7]?.maxAr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الكفاءة</td>
            </tr>

            {/* Row 8: Compétence */}
            <tr className="border-b-2 border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Compétence</td>
              <td className="border-r border-slate-950 p-1">{renderCell(8, "notesFr", "c1", rows[8]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(8, "notesFr", "c2", rows[8]?.maxFr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(8, "notesFr", "c3", rows[8]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(8, "notesAr", "c1", rows[8]?.maxAr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(8, "notesAr", "c2", rows[8]?.maxAr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(8, "notesAr", "c3", rows[8]?.maxAr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الكفاءة</td>
            </tr>

            {/* Row 9: EPSA / Art Plastique */}
            <tr className="border-b border-slate-950">
              <td rowSpan={2} className="border-r-2 border-slate-950 p-1 font-extrabold text-left align-middle pl-2 bg-slate-900/5">
                EPSA
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Art Plastique</td>
              <td className="border-r border-slate-950 p-1">{renderCell(9, "notesFr", "c1", rows[9]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(9, "notesFr", "c2", rows[9]?.maxFr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(9, "notesFr", "c3", rows[9]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(9, "notesAr", "c1", 0, false)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(9, "notesAr", "c2", 0, false)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(9, "notesAr", "c3", 0, false)}</td>
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td className="p-1 text-slate-400">—</td>
            </tr>

            {/* Row 10: Edu. Musicale */}
            <tr className="border-b-2 border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Edu. Musicale</td>
              <td className="border-r border-slate-950 p-1">{renderCell(10, "notesFr", "c1", rows[10]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(10, "notesFr", "c2", rows[10]?.maxFr, true)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(10, "notesFr", "c3", rows[10]?.maxFr, true)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(10, "notesAr", "c1", 0, false)}</td>
              <td className="border-r border-slate-950 p-1">{renderCell(10, "notesAr", "c2", 0, false)}</td>
              <td className="border-r-2 border-slate-950 p-1">{renderCell(10, "notesAr", "c3", 0, false)}</td>
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td className="p-1 text-slate-400">—</td>
            </tr>

            {/* TOTAL */}
            <tr className="border-b border-slate-950 font-black text-xs bg-slate-900/10">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">TOTAL</td>
              <td className="border-r border-slate-950 p-1 font-mono font-black text-emerald-950">
                {summary.totalFr?.c1} / {summary.maxTotalFr}
              </td>
              <td className="border-r border-slate-950 p-1 font-mono">
                {isColVisible("c2") ? `${summary.totalFr?.c2} / ${summary.maxTotalFr}` : "—"}
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-mono">
                {isColVisible("c3") ? `${summary.totalFr?.c3} / ${summary.maxTotalFr}` : "—"}
              </td>
              <td className="border-r border-slate-950 p-1 font-mono font-black text-emerald-950">
                {summary.totalAr?.c1} / {summary.maxTotalAr}
              </td>
              <td className="border-r border-slate-950 p-1 font-mono">
                {isColVisible("c2") ? `${summary.totalAr?.c2} / ${summary.maxTotalAr}` : "—"}
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-mono">
                {isColVisible("c3") ? `${summary.totalAr?.c3} / ${summary.maxTotalAr}` : "—"}
              </td>
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">المجموع</td>
            </tr>

            {/* MOYENNE */}
            <tr className="border-b border-slate-950 font-black text-xs bg-slate-900/5">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">MOYENNE</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold text-emerald-900">
                {summary.moyFr?.c1} <span className="text-[9px]">/ 10</span>
              </td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">
                {isColVisible("c2") ? <>{summary.moyFr?.c2} <span className="text-[9px]">/ 10</span></> : "—"}
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">
                {isColVisible("c3") ? <>{summary.moyFr?.c3} <span className="text-[9px]">/ 10</span></> : "—"}
              </td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold text-emerald-900">
                {summary.moyAr?.c1} <span className="text-[9px]">/ 10</span>
              </td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">
                {isColVisible("c2") ? <>{summary.moyAr?.c2} <span className="text-[9px]">/ 10</span></> : "—"}
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">
                {isColVisible("c3") ? <>{summary.moyAr?.c3} <span className="text-[9px]">/ 10</span></> : "—"}
              </td>
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">المعدل</td>
            </tr>

            {/* RANG */}
            <tr className="border-b-2 border-slate-950 font-bold text-xs">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">RANG</td>
              <td className="border-r border-slate-950 p-1">{summary.rankFr?.c1}ème Élèves</td>
              <td className="border-r border-slate-950 p-1">
                {isColVisible("c2") ? `${summary.rankFr?.c2}ème Élèves` : "—"}
              </td>
              <td className="border-r-2 border-slate-950 p-1">
                {isColVisible("c3") ? `${summary.rankFr?.c3}ème Élèves` : "—"}
              </td>
              <td className="border-r border-slate-950 p-1 font-arabic">{summary.rankAr?.c1} تلميذاً</td>
              <td className="border-r border-slate-950 p-1 font-arabic">
                {isColVisible("c2") ? `${summary.rankAr?.c2} تلميذاً` : "—"}
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic">
                {isColVisible("c3") ? `${summary.rankAr?.c3} تلميذاً` : "—"}
              </td>
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">الترتيب</td>
            </tr>

            {/* TOTAL GENERAL */}
            <tr className="border-b border-slate-950 font-black text-xs bg-slate-900/10">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">TOTAL GENERAL</td>
              <td className="border-r border-slate-950 p-1 font-mono font-black text-emerald-950">{summary.totalGen?.c1}</td>
              <td className="border-r border-slate-950 p-1 font-mono">
                {isColVisible("c2") ? summary.totalGen?.c2 : "—"}
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-mono">
                {isColVisible("c3") ? summary.totalGen?.c3 : "—"}
              </td>
              <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">المجموع العام</td>
            </tr>

            {/* MOYENNE GENERALE */}
            <tr className="border-b border-slate-950 font-black text-xs bg-slate-900/5">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">MOYENNE GENERAL</td>
              <td className="border-r border-slate-950 p-1 font-mono text-emerald-950 font-black bg-emerald-600/15">
                {summary.moyGen?.c1} <span className="text-[9px]">/ 10</span>
              </td>
              <td className="border-r border-slate-950 p-1 font-mono text-emerald-950 font-black">
                {isColVisible("c2") ? <>{summary.moyGen?.c2} <span className="text-[9px]">/ 10</span></> : "—"}
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-mono text-emerald-950 font-black">
                {isColVisible("c3") ? <>{summary.moyGen?.c3} <span className="text-[9px]">/ 10</span></> : "—"}
              </td>
              <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">المعدل العام</td>
            </tr>

            {/* RANG GENERAL */}
            <tr className="border-b-2 border-slate-950 font-bold text-xs">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">RANG GENERAL</td>
              <td className="border-r border-slate-950 p-1 font-black">{summary.rankGen?.c1}ème Élèves</td>
              <td className="border-r border-slate-950 p-1">
                {isColVisible("c2") ? `${summary.rankGen?.c2}ème Élèves` : "—"}
              </td>
              <td className="border-r-2 border-slate-950 p-1">
                {isColVisible("c3") ? `${summary.rankGen?.c3}ème Élèves` : "—"}
              </td>
              <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">الترتيب العام</td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* 5. BILAN ANNUEL (BLOC DOUBLE : FRANÇAIS & ARABE) */}
      {/* Seule la 3ème composition (ou vue annuelle complète) affiche les calculs et décisions du bilan général */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs font-sans">
        
        {/* Cartouche Gauche : Bilan Annuel Français */}
        <div className="border-2 border-slate-950 p-2.5 space-y-1.5 bg-white/50">
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="font-extrabold uppercase">TOTAL ANNUELLE :</span>
            <span className="font-mono font-black text-sm">
              {isAnnualVisible ? `${summary.annual?.totalPts} pts` : "—"}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="font-extrabold uppercase">MOY. ANNUELLE :</span>
            <span className="font-mono font-black text-sm text-emerald-950">
              {isAnnualVisible ? `${summary.annual?.moyenne} / 10` : "—"}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="font-extrabold uppercase">RANG ANNUELLE :</span>
            <span className="font-black">
              {isAnnualVisible ? `${summary.annual?.rank}ème Élèves` : "—"}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="font-extrabold uppercase">Appréciations :</span>
            <span className="font-bold italic">
              {isAnnualVisible 
                ? (summary.annual?.appreciation || "Travail passable") 
                : (highlightPeriod === "TRIMESTRE_1" ? "Résultats de la 1ère composition" : "Résultats de la 2ème composition")}
            </span>
          </div>
          <div className="pt-1 flex items-center justify-between font-bold">
            <span className="uppercase font-black text-[11px]">
              Décision du conseil {isAnnualVisible ? ":" : "(fin d'année) :"}
            </span>
            <div className="flex items-center gap-4">
              <label 
                className={cn(
                  "flex items-center gap-1.5", 
                  isEditing && isAnnualVisible ? "cursor-pointer" : "cursor-default"
                )}
                onClick={() => {
                  if (isEditing && isAnnualVisible) {
                    onDecisionChange?.("Passe");
                  }
                }}
              >
                <span className={cn(
                  "w-4 h-4 border border-slate-950 flex items-center justify-center font-bold text-[10px]",
                  (isAnnualVisible && summary.annual?.isPassing) ? "bg-slate-950 text-white" : "bg-white text-transparent"
                )}>
                  {isAnnualVisible && summary.annual?.isPassing ? "✓" : ""}
                </span>
                <span>Passe</span>
              </label>
              <label 
                className={cn(
                  "flex items-center gap-1.5", 
                  isEditing && isAnnualVisible ? "cursor-pointer" : "cursor-default"
                )}
                onClick={() => {
                  if (isEditing && isAnnualVisible) {
                    onDecisionChange?.("Redouble");
                  }
                }}
              >
                <span className={cn(
                  "w-4 h-4 border border-slate-950 flex items-center justify-center font-bold text-[10px]",
                  (isAnnualVisible && !summary.annual?.isPassing) ? "bg-slate-950 text-white" : "bg-white text-transparent"
                )}>
                  {isAnnualVisible && !summary.annual?.isPassing ? "✓" : ""}
                </span>
                <span>Redouble</span>
              </label>
            </div>
          </div>
        </div>

        {/* Cartouche Droite : Bilan Annuel Arabe */}
        <div className="border-2 border-slate-950 p-2.5 space-y-1.5 dir-rtl font-arabic bg-white/50">
          <div className="flex justify-between border-b border-slate-800 pb-1 font-bold">
            <span>المجموع السنوي :</span>
            <span className="font-mono font-black text-sm font-sans">
              {isAnnualVisible ? `${summary.annual?.totalAr} / ${summary.maxTotalAr * 3}` : "—"}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1 font-bold">
            <span>المعدل السنوي :</span>
            <span className="font-mono font-black text-sm text-emerald-950 font-sans">
              {isAnnualVisible ? `${summary.annual?.moyAr} / 10` : "—"}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1 font-bold">
            <span>الترتيب السنوي :</span>
            <span>
              {isAnnualVisible ? `${summary.annual?.rank} تلميذاً` : "—"}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1 font-bold">
            <span>التقديرات :</span>
            <span className="font-bold">
              {isAnnualVisible 
                ? (summary.annual?.appreciationAr || "مستوى مقبول") 
                : (highlightPeriod === "TRIMESTRE_1" ? "نتائج الفصل الأول" : "نتائج الفصل الثاني")}
            </span>
          </div>
          <div className="pt-1 flex items-center justify-between font-bold">
            <span className="font-black text-[12px]">
              قرار مجلس المعلمين {isAnnualVisible ? ":" : "(نهاية السنة) :"}
            </span>
            <div className="flex items-center gap-4 font-sans text-xs">
              <label 
                className={cn(
                  "flex items-center gap-1.5", 
                  isEditing && isAnnualVisible ? "cursor-pointer" : "cursor-default"
                )}
                onClick={() => {
                  if (isEditing && isAnnualVisible) {
                    onDecisionChange?.("Passe");
                  }
                }}
              >
                <span className={cn(
                  "w-4 h-4 border border-slate-950 flex items-center justify-center font-bold text-[10px]",
                  (isAnnualVisible && summary.annual?.isPassing) ? "bg-slate-950 text-white" : "bg-white text-transparent"
                )}>
                  {isAnnualVisible && summary.annual?.isPassing ? "✓" : ""}
                </span>
                <span className="font-arabic">ناجح(ة)</span>
              </label>
              <label 
                className={cn(
                  "flex items-center gap-1.5", 
                  isEditing && isAnnualVisible ? "cursor-pointer" : "cursor-default"
                )}
                onClick={() => {
                  if (isEditing && isAnnualVisible) {
                    onDecisionChange?.("Redouble");
                  }
                }}
              >
                <span className={cn(
                  "w-4 h-4 border border-slate-950 flex items-center justify-center font-bold text-[10px]",
                  (isAnnualVisible && !summary.annual?.isPassing) ? "bg-slate-950 text-white" : "bg-white text-transparent"
                )}>
                  {isAnnualVisible && !summary.annual?.isPassing ? "✓" : ""}
                </span>
                <span className="font-arabic">راسب(ة)</span>
              </label>
            </div>
          </div>
        </div>

      </div>

      {/* 6. SIGNATURES OFFICIELLES (LE MAÎTRE / LE DIRECTEUR / LE PARENT) */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t-2 border-slate-950">
        
        {/* Le Maître / المعلم */}
        <div className="flex flex-col items-center justify-between h-20">
          <div className="font-black uppercase tracking-wider text-[11px]">
            <span>Le Maître</span> / <span className="font-arabic">المعلم</span>
          </div>
          <div className="font-serif italic text-slate-800 text-xs border-b border-dotted border-slate-700 w-32 pb-1">
            M. Ndiaye
          </div>
        </div>

        {/* Le Directeur / المدير avec Cachet Officiel Pathé Pogne */}
        <div className="flex flex-col items-center justify-between h-20 relative">
          <div className="font-black uppercase tracking-wider text-[11px]">
            <span>Le Directeur</span> / <span className="font-arabic">المدير</span>
          </div>
          
          {/* Cachet circulaire officiel rouge/bleu Pathé Pogne */}
          <div className="w-16 h-16 rounded-full border border-dashed border-blue-800/80 p-0.5 flex flex-col items-center justify-center text-blue-900 rotate-[-10deg] select-none opacity-85 my-auto">
            <span className="text-[6px] font-black uppercase tracking-tighter leading-none">ÉCOLE FRANCO ARABE</span>
            <span className="text-[7px] font-black uppercase tracking-tight text-center">PATHÉ POGNE</span>
            <span className="text-[5px] font-bold uppercase tracking-widest text-center">DIRECTION</span>
          </div>

          <div className="text-[10px] text-slate-700 font-semibold">
            Visa & Cachet
          </div>
        </div>

        {/* Le Parent / الولي */}
        <div className="flex flex-col items-center justify-between h-20">
          <div className="font-black uppercase tracking-wider text-[11px]">
            <span>Le parent</span> / <span className="font-arabic">الولي</span>
          </div>
          <div className="text-[10px] italic text-slate-600 border-b border-dotted border-slate-700 w-32 pb-1">
            Signature du parent
          </div>
        </div>

      </div>

    </div>
  );
};

export function GradesClient({ 
  classes, 
  subjects, 
  recentGrades: initialRecentGrades,
  schoolName: rawSchoolName
}: GradesClientProps) {
  const { activeSpace } = useSpace();
  const isSchool = activeSpace === "school";
  const schoolName = isSchool ? "École Franco-Arabe Pathé Pogne" : rawSchoolName;

  const [activeTab, setActiveTab] = useState<"BULLETINS" | "SAISIE" | "RAPPORTS">("BULLETINS");
  const [isGreenPaper, setIsGreenPaper] = useState(true);

  // Bulletin state
  const [reportClassId, setReportClassId] = useState(classes[0]?.id || "");
  const [reportStudentId, setReportStudentId] = useState(classes[0]?.students?.[0]?.id || "");
  const [reportPeriod, setReportPeriod] = useState("TRIMESTRE_1"); // Par défaut : 1ère composition uniquement
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any | null>(null);
  const [isClassReport, setIsClassReport] = useState(false);
  const [isEditingReport, setIsEditingReport] = useState(false);
  const [isSavingReport, setIsSavingReport] = useState(false);

  // Saisie en masse par classe state
  const [batchClassId, setBatchClassId] = useState(classes[0]?.id || "");
  const [batchTerm, setBatchTerm] = useState<"c1" | "c2" | "c3">("c1");
  const [batchSubjectIdx, setBatchSubjectIdx] = useState(0);
  const [batchGrades, setBatchGrades] = useState<Record<string, number>>({});
  const [isSavingBatch, setIsSavingBatch] = useState(false);

  // Rapport de synthèse state
  const [synthesisClassId, setSynthesisClassId] = useState(classes[0]?.id || "");
  const [synthesisTerm, setSynthesisTerm] = useState("TRIMESTRE_1");
  const [synthesisData, setSynthesisData] = useState<any | null>(null);
  const [isGeneratingSynthesis, setIsGeneratingSynthesis] = useState(false);

  const reportClass = classes.find(c => c.id === reportClassId) || classes[0];
  const batchClass = classes.find(c => c.id === batchClassId) || classes[0];

  // Auto-generate report card on initial load
  useEffect(() => {
    if (classes.length > 0) {
      const defaultClass = classes[0];
      setReportClassId(defaultClass.id);
      if (defaultClass.students && defaultClass.students.length > 0) {
        const firstStudent = defaultClass.students[0];
        setReportStudentId(firstStudent.id);
        getStudentReportCard(firstStudent.id, "TRIMESTRE_1").then((res) => {
          if (!res.error) {
            setReportData(res);
            setIsClassReport(false);
          }
        });
      }
    }
  }, [classes]);

  // Navigate through students in active class
  const currentStudents = reportClass?.students || [];
  const currentStudentIndex = currentStudents.findIndex((s: any) => s.id === reportStudentId);

  const handleStudentSwitch = async (sid: string) => {
    setReportStudentId(sid);
    setIsGenerating(true);
    const res = await getStudentReportCard(sid, reportPeriod);
    if (!res.error) {
      setReportData(res);
      setIsClassReport(false);
    }
    setIsGenerating(false);
  };

  const handlePreviousStudent = async () => {
    if (currentStudentIndex > 0) {
      const prevStudent = currentStudents[currentStudentIndex - 1];
      await handleStudentSwitch(prevStudent.id);
    }
  };

  const handleNextStudent = async () => {
    if (currentStudentIndex < currentStudents.length - 1) {
      const nextStudent = currentStudents[currentStudentIndex + 1];
      await handleStudentSwitch(nextStudent.id);
    }
  };

  const handleGenerateReport = async () => {
    if (!reportStudentId) {
      toast.error("Veuillez sélectionner un élève.");
      return;
    }
    setIsGenerating(true);
    toast.loading("Chargement du bulletin officiel...");
    const res = await getStudentReportCard(reportStudentId, reportPeriod);
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Bulletin officiel chargé !");
      setReportData(res);
      setIsClassReport(false);
    }
    setIsGenerating(false);
  };

  const handleGenerateClassReports = async () => {
    if (!reportClassId) {
      toast.error("Veuillez sélectionner une classe.");
      return;
    }

    setIsGenerating(true);
    toast.loading("Génération des bulletins de la classe entière...");
    const res = await getClassReportCards(reportClassId, reportPeriod);
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Bulletins générés pour ${res.reportCards?.length || 0} élèves !`);
      setReportData(res.reportCards);
      setIsClassReport(true);
    }
    setIsGenerating(false);
  };

  // Instant in-memory note update with automatic summary recalculation
  const handleNoteChange = (
    rowIndex: number, 
    field: "notesFr" | "notesAr", 
    compo: "c1" | "c2" | "c3", 
    val: number
  ) => {
    if (!reportData || !reportData.rows) return;
    const newRows = [...reportData.rows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      [field]: {
        ...newRows[rowIndex][field],
        [compo]: val,
      }
    };
    const newSummary = computeCardSummary(newRows);
    setReportData({
      ...reportData,
      rows: newRows,
      summary: {
        ...reportData.summary,
        ...newSummary,
      }
    });
  };

  // Allow manual toggle of decision (Passe / Redouble) in Mode Saisie for 3ème composition
  const handleDecisionChange = (decision: "Passe" | "Redouble") => {
    if (!reportData || !reportData.summary) return;
    setReportData({
      ...reportData,
      summary: {
        ...reportData.summary,
        annual: {
          ...reportData.summary.annual,
          isPassing: decision === "Passe",
          decisionFr: decision,
          decisionAr: decision === "Passe" ? "ناجح(ة)" : "راسب(ة)",
        }
      }
    });
  };

  const handleSaveStudentNotes = async () => {
    if (!reportStudentId || !reportData?.rows) return;
    setIsSavingReport(true);
    toast.loading("Enregistrement des notes...");
    const res = await saveStudentReportCard(reportStudentId, reportData.rows, {
      decision: reportData.summary?.annual?.decisionFr,
      appreciation: reportData.summary?.annual?.appreciation,
      appreciationAr: reportData.summary?.annual?.appreciationAr,
    });
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Notes de l'élève enregistrées avec succès !");
      setIsEditingReport(false);
    }
    setIsSavingReport(false);
  };

  const handleResetStudentNotes = async () => {
    if (!reportStudentId) return;
    if (!confirm("Voulez-vous vraiment réinitialiser les notes de cet élève aux valeurs initiales ?")) return;

    toast.loading("Réinitialisation...");
    const res = await resetStudentReportCard(reportStudentId);
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Notes réinitialisées.");
      await handleStudentSwitch(reportStudentId);
    }
  };

  // Batch grade entry for whole class
  const activeSubjectOption = SUBJECT_OPTIONS[batchSubjectIdx] || SUBJECT_OPTIONS[0];

  const handleSaveBatchGrades = async () => {
    if (!batchClass?.students?.length) {
      toast.error("Aucun élève dans cette classe.");
      return;
    }

    const updates = Object.entries(batchGrades).map(([studentId, val]) => ({
      studentId,
      rowIndex: activeSubjectOption.rowIndex,
      compo: batchTerm,
      lang: activeSubjectOption.lang,
      value: val,
    }));

    if (updates.length === 0) {
      toast.info("Aucune note modifiée à enregistrer.");
      return;
    }

    setIsSavingBatch(true);
    toast.loading("Sauvegarde des notes de la classe...");
    const res = await bulkSaveClassGrades(updates);
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message || "Notes de la classe enregistrées avec succès !");
      setBatchGrades({});
      if (reportStudentId) {
        await handleStudentSwitch(reportStudentId);
      }
    }
    setIsSavingBatch(false);
  };

  const handleGenerateSynthesisReport = async () => {
    if (!synthesisClassId) {
      toast.error("Veuillez sélectionner une classe.");
      return;
    }

    setIsGeneratingSynthesis(true);
    toast.loading("Génération du rapport...");
    let res;
    if (synthesisTerm === "BILAN_ANNUEL") {
      res = await getAnnualReport(synthesisClassId);
    } else {
      res = await getClassSynthesisReport(synthesisClassId, synthesisTerm);
    }
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Rapport généré avec succès !");
      setSynthesisData({ ...res, isAnnual: synthesisTerm === "BILAN_ANNUEL" });
    }
    setIsGeneratingSynthesis(false);
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      
      {/* EN-TÊTE DE LA SECTION DE GESTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              Espace École Pathé Pogne
            </span>
            <span className="text-xs text-muted-foreground">• Format Officiel Bilingue (Français & Arabe)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-emerald-600" />
            <span>Bulletin de Notes & كشف الدرجات</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Gestion progressive des compositions : 1ère Compo, 2ème Compo, et Bilan Général réservé à la 3ème Compo.
          </p>
        </div>

        {/* Onglets Principaux */}
        <div className="flex bg-card p-1 rounded-2xl border border-border/60 shadow-xs overflow-x-auto shrink-0">
          <button 
            onClick={() => setActiveTab("BULLETINS")}
            className={cn(
              "px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shrink-0 flex items-center gap-2",
              activeTab === "BULLETINS" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Bulletin Officiel</span>
          </button>
          <button 
            onClick={() => setActiveTab("SAISIE")}
            className={cn(
              "px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shrink-0 flex items-center gap-2",
              activeTab === "SAISIE" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Saisie par Classe (1, 2, 3)</span>
          </button>
          <button 
            onClick={() => { setActiveTab("RAPPORTS"); setSynthesisData(null); }}
            className={cn(
              "px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shrink-0 flex items-center gap-2",
              activeTab === "RAPPORTS" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Rapports & Synthèse</span>
          </button>
        </div>
      </div>

      {/* 1. ONGLET BULLETIN OFFICIEL BILINGUE */}
      {activeTab === "BULLETINS" && (
        <div className="space-y-4">
          
          {/* Barre de Contrôle Supérieure */}
          <div className="bg-card border border-border/70 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              
              {/* Sélecteur de Classe */}
              <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">
                  Classe / الصف
                </label>
                <select
                  value={reportClassId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    setReportClassId(cid);
                    const c = classes.find(x => x.id === cid);
                    if (c && c.students?.length) {
                      handleStudentSwitch(c.students[0].id);
                    }
                  }}
                  className="w-full bg-background border border-border/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.students?.length || 0} élèves)
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélecteur d'Élève */}
              <div className="lg:col-span-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">
                  Élève / التلميذ
                </label>
                <select
                  value={reportStudentId}
                  onChange={(e) => handleStudentSwitch(e.target.value)}
                  disabled={!reportClass?.students?.length}
                  className="w-full bg-background border border-border/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:opacity-50"
                >
                  {reportClass?.students?.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.lastName?.toUpperCase()} {s.firstName} ({s.matricule || "N/A"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélecteur de Période (1, 2, 3 ou Annuelle) */}
              <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">
                  Période du Bulletin
                </label>
                <select
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="w-full bg-background border border-border/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-emerald-900 dark:text-emerald-300"
                >
                  {TERMS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.labelFr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bouton Afficher / Toute la classe */}
              <div className="lg:col-span-2 flex items-center gap-2">
                <button 
                  onClick={handleGenerateReport}
                  disabled={!reportStudentId || isGenerating}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider text-[11px] py-2.5 px-3 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isGenerating && !isClassReport ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                  <span>Afficher</span>
                </button>
                <button 
                  onClick={handleGenerateClassReports}
                  disabled={!reportClassId || isGenerating}
                  title="Générer les bulletins de tous les élèves de la classe"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-wider text-[11px] py-2.5 px-3 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isGenerating && isClassReport ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Classe</span>
                </button>
              </div>

            </div>

            {/* Barre d'outils secondaire : Mode Saisie Directe, Sauvegarde, Impression */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-border/40 gap-3 text-xs">
              
              {/* Outils d'Édition directe */}
              <div className="flex items-center gap-2 flex-wrap">
                {!isClassReport && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditingReport(!isEditingReport)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 border",
                        isEditingReport 
                          ? "bg-amber-500 text-white border-amber-600 shadow-md ring-2 ring-amber-400/40" 
                          : "bg-background text-foreground border-border hover:bg-muted"
                      )}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingReport ? "Mode Saisie Actif ✏️" : "Modifier les Notes ✏️"}</span>
                    </button>

                    {isEditingReport && (
                      <button
                        type="button"
                        onClick={handleSaveStudentNotes}
                        disabled={isSavingReport}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                      >
                        {isSavingReport ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>Enregistrer les Notes</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleResetStudentNotes}
                      title="Réinitialiser les notes aux valeurs initiales"
                      className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Réinitialiser</span>
                    </button>
                  </>
                )}

                {/* Couleur Papier */}
                <div className="flex items-center gap-1.5 ml-1 border-l pl-3 border-border/60">
                  <span className="text-[10px] font-bold text-muted-foreground hidden lg:inline">Papier :</span>
                  <button
                    type="button"
                    onClick={() => setIsGreenPaper(true)}
                    className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                      isGreenPaper 
                        ? "bg-[#cbf3d2] text-[#051c0d] border-emerald-600 shadow-xs" 
                        : "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    🟢 Vert Officiel
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsGreenPaper(false)}
                    className={cn(
                      "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                      !isGreenPaper 
                        ? "bg-white text-slate-900 border-slate-400 shadow-xs" 
                        : "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    ⚪ Blanc
                  </button>
                </div>
              </div>

              {/* Navigation Élèves & Impression */}
              <div className="flex items-center gap-2 flex-wrap">
                {!isClassReport && reportData && currentStudents.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePreviousStudent}
                      disabled={currentStudentIndex <= 0 || isGenerating}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border hover:bg-muted font-bold disabled:opacity-40 transition-colors text-[11px]"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      <span>Précédent</span>
                    </button>
                    <span className="font-bold text-muted-foreground text-[11px] px-1">
                      {currentStudentIndex + 1} / {currentStudents.length}
                    </span>
                    <button
                      onClick={handleNextStudent}
                      disabled={currentStudentIndex >= currentStudents.length - 1 || isGenerating}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border hover:bg-muted font-bold disabled:opacity-40 transition-colors text-[11px]"
                    >
                      <span>Suivant</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Impression Directe */}
                <button 
                  onClick={() => window.print()} 
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-1.5 rounded-xl flex items-center gap-2 shadow-xs transition-all active:scale-95"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer (A4)</span>
                </button>
              </div>

            </div>
          </div>

          {/* Bannière Mode Saisie */}
          {isEditingReport && !isClassReport && (
            <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-600 animate-pulse" />
                <span className="font-bold">
                  Mode Saisie Directe actif : Modifiez n'importe quelle note, les totaux et moyennes se recalculent automatiquement !
                </span>
              </div>
              <button
                onClick={handleSaveStudentNotes}
                disabled={isSavingReport}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg font-black uppercase text-[10px] tracking-wider transition-all shrink-0"
              >
                Sauvegarder
              </button>
            </div>
          )}

          {/* APERÇU OFFICIEL DU BULLETIN */}
          <AnimatePresence>
            {reportData && (
              <div className="w-full relative mt-4">
                <style>{`
                  @media print {
                    @page { size: A4 portrait; margin: 8mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    header, aside, .print\\:hidden, button, nav { display: none !important; }
                    .print\\:break-after { page-break-after: always; break-after: page; }
                  }
                `}</style>

                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full space-y-8"
                >
                  {isClassReport ? (
                    (reportData as any[]).map((r, i) => (
                      <div key={i} className="w-full print:break-after mb-8 print:mb-0">
                        <OfficialReportCard 
                          data={r} 
                          schoolName={schoolName} 
                          reportClass={reportClass}
                          isGreenPaper={isGreenPaper} 
                          highlightPeriod={reportPeriod}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-full">
                      <OfficialReportCard 
                        data={reportData} 
                        schoolName={schoolName} 
                        reportClass={reportClass}
                        isGreenPaper={isGreenPaper} 
                        isEditing={isEditingReport}
                        highlightPeriod={reportPeriod}
                        onNoteChange={handleNoteChange}
                        onDecisionChange={handleDecisionChange}
                      />
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* État vide si aucune donnée */}
          {!reportData && !isGenerating && (
            <div className="p-12 text-center bg-card border border-border/50 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Aucun bulletin affiché</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Sélectionnez une classe et un élève ci-dessus puis cliquez sur "Afficher" pour visualiser le relevé officiel.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. ONGLET SAISIE RAPIDE PAR CLASSE (1, 2, 3) */}
      {activeTab === "SAISIE" && (
        <div className="space-y-6">
          <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>Saisie Rapide par Classe — Compositions 1, 2 et 3</span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Saisissez les notes de toute la classe en une seule fois pour une matière et une composition donnée.
              </p>
            </div>

            {/* Sélecteurs de Saisie Groupée */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Classe / الصف</label>
                <select 
                  value={batchClassId}
                  onChange={(e) => {
                    setBatchClassId(e.target.value);
                    setBatchGrades({});
                  }}
                  className="w-full bg-background border border-border/70 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.students?.length || 0} élèves)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Composition / Trimestre</label>
                <select 
                  value={batchTerm}
                  onChange={(e) => {
                    setBatchTerm(e.target.value as any);
                    setBatchGrades({});
                  }}
                  className="w-full bg-background border border-border/70 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-bold"
                >
                  <option value="c1">1ère Composition (الاختبار 1)</option>
                  <option value="c2">2ème Composition (الاختبار 2)</option>
                  <option value="c3">3ème Composition (الاختبار 3)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Matière & Barème</label>
                <select 
                  value={batchSubjectIdx}
                  onChange={(e) => {
                    setBatchSubjectIdx(Number(e.target.value));
                    setBatchGrades({});
                  }}
                  className="w-full bg-background border border-border/70 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-medium"
                >
                  {SUBJECT_OPTIONS.map((opt, idx) => (
                    <option key={idx} value={idx}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Grille de Saisie de Tous les Élèves */}
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs select-none">
              <div>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Classe : {batchClass?.name} • {activeSubjectOption.label} • {batchTerm.toUpperCase()}
                </span>
                <span className="ml-3 font-mono text-[11px] text-muted-foreground">
                  Barème maximum : {activeSubjectOption.max} pts
                </span>
              </div>
              <button 
                onClick={handleSaveBatchGrades}
                disabled={isSavingBatch || !batchClass?.students?.length}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[11px] tracking-wider px-4 py-1.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSavingBatch ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Enregistrer la Classe</span>
              </button>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[550px] border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-emerald-800 text-white select-none">
                    <th className="w-12 text-center p-2.5 border-r border-emerald-700">N°</th>
                    <th className="p-2.5 border-r border-emerald-700">Matricule</th>
                    <th className="p-2.5 border-r border-emerald-700">Nom & Prénom de l'Élève</th>
                    <th className="p-2.5 text-center w-48">Note / Barème ({activeSubjectOption.max} pts)</th>
                  </tr>
                </thead>
                <tbody>
                  {!batchClass?.students?.length ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                        Aucun élève inscrit dans cette classe.
                      </td>
                    </tr>
                  ) : (
                    batchClass.students.map((st: any, idx: number) => {
                      const val = batchGrades[st.id] !== undefined ? batchGrades[st.id] : "";
                      return (
                        <tr key={st.id} className={idx % 2 === 1 ? "bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200" : "bg-white dark:bg-slate-900 border-b border-slate-200"}>
                          <td className="text-center p-2.5 font-mono font-bold text-slate-400 border-r border-slate-200">{idx + 1}</td>
                          <td className="p-2.5 font-mono text-[11px] font-semibold text-slate-600 border-r border-slate-200">{st.matricule || "—"}</td>
                          <td className="p-2.5 font-bold text-slate-900 dark:text-slate-100 border-r border-slate-200">
                            {st.lastName?.toUpperCase()} {st.firstName}
                          </td>
                          <td className="p-2.5 text-center">
                            <div className="inline-flex items-center gap-1.5">
                              <input 
                                type="number"
                                min={0}
                                max={activeSubjectOption.max}
                                step={0.5}
                                placeholder="Note"
                                value={val}
                                onChange={(e) => {
                                  const num = Math.max(0, Math.min(activeSubjectOption.max, Number(e.target.value) || 0));
                                  setBatchGrades(prev => ({ ...prev, [st.id]: num }));
                                }}
                                className="w-20 px-2.5 py-1 text-center font-mono font-black text-sm bg-background border border-border/80 rounded-lg shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              />
                              <span className="font-bold text-xs text-muted-foreground">/ {activeSubjectOption.max}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {batchClass?.students?.length > 0 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                <button 
                  onClick={handleSaveBatchGrades}
                  disabled={isSavingBatch}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-wider px-5 py-2 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSavingBatch ? <Clock className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Enregistrer les notes saisies</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ONGLET RAPPORTS DE SYNTHÈSE */}
      {activeTab === "RAPPORTS" && (
        <div className="space-y-4">
          <div className="bg-card border border-border/60 p-4 rounded-xl shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Période</label>
              <select 
                value={synthesisTerm}
                onChange={(e) => setSynthesisTerm(e.target.value)}
                className="w-full bg-background border border-border/70 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="BILAN_ANNUEL" className="font-bold text-emerald-600">BILAN ANNUEL (Fin d'année)</option>
                <option value="TRIMESTRE_1">1ère Composition (Trimestre 1)</option>
                <option value="TRIMESTRE_2">2ème Composition (Trimestre 2)</option>
                <option value="TRIMESTRE_3">3ème Composition (Trimestre 3)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Classe / الصف</label>
              <select 
                value={synthesisClassId}
                onChange={(e) => setSynthesisClassId(e.target.value)}
                className="w-full bg-background border border-border/70 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleGenerateSynthesisReport}
              disabled={!synthesisClassId || isGeneratingSynthesis}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGeneratingSynthesis ? <Clock className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
              <span>Générer Synthèse</span>
            </button>
          </div>

          {synthesisData && (
            <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-black text-sm uppercase">Tableau de Synthèse des Résultats</h3>
                  <p className="text-xs text-slate-500">
                    Effectif : {synthesisData.totalStudents} élèves • Taux de passage : {synthesisData.passingRate || "N/A"}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Moyenne Classe : {synthesisData.classAverage} / 10
                </span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold">
                    <th className="p-2 text-center w-12">Rang</th>
                    <th className="p-2">Élève</th>
                    <th className="p-2 text-center">Matricule</th>
                    <th className="p-2 text-right">Moyenne / 10</th>
                    <th className="p-2 text-center">Appréciation</th>
                    <th className="p-2 text-center">Décision</th>
                  </tr>
                </thead>
                <tbody>
                  {synthesisData.ranking?.map((r: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-2 text-center font-black font-mono">{r.rank}</td>
                      <td className="p-2 font-bold">{r.studentName}</td>
                      <td className="p-2 text-center font-mono text-slate-500">{r.matricule || "—"}</td>
                      <td className="p-2 text-right font-black font-mono text-emerald-800">{r.average} / 10</td>
                      <td className="p-2 text-center italic text-slate-600">{r.appreciation || r.mention || "—"}</td>
                      <td className="p-2 text-center font-bold">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px]",
                          (r.decision === "Passe" || r.annualDecision === "Passe") ? "bg-emerald-100 text-emerald-800 font-black" : "bg-rose-100 text-rose-800 font-black"
                        )}>
                          {r.decision || r.annualDecision}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
