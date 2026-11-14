"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  Search, 
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
  Sparkles,
  School,
  UserCheck
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
  { value: "TRIMESTRE_1", labelFr: "1er Trimestre", labelAr: "Ø§Ù„ÙØµÙ„ Ø§Ù„Ø£ÙˆÙ„" },
  { value: "TRIMESTRE_2", labelFr: "2Ã¨me Trimestre", labelAr: "Ø§Ù„ÙØµÙ„ Ø§Ù„Ø«Ø§Ù†ÙŠ" },
  { value: "TRIMESTRE_3", labelFr: "3Ã¨me Trimestre", labelAr: "Ø§Ù„ÙØµÙ„ Ø§Ù„Ø«Ø§Ù„Ø«" },
];

// --- Sub-component for rendering a single official Franco-Arab Report Card ---
const ReportCard = ({ data, schoolName, reportClass }: { data: any, schoolName: string, reportClass: any }) => {
  const isPrimary = data.schoolConfig?.gradingSystem === "SUM_OF_MAX_GRADES";
  const avgBase = data.schoolConfig?.averageBase || 20;

  // Split subjects by curriculum domain
  const arabSubjects = data.subjectSummaries?.filter((s: any) => s.domain?.includes("Arabe") || s.domainAr?.includes("Ø§Ù„Ø¹Ø±Ø¨ÙŠ")) || [];
  const generalSubjects = data.subjectSummaries?.filter((s: any) => !s.domain?.includes("Arabe") && !s.domainAr?.includes("Ø§Ù„Ø¹Ø±Ø¨ÙŠ")) || [];
  
  const displaySubjects = arabSubjects.length > 0 || generalSubjects.length > 0 
    ? { arab: arabSubjects, general: generalSubjects }
    : { arab: [], general: data.subjectSummaries || [] };

  const termLabel = data.term === "TRIMESTRE_1" ? "PREMIER TRIMESTRE" 
    : data.term === "TRIMESTRE_2" ? "DEUXIÃˆME TRIMESTRE" 
    : data.term === "TRIMESTRE_3" ? "TROISIÃˆME TRIMESTRE" 
    : data.term?.replace('_', ' ') || "PREMIER TRIMESTRE";

  const termLabelAr = data.term === "TRIMESTRE_1" ? "Ø§Ù„ÙØµÙ„ Ø§Ù„Ø¯Ø±Ø§Ø³ÙŠ Ø§Ù„Ø£ÙˆÙ„" 
    : data.term === "TRIMESTRE_2" ? "Ø§Ù„ÙØµÙ„ Ø§Ù„Ø¯Ø±Ø§Ø³ÙŠ Ø§Ù„Ø«Ø§Ù†ÙŠ" 
    : data.term === "TRIMESTRE_3" ? "Ø§Ù„ÙØµÙ„ Ø§Ù„Ø¯Ø±Ø§Ø³ÙŠ Ø§Ù„Ø«Ø§Ù„Ø«" 
    : "Ø§Ù„ÙØµÙ„ Ø§Ù„Ø¯Ø±Ø§Ø³ÙŠ";

  return (
    <div className="bg-white text-slate-900 p-6 md:p-8 rounded-2xl shadow-xl mx-auto w-full max-w-4xl border border-slate-200 print:border-none print:shadow-none print:p-4 print:max-w-none print:m-0 font-sans relative">
      
      {/* Ruban tricolore SÃ©nÃ©gal en haut */}
      <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-amber-400 to-red-600 rounded-t-lg -mt-2 mb-4 print:mb-2" />

      {/* 1. EN-TÃŠTE OFFICIEL BILINGUE (FRANÃ‡AIS & ARABE) */}
      <div className="grid grid-cols-12 gap-2 items-center border-b-2 border-slate-800 pb-4 mb-4 text-xs">
        {/* Colonne Gauche : SÃ©nÃ©gal & IA / IEF */}
        <div className="col-span-5 text-left space-y-0.5">
          <p className="font-black text-[11px] uppercase tracking-wider text-slate-900">RÃ‰PUBLIQUE DU SÃ‰NÃ‰GAL</p>
          <p className="text-[10px] italic text-slate-600">Un Peuple â€” Un But â€” Une Foi</p>
          <p className="text-[10px] font-semibold text-slate-700">MinistÃ¨re de l'Ã‰ducation Nationale</p>
          <p className="text-[10px] font-medium text-slate-600">IA : Sangalkam â€” IEF : Sangalkam</p>
          <p className="font-extrabold text-[12px] text-emerald-800 pt-0.5">Ã‰COLE FRANCO-ARABE PATHÃ‰ POGNE</p>
        </div>

        {/* Colonne Centre : Logo Officiel */}
        <div className="col-span-2 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full border border-slate-300 p-1 flex items-center justify-center bg-slate-50 shadow-xs">
            <img 
              src="/logo-pathe-pogne.png" 
              alt="Logo Ã‰cole PathÃ© Pogne" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Excellence</span>
        </div>

        {/* Colonne Droite : Arabe & AnnÃ©e Scolaire */}
        <div className="col-span-5 text-right space-y-0.5 dir-rtl font-arabic">
          <p className="font-black text-[12px] text-slate-900">Ø¬Ù…Ù‡ÙˆØ±ÙŠØ© Ø§Ù„Ø³Ù†ØºØ§Ù„</p>
          <p className="text-[10px] text-slate-600">ÙˆØ²Ø§Ø±Ø© Ø§Ù„ØªØ±Ø¨ÙŠØ© Ø§Ù„ÙˆØ·Ù†ÙŠØ©</p>
          <p className="text-[10px] font-medium text-slate-700">Ù…ÙØªØ´ÙŠØ© Ø§Ù„ØªØ¹Ù„ÙŠÙ… ÙˆØ§Ù„ØªØ±Ø¨ÙŠØ© Ø¨Ø³Ù†ØºØ§Ù„ÙƒØ§Ù…</p>
          <p className="font-extrabold text-[12px] text-emerald-800 pt-0.5">Ø§Ù„Ù…Ø¯Ø±Ø³Ø© Ø§Ù„ÙØ±Ù†Ø³ÙŠØ© Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© Ø¨Ø§ØªÙŠÙ‡ Ø¨ÙˆÙ†ÙŠ</p>
          <p className="text-[10px] font-bold text-amber-700 font-sans">AnnÃ©e Scolaire : {data.schoolYear || "2025 - 2026"}</p>
        </div>
      </div>

      {/* 2. TITRE OFFICIEL DU BULLETIN */}
      <div className="bg-slate-900 text-white rounded-xl py-2 px-4 mb-4 text-center shadow-xs flex flex-col sm:flex-row items-center justify-between gap-1">
        <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-amber-300">
          BULLETIN DE NOTES DU {termLabel}
        </span>
        <span className="text-xs sm:text-sm font-bold text-emerald-200 font-arabic dir-rtl">
          ÙƒØ´Ù Ø¯Ø±Ø¬Ø§Øª {termLabelAr}
        </span>
      </div>

      {/* 3. FICHE D'IDENTITÃ‰ DE L'Ã‰LÃˆVE */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Nom & PrÃ©nom / Ø§Ù„ØªÙ„Ù…ÙŠØ°(Ø©)</span>
          <span className="font-black text-sm uppercase text-slate-900">
            {data.student.lastName} {data.student.firstName}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Matricule / Ø§Ù„Ø±Ù‚Ù… Ø§Ù„ØªØ¹Ø±ÙŠÙÙŠ</span>
          <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
            {data.student.matricule || "PP-001"}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Classe / Ø§Ù„ÙØµÙ„ Ø§Ù„Ø¯Ø±Ø§Ø³ÙŠ</span>
          <span className="font-bold text-slate-800">
            {data.student.class?.name || reportClass?.name || "Classe Primaire"}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Rang / Ø§Ù„Ø±ØªØ¨Ø© ÙÙŠ Ø§Ù„ÙØµÙ„</span>
          <span className="font-black text-sm text-emerald-700 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{data.classStats?.rank || 1}{data.classStats?.rank === 1 ? "er" : "Ã¨me"} / {data.classStats?.totalStudents || 25} Ã©lÃ¨ves</span>
          </span>
        </div>
      </div>

      {/* 4. TABLEAU OFFICIEL DES NOTES & MATIÃˆRES */}
      <div className="w-full overflow-x-auto border border-slate-300 rounded-xl overflow-hidden mb-4">
        <table className="w-full min-w-[620px] text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-800 text-white text-[11px] select-none font-bold">
              <th className="p-2 border-r border-slate-700">Discipline / Domaine d'apprentissage</th>
              <th className="p-2 text-center border-r border-slate-700 w-24">Note / 20</th>
              <th className="p-2 text-center border-r border-slate-700 w-16">Coef</th>
              <th className="p-2 text-center border-r border-slate-700 w-24">PondÃ©rÃ©e</th>
              <th className="p-2">ApprÃ©ciations du MaÃ®tre</th>
            </tr>
          </thead>
          <tbody>
            {/* Section A : Enseignement Arabe & Islamique */}
            {displaySubjects.arab.length > 0 && (
              <>
                <tr className="bg-emerald-50 text-emerald-900 border-t border-b border-emerald-200">
                  <td colSpan={5} className="p-2 font-black text-[11px] uppercase tracking-wide flex items-center justify-between">
                    <span>1. ENSEIGNEMENT ARABE & ISLAMIQUE</span>
                    <span className="font-arabic font-bold text-xs">Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ø¹Ø±Ø¨ÙŠ ÙˆØ§Ù„Ø¯Ø±Ø§Ø³Ø§Øª Ø§Ù„Ø¥Ø³Ù„Ø§Ù…ÙŠØ©</span>
                  </td>
                </tr>
                {displaySubjects.arab.map((s: any, idx: number) => (
                  <tr key={`arab-${idx}`} className={idx % 2 === 1 ? "bg-slate-50/60 border-b border-slate-200" : "bg-white border-b border-slate-200"}>
                    <td className="p-2 border-r border-slate-200 font-semibold text-slate-800">
                      <div className="flex items-center justify-between">
                        <span>{s.subjectName}</span>
                        {s.subjectNameAr && <span className="font-arabic text-slate-500 text-[11px]">{s.subjectNameAr}</span>}
                      </div>
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-slate-900">
                      {s.averageOn20 || s.rawObtained}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-600">
                      {s.coefficient}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-emerald-800 bg-emerald-50/30">
                      {s.weightedAverage}
                    </td>
                    <td className="p-2 italic text-slate-700 text-[11px]">
                      {s.appreciation}
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* Section B : Enseignement GÃ©nÃ©ral & FranÃ§ais */}
            {displaySubjects.general.length > 0 && (
              <>
                <tr className="bg-sky-50 text-sky-950 border-t border-b border-sky-200">
                  <td colSpan={5} className="p-2 font-black text-[11px] uppercase tracking-wide flex items-center justify-between">
                    <span>2. ENSEIGNEMENT GÃ‰NÃ‰RAL & FRANÃ‡AIS</span>
                    <span className="font-arabic font-bold text-xs">Ø§Ù„Ù‚Ø³Ù… Ø§Ù„Ø¹Ø§Ù… ÙˆØ§Ù„ØªÙˆØ§ØµÙ„ Ø¨Ø§Ù„ÙØ±Ù†Ø³ÙŠØ©</span>
                  </td>
                </tr>
                {displaySubjects.general.map((s: any, idx: number) => (
                  <tr key={`gen-${idx}`} className={idx % 2 === 1 ? "bg-slate-50/60 border-b border-slate-200" : "bg-white border-b border-slate-200"}>
                    <td className="p-2 border-r border-slate-200 font-semibold text-slate-800">
                      <div className="flex items-center justify-between">
                        <span>{s.subjectName}</span>
                        {s.subjectNameAr && <span className="font-arabic text-slate-500 text-[11px]">{s.subjectNameAr}</span>}
                      </div>
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-slate-900">
                      {s.averageOn20 || s.rawObtained}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-mono text-slate-600">
                      {s.coefficient}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center font-mono font-bold text-sky-900 bg-sky-50/30">
                      {s.weightedAverage}
                    </td>
                    <td className="p-2 italic text-slate-700 text-[11px]">
                      {s.appreciation}
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. CARTOUCHE DE SYNTHÃˆSE & MOYENNE GÃ‰NÃ‰RALE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-900 text-white rounded-xl p-4 mb-4 shadow-sm items-center">
        {/* Total Points & Coef */}
        <div className="text-center md:text-left space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Points Obtenus</p>
          <p className="text-xl font-black font-mono text-amber-300">
            {data.grandTotalPoints || data.rawTotalObtained} <span className="text-xs font-normal text-slate-400">/ {data.grandTotalMax || 240}</span>
          </p>
          <p className="text-[10px] text-slate-400">Total Coefficients : {data.grandTotalCoefficients || 12}</p>
        </div>

        {/* Moyenne GÃ©nÃ©rale */}
        <div className="text-center border-y md:border-y-0 md:border-x border-slate-700 py-2 md:py-0 space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Moyenne GÃ©nÃ©rale / Ø§Ù„Ù…Ø¹Ø¯Ù„ Ø§Ù„Ø¹Ø§Ù…</p>
          <p className="text-3xl font-black font-mono text-white">
            {data.overallAverage?.toFixed(2) || data.rawAverage || "15.00"}
            <span className="text-sm font-bold text-slate-400"> / {avgBase}</span>
          </p>
          <span className={cn(
            "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
            (data.overallAverage || 15) >= 16 ? "bg-amber-400 text-slate-950" :
            (data.overallAverage || 15) >= 14 ? "bg-emerald-500 text-white" :
            (data.overallAverage || 15) >= 12 ? "bg-sky-500 text-white" : "bg-slate-700 text-white"
          )}>
            Mention : {data.mention || "Bien"}
          </span>
        </div>

        {/* Statistiques Classe & DÃ©cision */}
        <div className="text-center md:text-right space-y-1 text-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">DÃ©cision du Conseil</p>
          <p className="font-extrabold text-emerald-400 text-sm">
            {data.decision || "FÃ©licitations du Conseil"}
          </p>
          <p className="text-[10px] text-slate-400">
            Moy. Classe : <strong>{data.classStats?.classAverage || "14.20"}</strong> | Max : <strong>{data.classStats?.maxAverage || "18.50"}</strong>
          </p>
        </div>
      </div>

      {/* 6. CADRE DES SIGNATURES OFFICIELLES & CACHET */}
      <div className="grid grid-cols-3 gap-4 pt-3 border-t-2 border-slate-200 text-center text-xs">
        {/* MaÃ®tre */}
        <div className="flex flex-col justify-between h-24">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Le MaÃ®tre Titulaire</span>
          <span className="text-[10px] italic text-slate-500">Signature de l'enseignant</span>
        </div>

        {/* Direction avec Tampon Visuel Officiel */}
        <div className="flex flex-col items-center justify-between h-24 relative">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Le Directeur de l'Ã‰cole</span>
          
          {/* Cachet officiel circulaire PathÃ© Pogne */}
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-red-600/80 p-1 flex flex-col items-center justify-center text-red-700 rotate-[-12deg] select-none opacity-85 my-auto">
            <span className="text-[7px] font-black uppercase tracking-tight text-center leading-tight">Ã‰COLE FRANCO-ARABE</span>
            <span className="text-[8px] font-black uppercase tracking-wider text-center">PATHÃ‰ POGNE</span>
            <span className="text-[6px] font-bold uppercase tracking-widest text-center mt-0.5">DIRECTION</span>
          </div>

          <span className="text-[10px] font-semibold text-slate-600">Sceau & Visa de la Direction</span>
        </div>

        {/* Parents */}
        <div className="flex flex-col justify-between h-24 text-right">
          <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] text-center">Le Parent ou Tuteur</span>
          <span className="text-[10px] italic text-slate-500 text-center">Signature & Date</span>
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
  const schoolName = isSchool ? "Ã‰cole Franco-Arabe PathÃ© Pogne" : rawSchoolName;

  const [activeTab, setActiveTab] = useState<"SAISIE" | "BULLETINS" | "RAPPORTS">("BULLETINS");
  const [recentGrades, setRecentGrades] = useState(initialRecentGrades);
  
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

  // Rapport de synthÃ¨se state
  const [synthesisClassId, setSynthesisClassId] = useState(classes[0]?.id || "");
  const [synthesisTerm, setSynthesisTerm] = useState("TRIMESTRE_1");
  const [synthesisData, setSynthesisData] = useState<any | null>(null);
  const [isGeneratingSynthesis, setIsGeneratingSynthesis] = useState(false);

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const reportClass = classes.find(c => c.id === reportClassId) || classes[0];

  // Auto-generate report card on initial load if student is present
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

  // Navigate through students in the active class
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
      toast.success("Note enregistrÃ©e avec succÃ¨s !");
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
      toast.error("Veuillez sÃ©lectionner un Ã©lÃ¨ve.");
      return;
    }

    setIsGenerating(true);
    toast.loading("Calcul des moyennes et gÃ©nÃ©ration du bulletin...");
    const res = await getStudentReportCard(reportStudentId, reportTerm);
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Bulletin gÃ©nÃ©rÃ© avec succÃ¨s !");
      setReportData(res);
      setIsClassReport(false);
    }
    setIsGenerating(false);
  };

  const handleGenerateClassReports = async () => {
    if (!reportClassId) {
      toast.error("Veuillez sÃ©lectionner une classe.");
      return;
    }

    setIsGenerating(true);
    toast.loading("GÃ©nÃ©ration des bulletins de toute la classe...");
    const res = await getClassReportCards(reportClassId, reportTerm);
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Bulletins gÃ©nÃ©rÃ©s pour ${res.reportCards?.length || 0} Ã©lÃ¨ves !`);
      setReportData(res.reportCards);
      setIsClassReport(true);
    }
    setIsGenerating(false);
  };

  const handleGenerateSynthesisReport = async () => {
    if (!synthesisClassId) {
      toast.error("Veuillez sÃ©lectionner une classe.");
      return;
    }

    setIsGeneratingSynthesis(true);
    toast.loading("GÃ©nÃ©ration du rapport...");
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
      toast.success("Rapport gÃ©nÃ©rÃ© avec succÃ¨s !");
      setSynthesisData({ ...res, isAnnual: synthesisTerm === "BILAN_ANNUEL" });
    }
    setIsGeneratingSynthesis(false);
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      
      {/* EN-TÃŠTE DE LA SECTION DE GESTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              Espace Ã‰cole PathÃ© Pogne
            </span>
            <span className="text-xs text-muted-foreground">â€¢ PÃ©dagogie Franco-Arabe</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-emerald-600" />
            <span>Bulletins & Ã‰valuations / ÙƒØ´Ù Ø§Ù„Ø¯Ø±Ø¬Ø§Øª</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Ã‰dition officielle des bulletins scolaires bilingues, relevÃ©s trimestriels et calcul automatique des rangs.
          </p>
        </div>

        {/* Onglets Principaux */}
        <div className="flex bg-card p-1 rounded-2xl border border-border/60 shadow-xs overflow-x-auto shrink-0">
          <button 
            onClick={() => { setActiveTab("BULLETINS"); }}
            className={cn(
              "px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shrink-0 flex items-center gap-2",
              activeTab === "BULLETINS" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Bulletins</span>
          </button>
          <button 
            onClick={() => setActiveTab("SAISIE")}
            className={cn(
              "px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shrink-0 flex items-center gap-2",
              activeTab === "SAISIE" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Saisie des Notes</span>
          </button>
          <button 
            onClick={() => { setActiveTab("RAPPORTS"); setSynthesisData(null); }}
            className={cn(
              "px-4 sm:px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shrink-0 flex items-center gap-2",
              activeTab === "RAPPORTS" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Rapports & Bilan</span>
          </button>
        </div>
      </div>

      {/* 1. ONGLET BULLETINS (HERO VIEW) */}
      {activeTab === "BULLETINS" && (
        <div className="space-y-6">
          
          {/* BARRE DE CONTRÃ”LE ERGONOMIQUE DU BULLETIN */}
          <div className="bg-card border border-border/60 p-4 sm:p-5 rounded-2xl shadow-sm space-y-4 print:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              
              {/* SÃ©lecteur de Trimestre */}
              <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  PÃ©riode / Trimestre
                </label>
                <select 
                  value={reportTerm}
                  onChange={(e) => {
                    const newTerm = e.target.value;
                    setReportTerm(newTerm);
                    if (reportStudentId) {
                      getStudentReportCard(reportStudentId, newTerm).then(res => {
                        if (!res.error) setReportData(res);
                      });
                    }
                  }}
                  className="w-full bg-background border border-border/70 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                >
                  {TERMS.map(t => (
                    <option key={t.value} value={t.value}>{t.labelFr} â€” {t.labelAr}</option>
                  ))}
                </select>
              </div>

              {/* SÃ©lecteur de Classe */}
              <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Classe / Ø§Ù„ØµÙ
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
                    <option key={c.id} value={c.id}>{c.name} ({c.students?.length || 0} Ã©lÃ¨ves)</option>
                  ))}
                </select>
              </div>

              {/* SÃ©lecteur d'Ã‰lÃ¨ve */}
              <div className="lg:col-span-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1.5 block">
                  Ã‰lÃ¨ve Titulaire / Ø§Ù„Ø·Ø§Ù„Ø¨
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
              <div className="lg:col-span-3 flex items-center gap-2">
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
                  <span>Classe entiÃ¨re</span>
                </button>
              </div>

            </div>

            {/* Barre de navigation rapide entre Ã©lÃ¨ves (si bulletin individuel actif) */}
            {!isClassReport && reportData && currentStudents.length > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                <button
                  onClick={handlePreviousStudent}
                  disabled={currentStudentIndex <= 0 || isGenerating}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-muted font-bold disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Ã‰lÃ¨ve prÃ©cÃ©dent</span>
                </button>
                <span className="font-bold text-muted-foreground text-[11px]">
                  Ã‰lÃ¨ve {currentStudentIndex + 1} sur {currentStudents.length}
                </span>
                <button
                  onClick={handleNextStudent}
                  disabled={currentStudentIndex >= currentStudents.length - 1 || isGenerating}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-muted font-bold disabled:opacity-40 transition-colors"
                >
                  <span>Ã‰lÃ¨ve suivant</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* BARRE D'EXPORT / IMPRESSION */}
          {reportData && (
            <div className="flex items-center justify-between print:hidden bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  {isClassReport 
                    ? `PrÃªt pour l'impression : ${Array.isArray(reportData) ? reportData.length : 0} bulletins de la classe.`
                    : `Bulletin officiel de ${reportData.student?.firstName} ${reportData.student?.lastName} prÃªt.`}
                </span>
              </div>
              <button 
                onClick={() => window.print()} 
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer / TÃ©lÃ©charger en PDF (A4)</span>
              </button>
            </div>
          )}

          {/* APERÃ‡U OFFICIEL DU BULLETIN */}
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
                      <div key={i} className={cn("w-full print:break-after mb-8 print:mb-0")}>
                        <ReportCard data={r} schoolName={schoolName} reportClass={reportClass} />
                      </div>
                    ))
                  ) : (
                    <div className="w-full">
                      <ReportCard data={reportData} schoolName={schoolName} reportClass={reportClass} />
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Ã‰tat vide si aucune donnÃ©e */}
          {!reportData && !isGenerating && (
            <div className="p-12 text-center bg-card border border-border/50 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Aucun bulletin affichÃ©</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                SÃ©lectionnez une classe et un Ã©lÃ¨ve ci-dessus puis cliquez sur "Afficher" pour visualiser le relevÃ© officiel.
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
              <h2 className="text-lg font-bold">DerniÃ¨res Notes EnregistrÃ©es</h2>
              <p className="text-xs text-muted-foreground">Registre des Ã©valuations continues et compositions.</p>
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
                Registre des Ã©valuations â€” Ã‰cole PathÃ© Pogne
              </span>
              <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                {recentGrades.length} entrÃ©es
              </span>
            </div>

            <div className="w-full overflow-x-auto touch-pan-x">
              <table className="w-full min-w-[650px] border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-emerald-700 text-white select-none">
                    <th className="w-12 text-center p-2 border-r border-emerald-600">NÂ°</th>
                    <th className="p-2 border-r border-emerald-600">Ã‰lÃ¨ve</th>
                    <th className="p-2 border-r border-emerald-600 text-center">Classe</th>
                    <th className="p-2 border-r border-emerald-600">MatiÃ¨re</th>
                    <th className="p-2 border-r border-emerald-600">Ã‰valuation</th>
                    <th className="p-2 border-r border-emerald-600 text-center">Trimestre</th>
                    <th className="p-2 text-right">Note / BarÃ¨me</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGrades.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground italic">
                        Aucune Ã©valuation enregistrÃ©e pour le moment. Cliquez sur "Nouvelle Note" pour dÃ©marrer la saisie.
                      </td>
                    </tr>
                  ) : (
                    recentGrades.map((g, idx) => (
                      <tr key={g.id || idx} className={idx % 2 === 1 ? "bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200" : "bg-white dark:bg-slate-900 border-b border-slate-200"}>
                        <td className="text-center p-2 font-mono font-bold text-slate-400 border-r border-slate-200">{idx + 1}</td>
                        <td className="p-2 font-bold text-slate-900 dark:text-slate-100 border-r border-slate-200">
                          {g.student?.firstName} {g.student?.lastName}
                        </td>
                        <td className="p-2 text-center text-slate-600 border-r border-slate-200">{g.student?.class?.name || "â€”"}</td>
                        <td className="p-2 text-slate-700 border-r border-slate-200">{g.subject?.name || "â€”"}</td>
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

      {/* 3. ONGLET RAPPORTS DE SYNTHÃˆSE */}
      {activeTab === "RAPPORTS" && (
        <div className="space-y-4">
          <div className="bg-card border border-border/60 p-4 rounded-xl shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Trimestre / Ø§Ù„ÙØµÙ„</label>
              <select 
                value={synthesisTerm}
                onChange={(e) => setSynthesisTerm(e.target.value)}
                className="w-full bg-background border border-border/70 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <option value="BILAN_ANNUEL" className="font-bold text-emerald-600">BILAN ANNUEL (Fin d'annÃ©e)</option>
                {TERMS.map(t => (
                  <option key={t.value} value={t.value}>{t.labelFr}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Classe / Ø§Ù„ØµÙ</label>
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
              <span>GÃ©nÃ©rer SynthÃ¨se</span>
            </button>
          </div>

          {synthesisData && (
            <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-black text-sm uppercase">Tableau de SynthÃ¨se des RÃ©sultats</h3>
                <span className="text-xs font-bold text-emerald-700">Moyenne Classe : {synthesisData.classAverage} / 20</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold">
                    <th className="p-2 text-center w-12">Rang</th>
                    <th className="p-2">Ã‰lÃ¨ve</th>
                    <th className="p-2 text-center">Matricule</th>
                    <th className="p-2 text-right">Moyenne / 20</th>
                    <th className="p-2 text-right">DÃ©cision</th>
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
            <h3 className="text-base font-bold">Ajouter une Ã‰valuation</h3>
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
                <label className="font-bold text-muted-foreground block mb-1">Ã‰lÃ¨ve</label>
                <select 
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-2.5"
                >
                  <option value="">SÃ©lectionner...</option>
                  {selectedClass?.students?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.lastName} {s.firstName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-muted-foreground block mb-1">Titre de l'Ã©valuation</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Devoir de MathÃ©matiques NÂ°1"
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
