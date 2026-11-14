"use client";

import React, { useState, useEffect } from "react";
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
  Sparkles
} from "lucide-react";
import { addGrade, getStudentReportCard, getClassReportCards, getClassSynthesisReport, getAnnualReport } from "@/lib/actions/grades";
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
  { value: "TRIMESTRE_1", labelFr: "1er Trimestre", labelAr: "الفصل الأول" },
  { value: "TRIMESTRE_2", labelFr: "2ème Trimestre", labelAr: "الفصل الثاني" },
  { value: "TRIMESTRE_3", labelFr: "3ème Trimestre", labelAr: "الفصل الثالث" },
];

// --- Exact Reproduction of the Official Senegalese Franco-Arab Primary School Report Card ---
const OfficialReportCard = ({ 
  data, 
  schoolName, 
  reportClass,
  isGreenPaper = true 
}: { 
  data: any; 
  schoolName: string; 
  reportClass: any;
  isGreenPaper?: boolean;
}) => {
  if (!data?.rows) return null;

  const rows = data.rows || [];
  const summary = data.summary || {};
  const student = data.student || {};
  const className = student.class?.name || reportClass?.name || "CE1";

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
        <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-950">
          BULLETIN DE NOTES
        </h1>
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
        <div className="text-right">
          <span>NOM : </span>
          <span className="font-black underline text-sm sm:text-base uppercase tracking-wide">
            {student.lastName || "فال"}
          </span>
          {student.matricule && (
            <span className="ml-3 font-mono text-[10px] text-slate-700 bg-white/60 px-2 py-0.5 rounded border border-slate-400">
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
              <th className="border-r border-slate-950 p-1 w-12">1e Compo</th>
              <th className="border-r border-slate-950 p-1 w-12">2è Compo</th>
              <th className="border-r-2 border-slate-950 p-1 w-12">3è Compo</th>
              <th className="border-r border-slate-950 p-1 w-12 font-arabic">الاختبار 1</th>
              <th className="border-r border-slate-950 p-1 w-12 font-arabic">الاختبار 2</th>
              <th className="border-r-2 border-slate-950 p-1 w-12 font-arabic">الاختبار 3</th>
            </tr>
          </thead>
          <tbody>
            {/* Row 0: Langue et Communication / Lecture */}
            <tr className="border-b border-slate-950">
              <td rowSpan={3} className="border-r-2 border-slate-950 p-1 font-extrabold text-left align-middle pl-2 bg-slate-900/5">
                Langue et<br />Communication
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Lecture</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[0]?.notesFr.c1} / {rows[0]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[0]?.notesFr.c2} / {rows[0]?.maxFr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[0]?.notesFr.c3} / {rows[0]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[0]?.notesAr.c1} / {rows[0]?.maxAr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[0]?.notesAr.c2} / {rows[0]?.maxAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[0]?.notesAr.c3} / {rows[0]?.maxAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الموارد</td>
              <td rowSpan={4} className="p-1 font-bold align-middle bg-slate-900/5 leading-snug">
                <div className="font-arabic text-sm text-slate-950">اللغة والتواصل</div>
                <div className="text-[9px] font-sans text-slate-800">Langue et Communication</div>
              </td>
            </tr>

            {/* Row 1: Ressources */}
            <tr className="border-b border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Ressources</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[1]?.notesFr.c1} / {rows[1]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[1]?.notesFr.c2} / {rows[1]?.maxFr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[1]?.notesFr.c3} / {rows[1]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[1]?.notesAr.c1} / {rows[1]?.maxAr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[1]?.notesAr.c2} / {rows[1]?.maxAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[1]?.notesAr.c3} / {rows[1]?.maxAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الموارد</td>
            </tr>

            {/* Row 2: Compétence */}
            <tr className="border-b-2 border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Compétence</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[2]?.notesFr.c1} / {rows[2]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[2]?.notesFr.c2} / {rows[2]?.maxFr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[2]?.notesFr.c3} / {rows[2]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[2]?.notesAr.c1} / {rows[2]?.maxAr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[2]?.notesAr.c2} / {rows[2]?.maxAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[2]?.notesAr.c3} / {rows[2]?.maxAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الكفاءة</td>
            </tr>

            {/* Row 3: Mathématiques / Ressources */}
            <tr className="border-b border-slate-950">
              <td rowSpan={2} className="border-r-2 border-slate-950 p-1 font-extrabold text-left align-middle pl-2 bg-slate-900/5">
                Mathématiques
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Ressources</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[3]?.notesFr.c1} / {rows[3]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[3]?.notesFr.c2} / {rows[3]?.maxFr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[3]?.notesFr.c3} / {rows[3]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[3]?.notesAr.c1} / {rows[3]?.maxAr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[3]?.notesAr.c2} / {rows[3]?.maxAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[3]?.notesAr.c3} / {rows[3]?.maxAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الكفاءة</td>
            </tr>

            {/* Row 4: Mathématiques / Compétence */}
            <tr className="border-b-2 border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Compétence</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[4]?.notesFr.c1} / {rows[4]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[4]?.notesFr.c2} / {rows[4]?.maxFr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[4]?.notesFr.c3} / {rows[4]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold text-slate-400">—</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold text-slate-400">—</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold text-slate-400">—</td>
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td className="p-1 text-slate-400">—</td>
            </tr>

            {/* Row 5: Découverte du Monde / Ressources */}
            <tr className="border-b border-slate-950">
              <td rowSpan={2} className="border-r-2 border-slate-950 p-1 font-extrabold text-left align-middle pl-2 bg-slate-900/5">
                Découverte du<br />Monde
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Ressources</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[5]?.notesFr.c1} / {rows[5]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[5]?.notesFr.c2} / {rows[5]?.maxFr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[5]?.notesFr.c3} / {rows[5]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[5]?.notesAr.c1} / {rows[5]?.maxAr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[5]?.notesAr.c2} / {rows[5]?.maxAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[5]?.notesAr.c3} / {rows[5]?.maxAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الموارد</td>
              <td rowSpan={4} className="p-1 font-bold align-middle bg-slate-900/5 leading-snug">
                <div className="font-arabic text-sm text-slate-950">التربية الدينية</div>
                <div className="text-[9px] font-sans text-slate-800">Éducation Religieuse</div>
              </td>
            </tr>

            {/* Row 6: Compétence */}
            <tr className="border-b-2 border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Compétence</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[6]?.notesFr.c1} / {rows[6]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[6]?.notesFr.c2} / {rows[6]?.maxFr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[6]?.notesFr.c3} / {rows[6]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[6]?.notesAr.c1} / {rows[6]?.maxAr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[6]?.notesAr.c2} / {rows[6]?.maxAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[6]?.notesAr.c3} / {rows[6]?.maxAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الموارد</td>
            </tr>

            {/* Row 7: Développement durable / Ressources */}
            <tr className="border-b border-slate-950">
              <td rowSpan={2} className="border-r-2 border-slate-950 p-1 font-extrabold text-left align-middle pl-2 bg-slate-900/5">
                Développement<br />durable
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Ressources</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[7]?.notesFr.c1} / {rows[7]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[7]?.notesFr.c2} / {rows[7]?.maxFr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[7]?.notesFr.c3} / {rows[7]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[7]?.notesAr.c1} / {rows[7]?.maxAr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[7]?.notesAr.c2} / {rows[7]?.maxAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[7]?.notesAr.c3} / {rows[7]?.maxAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الكفاءة</td>
            </tr>

            {/* Row 8: Compétence */}
            <tr className="border-b-2 border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Compétence</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[8]?.notesFr.c1} / {rows[8]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[8]?.notesFr.c2} / {rows[8]?.maxFr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[8]?.notesFr.c3} / {rows[8]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[8]?.notesAr.c1} / {rows[8]?.maxAr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[8]?.notesAr.c2} / {rows[8]?.maxAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[8]?.notesAr.c3} / {rows[8]?.maxAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic font-bold">الكفاءة</td>
            </tr>

            {/* Row 9: EPSA / Art Plastique */}
            <tr className="border-b border-slate-950">
              <td rowSpan={2} className="border-r-2 border-slate-950 p-1 font-extrabold text-left align-middle pl-2 bg-slate-900/5">
                EPSA
              </td>
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Art Plastique</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[9]?.notesFr.c1} / {rows[9]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[9]?.notesFr.c2} / {rows[9]?.maxFr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[9]?.notesFr.c3} / {rows[9]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td className="p-1 text-slate-400">—</td>
            </tr>

            {/* Row 10: Edu. Musicale */}
            <tr className="border-b-2 border-slate-950">
              <td className="border-r-2 border-slate-950 p-1 font-semibold text-left pl-2">Edu. Musicale</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[10]?.notesFr.c1} / {rows[10]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono font-bold">{rows[10]?.notesFr.c2} / {rows[10]?.maxFr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono font-bold">{rows[10]?.notesFr.c3} / {rows[10]?.maxFr}</td>
              <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td className="p-1 text-slate-400">—</td>
            </tr>

            {/* TOTAL */}
            <tr className="border-b border-slate-950 font-black text-xs bg-slate-900/10">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">TOTAL</td>
              <td className="border-r border-slate-950 p-1 font-mono">{summary.totalFr?.c1} / {summary.maxTotalFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono">{summary.totalFr?.c2} / {summary.maxTotalFr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono">{summary.totalFr?.c3} / {summary.maxTotalFr}</td>
              <td className="border-r border-slate-950 p-1 font-mono">{summary.totalAr?.c1} / {summary.maxTotalAr}</td>
              <td className="border-r border-slate-950 p-1 font-mono">{summary.totalAr?.c2} / {summary.maxTotalAr}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono">{summary.totalAr?.c3} / {summary.maxTotalAr}</td>
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">المجموع</td>
            </tr>

            {/* MOYENNE */}
            <tr className="border-b border-slate-950 font-black text-xs bg-slate-900/5">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">MOYENNE</td>
              <td className="border-r border-slate-950 p-1 font-mono text-emerald-900 font-bold">{summary.moyFr?.c1} <span className="text-[9px]">/ 10</span></td>
              <td className="border-r border-slate-950 p-1 font-mono text-emerald-900 font-bold">{summary.moyFr?.c2} <span className="text-[9px]">/ 10</span></td>
              <td className="border-r-2 border-slate-950 p-1 font-mono text-emerald-900 font-bold">{summary.moyFr?.c3} <span className="text-[9px]">/ 10</span></td>
              <td className="border-r border-slate-950 p-1 font-mono text-emerald-900 font-bold">{summary.moyAr?.c1} <span className="text-[9px]">/ 10</span></td>
              <td className="border-r border-slate-950 p-1 font-mono text-emerald-900 font-bold">{summary.moyAr?.c2} <span className="text-[9px]">/ 10</span></td>
              <td className="border-r-2 border-slate-950 p-1 font-mono text-emerald-900 font-bold">{summary.moyAr?.c3} <span className="text-[9px]">/ 10</span></td>
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">المعدل</td>
            </tr>

            {/* RANG */}
            <tr className="border-b-2 border-slate-950 font-bold text-xs">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">RANG</td>
              <td className="border-r border-slate-950 p-1">{summary.rankFr?.c1}ème Élèves</td>
              <td className="border-r border-slate-950 p-1">{summary.rankFr?.c2}ème Élèves</td>
              <td className="border-r-2 border-slate-950 p-1">{summary.rankFr?.c3}ème Élèves</td>
              <td className="border-r border-slate-950 p-1 font-arabic">{summary.rankAr?.c1} تلميذاً</td>
              <td className="border-r border-slate-950 p-1 font-arabic">{summary.rankAr?.c2} تلميذاً</td>
              <td className="border-r-2 border-slate-950 p-1 font-arabic">{summary.rankAr?.c3} تلميذاً</td>
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">الترتيب</td>
            </tr>

            {/* TOTAL GENERAL */}
            <tr className="border-b border-slate-950 font-black text-xs bg-slate-900/10">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">TOTAL GENERAL</td>
              <td className="border-r border-slate-950 p-1 font-mono">{summary.totalGen?.c1}</td>
              <td className="border-r border-slate-950 p-1 font-mono">{summary.totalGen?.c2}</td>
              <td className="border-r-2 border-slate-950 p-1 font-mono">{summary.totalGen?.c3}</td>
              <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">المجموع العام</td>
            </tr>

            {/* MOYENNE GENERALE */}
            <tr className="border-b border-slate-950 font-black text-xs bg-slate-900/5">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">MOYENNE GENERAL</td>
              <td className="border-r border-slate-950 p-1 font-mono text-emerald-950 font-black">{summary.moyGen?.c1} <span className="text-[9px]">/ 10</span></td>
              <td className="border-r border-slate-950 p-1 font-mono text-emerald-950 font-black">{summary.moyGen?.c2} <span className="text-[9px]">/ 10</span></td>
              <td className="border-r-2 border-slate-950 p-1 font-mono text-emerald-950 font-black">{summary.moyGen?.c3} <span className="text-[9px]">/ 10</span></td>
              <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">المعدل العام</td>
            </tr>

            {/* RANG GENERAL */}
            <tr className="border-b-2 border-slate-950 font-bold text-xs">
              <td colSpan={2} className="border-r-2 border-slate-950 p-1 text-center uppercase tracking-wider">RANG GENERAL</td>
              <td className="border-r border-slate-950 p-1">{summary.rankGen?.c1}ème Élèves</td>
              <td className="border-r border-slate-950 p-1">{summary.rankGen?.c2}ème Élèves</td>
              <td className="border-r-2 border-slate-950 p-1">{summary.rankGen?.c3}ème Élèves</td>
              <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r border-slate-950 p-1 text-slate-400">—</td>
              <td className="border-r-2 border-slate-950 p-1 text-slate-400">—</td>
              <td colSpan={2} className="p-1 font-arabic text-center font-bold">الترتيب العام</td>
            </tr>

          </tbody>
        </table>
      </div>

      {/* 5. BILAN ANNUEL (BLOC DOUBLE : FRANÇAIS & ARABE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-xs font-sans">
        
        {/* Cartouche Gauche : Bilan Annuel Français */}
        <div className="border-2 border-slate-950 p-2.5 space-y-1.5 bg-white/50">
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="font-extrabold uppercase">TOTAL ANNUELLE :</span>
            <span className="font-mono font-black text-sm">{summary.annual?.totalPts} pts</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="font-extrabold uppercase">MOY. ANNUELLE :</span>
            <span className="font-mono font-black text-sm text-emerald-950">{summary.annual?.moyenne} / 10</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="font-extrabold uppercase">RANG ANNUELLE :</span>
            <span className="font-black">{summary.annual?.rank}ème Élèves</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1">
            <span className="font-extrabold uppercase">Appréciations :</span>
            <span className="font-bold italic">{summary.annual?.appreciation}</span>
          </div>
          <div className="pt-1 flex items-center justify-between font-bold">
            <span className="uppercase font-black text-[11px]">Décision du conseil :</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className={cn(
                  "w-4 h-4 border border-slate-950 flex items-center justify-center font-bold text-[10px]",
                  summary.annual?.isPassing ? "bg-slate-950 text-white" : "bg-white"
                )}>
                  {summary.annual?.isPassing ? "✓" : ""}
                </span>
                <span>Passe</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className={cn(
                  "w-4 h-4 border border-slate-950 flex items-center justify-center font-bold text-[10px]",
                  !summary.annual?.isPassing ? "bg-slate-950 text-white" : "bg-white"
                )}>
                  {!summary.annual?.isPassing ? "✓" : ""}
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
            <span className="font-mono font-black text-sm font-sans">{summary.annual?.totalAr} / {summary.maxTotalAr * 3}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1 font-bold">
            <span>المعدل السنوي :</span>
            <span className="font-mono font-black text-sm text-emerald-950 font-sans">{summary.annual?.moyAr} / 10</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1 font-bold">
            <span>الترتيب السنوي :</span>
            <span>{summary.annual?.rank} تلميذاً</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-1 font-bold">
            <span>التقديرات :</span>
            <span className="font-bold">{summary.annual?.appreciationAr}</span>
          </div>
          <div className="pt-1 flex items-center justify-between font-bold">
            <span className="font-black text-[12px]">قرار مجلس المعلمين :</span>
            <div className="flex items-center gap-4 font-sans text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className={cn(
                  "w-4 h-4 border border-slate-950 flex items-center justify-center font-bold text-[10px]",
                  summary.annual?.isPassing ? "bg-slate-950 text-white" : "bg-white"
                )}>
                  {summary.annual?.isPassing ? "✓" : ""}
                </span>
                <span className="font-arabic">ناجح(ة)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <span className={cn(
                  "w-4 h-4 border border-slate-950 flex items-center justify-center font-bold text-[10px]",
                  !summary.annual?.isPassing ? "bg-slate-950 text-white" : "bg-white"
                )}>
                  {!summary.annual?.isPassing ? "✓" : ""}
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
  const [recentGrades, setRecentGrades] = useState(initialRecentGrades);
  const [isGreenPaper, setIsGreenPaper] = useState(true);

  // Saisie state
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("TRIMESTRE_1");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [gradeValue, setGradeValue] = useState("");
  const [title, setTitle] = useState("");
  const [comments, setComments] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Bulletin state
  const [reportClassId, setReportClassId] = useState(classes[0]?.id || "");
  const [reportStudentId, setReportStudentId] = useState(classes[0]?.students?.[0]?.id || "");
  const [reportTerm, setReportTerm] = useState("TRIMESTRE_1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any | null>(null);
  const [isClassReport, setIsClassReport] = useState(false);

  // Rapport de synthèse state
  const [synthesisClassId, setSynthesisClassId] = useState(classes[0]?.id || "");
  const [synthesisTerm, setSynthesisTerm] = useState("TRIMESTRE_1");
  const [synthesisData, setSynthesisData] = useState<any | null>(null);
  const [isGeneratingSynthesis, setIsGeneratingSynthesis] = useState(false);

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const reportClass = classes.find(c => c.id === reportClassId) || classes[0];

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

  const handlePreviousStudent = async () => {
    if (currentStudentIndex > 0) {
      const prevStudent = currentStudents[currentStudentIndex - 1];
      setReportStudentId(prevStudent.id);
      setIsGenerating(true);
      const res = await getStudentReportCard(prevStudent.id, reportTerm);
      if (!res.error) {
        setReportData(res);
        setIsClassReport(false);
      }
      setIsGenerating(false);
    }
  };

  const handleNextStudent = async () => {
    if (currentStudentIndex < currentStudents.length - 1) {
      const nextStudent = currentStudents[currentStudentIndex + 1];
      setReportStudentId(nextStudent.id);
      setIsGenerating(true);
      const res = await getStudentReportCard(nextStudent.id, reportTerm);
      if (!res.error) {
        setReportData(res);
        setIsClassReport(false);
      }
      setIsGenerating(false);
    }
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedSubjectId || !gradeValue || !title) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setIsAdding(true);
    toast.loading("Enregistrement de la note...");
    const res = await addGrade({
      studentId: selectedStudentId,
      subjectId: selectedSubjectId,
      term: selectedTerm as any,
      title,
      gradeValue: Number(gradeValue),
      comments
    });
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Note enregistrée avec succès !");
      setShowAddModal(false);
      setGradeValue("");
      setTitle("");
      setComments("");
      setTimeout(() => window.location.reload(), 1000);
    }
    setIsAdding(false);
  };

  const handleGenerateReport = async () => {
    if (!reportStudentId) {
      toast.error("Veuillez sélectionner un élève.");
      return;
    }

    setIsGenerating(true);
    toast.loading("Calcul des notes du bulletin bilingue...");
    const res = await getStudentReportCard(reportStudentId, reportTerm);
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Bulletin officiel généré !");
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
    const res = await getClassReportCards(reportClassId, reportTerm);
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
            <span className="text-xs text-muted-foreground">• Format Officiel Franco-Arabe</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-emerald-600" />
            <span>Bulletin de Notes & كشف الدرجات</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Modèle officiel du Ministère de l'Éducation Nationale — Langue & Communication, Mathématiques, Arabe & Éducation Religieuse.
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
            <span>Saisie Notes</span>
          </button>
          <button 
            onClick={() => { setActiveTab("RAPPORTS"); setSynthesisData(null); }}
            className={cn(
              "px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shrink-0 flex items-center gap-2",
              activeTab === "RAPPORTS" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Rapports</span>
          </button>
        </div>
      </div>

      {/* 1. ONGLET BULLETINS (HERO VIEW) */}
      {activeTab === "BULLETINS" && (
        <div className="space-y-5">
          
          {/* BARRE DE CONTRÔLE ERGONOMIQUE DU BULLETIN */}
          <div className="bg-card border border-border/60 p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 print:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              
              {/* Sélecteur de Classe */}
              <div className="lg:col-span-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Classe / الصف
                </label>
                <select 
                  value={reportClassId}
                  onChange={(e) => { 
                    const newClassId = e.target.value;
                    setReportClassId(newClassId);
                    const selected = classes.find(c => c.id === newClassId);
                    if (selected?.students?.length) {
                      const firstS = selected.students[0];
                      setReportStudentId(firstS.id);
                      getStudentReportCard(firstS.id, reportTerm).then(res => {
                        if (!res.error) setReportData(res);
                      });
                    } else {
                      setReportStudentId("");
                      setReportData(null);
                    }
                  }}
                  className="w-full bg-background border border-border/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.students?.length || 0} élèves)</option>
                  ))}
                </select>
              </div>

              {/* Sélecteur d'Élève */}
              <div className="lg:col-span-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Élève Titulaire / الطالب
                </label>
                <select 
                  value={reportStudentId}
                  onChange={(e) => {
                    const sid = e.target.value;
                    setReportStudentId(sid);
                    if (sid) {
                      getStudentReportCard(sid, reportTerm).then(res => {
                        if (!res.error) {
                          setReportData(res);
                          setIsClassReport(false);
                        }
                      });
                    }
                  }}
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

              {/* Boutons d'Action Rapide */}
              <div className="lg:col-span-4 flex items-center gap-2">
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
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-wider text-[11px] py-2.5 px-3 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isGenerating && isClassReport ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  <span>Toute la classe</span>
                </button>
              </div>

            </div>

            {/* Barre d'outils secondaire : Couleur papier + navigation rapide */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-border/40 gap-3 text-xs">
              
              {/* Toggle Couleur Papier */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Couleur du papier :</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsGreenPaper(true)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                    isGreenPaper 
                      ? "bg-[#cbf3d2] text-[#051c0d] border-emerald-600 shadow-xs" 
                      : "bg-muted text-muted-foreground border-border"
                  )}
                >
                  🟢 Vert Menthe Officiel
                </button>
                <button
                  type="button"
                  onClick={() => setIsGreenPaper(false)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                    !isGreenPaper 
                      ? "bg-white text-slate-900 border-slate-400 shadow-xs" 
                      : "bg-muted text-muted-foreground border-border"
                  )}
                >
                  ⚪ Blanc Classique
                </button>
              </div>

              {/* Navigation Élèves */}
              {!isClassReport && reportData && currentStudents.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousStudent}
                    disabled={currentStudentIndex <= 0 || isGenerating}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg border border-border hover:bg-muted font-bold disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Précédent</span>
                  </button>
                  <span className="font-bold text-muted-foreground text-[11px] px-1">
                    {currentStudentIndex + 1} / {currentStudents.length}
                  </span>
                  <button
                    onClick={handleNextStudent}
                    disabled={currentStudentIndex >= currentStudents.length - 1 || isGenerating}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg border border-border hover:bg-muted font-bold disabled:opacity-40 transition-colors"
                  >
                    <span>Suivant</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Bouton Impression Directe */}
              <button 
                onClick={() => window.print()} 
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-1.5 rounded-xl flex items-center gap-2 shadow-xs transition-all active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer / PDF (A4)</span>
              </button>

            </div>
          </div>

          {/* APERÇU OFFICIEL DU BULLETIN */}
          <AnimatePresence>
            {reportData && (
              <div className="w-full relative mt-4">
                <style>{`
                  @media print {
                    @page { size: A4 portrait; margin: 8mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    header, aside, .print\\:hidden { display: none !important; }
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

      {/* 2. ONGLET SAISIE DES NOTES */}
      {activeTab === "SAISIE" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold">Dernières Notes Enregistrées</h2>
              <p className="text-xs text-muted-foreground">Registre des évaluations continues et compositions.</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> 
              <span>Nouvelle Note</span>
            </button>
          </div>

          {/* Grille Excel des notes */}
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs select-none">
              <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                Registre des évaluations — École Pathé Pogne
              </span>
              <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                {recentGrades.length} entrées
              </span>
            </div>

            <div className="w-full overflow-x-auto touch-pan-x">
              <table className="w-full min-w-[650px] border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-emerald-700 text-white select-none">
                    <th className="w-12 text-center p-2 border-r border-emerald-600">N°</th>
                    <th className="p-2 border-r border-emerald-600">Élève</th>
                    <th className="p-2 border-r border-emerald-600 text-center">Classe</th>
                    <th className="p-2 border-r border-emerald-600">Matière</th>
                    <th className="p-2 border-r border-emerald-600">Évaluation</th>
                    <th className="p-2 border-r border-emerald-600 text-center">Trimestre</th>
                    <th className="p-2 text-right">Note / Barème</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGrades.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground italic">
                        Aucune évaluation enregistrée pour le moment. Cliquez sur "Nouvelle Note" pour démarrer la saisie.
                      </td>
                    </tr>
                  ) : (
                    recentGrades.map((g, idx) => (
                      <tr key={g.id || idx} className={idx % 2 === 1 ? "bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200" : "bg-white dark:bg-slate-900 border-b border-slate-200"}>
                        <td className="text-center p-2 font-mono font-bold text-slate-400 border-r border-slate-200">{idx + 1}</td>
                        <td className="p-2 font-bold text-slate-900 dark:text-slate-100 border-r border-slate-200">
                          {g.student?.firstName} {g.student?.lastName}
                        </td>
                        <td className="p-2 text-center text-slate-600 border-r border-slate-200">{g.student?.class?.name || "—"}</td>
                        <td className="p-2 text-slate-700 border-r border-slate-200">{g.subject?.name || "—"}</td>
                        <td className="p-2 text-slate-900 border-r border-slate-200 font-medium">{g.title}</td>
                        <td className="p-2 text-center border-r border-slate-200">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800">
                            {g.term?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-sm text-emerald-700">
                          {g.gradeValue} / {g.maxGrade || 20}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
                {TERMS.map(t => (
                  <option key={t.value} value={t.value}>{t.labelFr}</option>
                ))}
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
                <h3 className="font-black text-sm uppercase">Tableau de Synthèse des Résultats</h3>
                <span className="text-xs font-bold text-emerald-700">Moyenne Classe : {synthesisData.classAverage} / 10</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold">
                    <th className="p-2 text-center w-12">Rang</th>
                    <th className="p-2">Élève</th>
                    <th className="p-2 text-center">Matricule</th>
                    <th className="p-2 text-right">Moyenne / 10</th>
                    <th className="p-2 text-right">Décision</th>
                  </tr>
                </thead>
                <tbody>
                  {synthesisData.ranking?.map((r: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-2 text-center font-bold">{r.rank}</td>
                      <td className="p-2 font-semibold text-slate-900">{r.studentName}</td>
                      <td className="p-2 text-center font-mono text-slate-600">{r.matricule}</td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-800">{r.average}</td>
                      <td className="p-2 text-right font-medium text-slate-700">{r.annualDecision || r.decision}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODALE D'AJOUT DE NOTE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold">Ajouter une Évaluation</h3>
            <form onSubmit={handleAddGrade} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Classe</label>
                <select 
                  value={selectedClassId}
                  onChange={(e) => { setSelectedClassId(e.target.value); setSelectedStudentId(""); }}
                  className="w-full bg-background border border-border rounded-xl p-2.5"
                >
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Élève</label>
                <select 
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-2.5"
                >
                  <option value="">Sélectionner...</option>
                  {selectedClass?.students?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.lastName} {s.firstName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Titre de l'évaluation</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Devoir de Mathématiques N°1"
                  className="w-full bg-background border border-border rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Note obtenue (/20)</label>
                <input 
                  type="number" 
                  step="0.5"
                  min="0"
                  max="20"
                  value={gradeValue}
                  onChange={(e) => setGradeValue(e.target.value)}
                  placeholder="Ex: 16.5"
                  className="w-full bg-background border border-border rounded-xl p-2.5"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted font-bold"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isAdding}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isAdding ? "Enregistrement..." : "Enregistrer la note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
