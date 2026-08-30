"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, 
  Search, 
  CheckCircle2, 
  Clock,
  Download,
  Plus,
  BookOpen,
  FileText
} from "lucide-react";
import { addGrade, getStudentReportCard, getClassReportCards, getClassSynthesisReport, getAnnualReport } from "@/lib/actions/grades";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GradesClientProps {
  classes: any[];
  subjects: any[];
  recentGrades: any[];
  schoolName: string;
}

const TERMS = ["TRIMESTRE_1", "TRIMESTRE_2", "TRIMESTRE_3", "SEMESTRE_1", "SEMESTRE_2"];

// --- Sub-component for rendering a single report card ---
const ReportCard = ({ data, schoolName, reportClass }: { data: any, schoolName: string, reportClass: any }) => {
  const isPrimary = data.schoolConfig?.gradingSystem === "SUM_OF_MAX_GRADES";
  const avgBase = data.schoolConfig?.averageBase || (isPrimary ? 10 : 20);
  const leftHeader = data.schoolConfig?.reportHeaderLeft || `IA : SANGALKAM\nIEF : SANGALKAM\nEcole : ${schoolName}`;
  const rightHeader = data.schoolConfig?.reportHeaderRight || `Année scolaire 2025-2026\nClasse : ${reportClass?.name}\nTenue par : L'enseignant`;

  return (
    <div className="bg-white text-black p-4 md:p-8 rounded-2xl shadow-2xl mx-auto w-full font-serif relative print:shadow-none print:p-2 break-inside-avoid print:border-none print:m-0" style={{ height: '100%' }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-2 mb-4">
        <div className="w-1/2 whitespace-pre-line text-[11px] font-bold leading-tight">
          {leftHeader}
        </div>
        <div className="w-1/2 text-right whitespace-pre-line text-[11px] font-bold leading-tight">
          {rightHeader}
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-black uppercase tracking-widest border-b border-black inline-block pb-0.5">
          Bulletin de Notes du {data.term.replace('_', ' ')}
        </h1>
      </div>

      {/* Student Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
        <div className="font-bold">
          <p>Elève : <span className="font-black text-sm uppercase">{data.student.firstName} {data.student.lastName}</span></p>
        </div>
        <div className="text-right font-bold">
          <p>Matricule : {data.student.matricule}</p>
        </div>
      </div>

      {/* Grades Table */}
      <table className="w-full text-left border-collapse border border-black mb-4 text-[11px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black p-1.5 font-bold">Domaine/Matière composée</th>
            {isPrimary ? (
              <th className="border border-black p-1.5 font-bold text-center">Note obtenue</th>
            ) : (
              <>
                <th className="border border-black p-1.5 font-bold text-center">Note/20</th>
                <th className="border border-black p-1.5 font-bold text-center">Coef</th>
                <th className="border border-black p-1.5 font-bold text-center">Pond.</th>
              </>
            )}
            <th className="border border-black p-1.5 font-bold">Appréciations</th>
          </tr>
        </thead>
        <tbody>
          {data.subjectSummaries.map((s: any, idx: number) => (
            <tr key={idx}>
              <td className="border border-black p-1.5 font-semibold">{s.subjectName}</td>
              {isPrimary ? (
                <td className="border border-black p-1.5 text-center font-bold">
                  {s.rawObtained} <span className="text-[9px] font-normal text-gray-600">/ {s.rawMax}</span>
                </td>
              ) : (
                <>
                  <td className="border border-black p-1.5 text-center font-bold">{s.averageOn20}</td>
                  <td className="border border-black p-1.5 text-center">{s.coefficient}</td>
                  <td className="border border-black p-1.5 text-center font-bold">{s.weightedAverage}</td>
                </>
              )}
              <td className="border border-black p-1.5 italic">{s.appreciation}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer Stats */}
      <div className="grid grid-cols-3 gap-2 border border-black p-2 mb-6 font-bold text-[11px]">
        {isPrimary ? (
          <>
            <div>Total : {data.rawTotalObtained} / {data.rawTotalMax}</div>
            <div className="text-center">Moyenne : {data.rawAverage} / {avgBase}</div>
          </>
        ) : (
          <>
            <div>Total Coefs : {data.grandTotalCoefficients}</div>
            <div className="text-center">Moyenne : {data.overallAverage} / {avgBase}</div>
          </>
        )}
        <div className="text-right">Rang : {data.classStats?.rank}{data.classStats?.rank === 1 ? 'er' : 'ème'} / {data.classStats?.totalStudents} élèves</div>
      </div>

      {/* Signatures */}
      <div className="flex justify-between items-end mt-4 px-2">
        <div className="font-bold text-[11px]">L'Enseignant</div>
        <div className="font-bold text-[11px] text-center">Le Directeur</div>
        <div className="font-bold text-[11px] text-right">Parent (ou Tuteur)</div>
      </div>
    </div>
  );
};

export function GradesClient({ 
  classes, 
  subjects, 
  recentGrades: initialRecentGrades,
  schoolName
}: GradesClientProps) {
  const [activeTab, setActiveTab] = useState<"SAISIE" | "BULLETINS" | "RAPPORTS">("SAISIE");
  const [recentGrades, setRecentGrades] = useState(initialRecentGrades);
  
  // Saisie state
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("TRIMESTRE_1");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [gradeValue, setGradeValue] = useState("");
  const [title, setTitle] = useState("");
  const [comments, setComments] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Bulletin state
  const [reportClassId, setReportClassId] = useState("");
  const [reportStudentId, setReportStudentId] = useState("");
  const [reportTerm, setReportTerm] = useState("TRIMESTRE_1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any | null>(null);
  const [isClassReport, setIsClassReport] = useState(false);

  // Rapport de synthèse state
  const [synthesisClassId, setSynthesisClassId] = useState("");
  const [synthesisTerm, setSynthesisTerm] = useState("TRIMESTRE_1");
  const [synthesisData, setSynthesisData] = useState<any | null>(null);
  const [isGeneratingSynthesis, setIsGeneratingSynthesis] = useState(false);

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const reportClass = classes.find(c => c.id === reportClassId);

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
    toast.loading("Calcul des moyennes et génération du bulletin...");
    const res = await getStudentReportCard(reportStudentId, reportTerm as any);
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Bulletin généré avec succès !");
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
    toast.loading("Génération des bulletins de toute la classe...");
    const res = await getClassReportCards(reportClassId, reportTerm as any);
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
      res = await getClassSynthesisReport(synthesisClassId, synthesisTerm as any);
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Notes & Bulletins / الدرجات</h1>
          <p className="text-sm text-muted-foreground">Gestion pédagogique et relevés de notes bilingues.</p>
        </div>
        <div className="flex bg-card p-1 rounded-2xl border border-border/50">
          <button 
            onClick={() => setActiveTab("SAISIE")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === "SAISIE" ? "bg-primary text-black shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            Saisie
          </button>
          <button 
            onClick={() => { setActiveTab("BULLETINS"); setReportData(null); }}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === "BULLETINS" ? "bg-primary text-black shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            Bulletins
          </button>
          <button 
            onClick={() => { setActiveTab("RAPPORTS"); setSynthesisData(null); }}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === "RAPPORTS" ? "bg-primary text-black shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            Rapports
          </button>
        </div>
      </div>

      {activeTab === "SAISIE" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">Dernières Notes Saisies</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary/90 text-black font-black uppercase text-[11px] px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 tracking-widest"
            >
              <Plus className="w-4 h-4" /> Nouvelle Note
            </button>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            {/* Vue Desktop: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Élève</th>
                    <th className="px-6 py-4 font-semibold">Matière</th>
                    <th className="px-6 py-4 font-semibold">Évaluation</th>
                    <th className="px-6 py-4 font-semibold">Trimestre</th>
                    <th className="px-6 py-4 font-semibold text-right">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {recentGrades.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        Aucune note récente. Cliquez sur Nouvelle Note pour commencer.
                      </td>
                    </tr>
                  ) : (
                    recentGrades.map((g) => (
                      <tr key={g.id} className="hover:bg-muted/20 transition-all">
                        <td className="px-6 py-4 font-medium">{g.student.firstName} {g.student.lastName} <span className="text-[10px] text-muted-foreground ml-2">({g.student.class.name})</span></td>
                        <td className="px-6 py-4 text-muted-foreground">{g.subject.name}</td>
                        <td className="px-6 py-4">{g.title}</td>
                        <td className="px-6 py-4 text-[10px] uppercase tracking-wider">{g.term.replace('_', ' ')}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={cn(
                            "font-black text-lg",
                            g.gradeValue < 10 ? "text-red-500" : "text-emerald-500"
                          )}>
                            {g.gradeValue.toLocaleString('fr-FR')} <span className="text-xs text-muted-foreground font-normal">/ {g.maxGrade}</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Vue Mobile: Cartes */}
            <div className="md:hidden flex flex-col p-4 gap-3">
              {recentGrades.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Aucune note récente. Cliquez sur Nouvelle Note pour commencer.
                </div>
              ) : (
                recentGrades.map((g) => (
                  <div key={g.id} className="bg-background border border-border/50 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm leading-tight">{g.student.firstName} {g.student.lastName}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{g.student.class.name}</p>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "font-black text-xl",
                          g.gradeValue < 10 ? "text-red-500" : "text-emerald-500"
                        )}>
                          {g.gradeValue}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-bold"> / {g.maxGrade}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-muted/30 p-2 rounded-lg border border-border/50 mt-1">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Matière</span>
                        <span className="font-bold text-xs">{g.subject.name}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Éval & Trim</span>
                        <span className="font-bold text-xs text-right">{g.title} • {g.term.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "BULLETINS" && (
        <div className="space-y-4">
          <div className="bg-card border border-border/50 p-3 md:p-4 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Trimestre / الفصل</label>
              <select 
                value={reportTerm}
                onChange={(e) => setReportTerm(e.target.value)}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
              >
                {TERMS.map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Classe / الصف</label>
              <select 
                value={reportClassId}
                onChange={(e) => { setReportClassId(e.target.value); setReportStudentId(""); }}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="">Sélectionner...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Élève / الطالب</label>
              <select 
                value={reportStudentId}
                onChange={(e) => setReportStudentId(e.target.value)}
                disabled={!reportClassId}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50"
              >
                <option value="">Sélectionner...</option>
                {reportClass?.students.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-transparent select-none mb-2 block hidden md:block">Actions</label>
              <div className="grid grid-cols-2 gap-2 h-full">
                <button 
                  onClick={handleGenerateReport}
                  disabled={!reportStudentId || isGenerating}
                  className="w-full bg-primary text-black font-black uppercase tracking-widest text-[10px] px-2 py-3 rounded-xl shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating && !isClassReport ? <Clock className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  1 Élève
                </button>
                <button 
                  onClick={handleGenerateClassReports}
                  disabled={!reportClassId || isGenerating}
                  className="w-full bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] px-2 py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating && isClassReport ? <Clock className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Classe entière
                </button>
              </div>
            </div>
          </div>

          {/* Bulletin Preview */}
          <AnimatePresence>
            {reportData && (
              <div className="w-full relative mt-4">
                {isClassReport && (
                  <style>{`
                    @media print {
                      @page { size: A4 landscape; margin: 10mm; }
                      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                      .print\\:landscape-grid {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 20mm !important;
                        width: 100% !important;
                      }
                      .print\\:break-after {
                        page-break-after: always;
                        break-after: page;
                      }
                    }
                  `}</style>
                )}
                {!isClassReport && (
                  <style>{`
                    @media print {
                      @page { size: A4 portrait; margin: 10mm; }
                    }
                  `}</style>
                )}

                {/* Print Action Bar */}
                <div className="mb-4 flex justify-end print:hidden">
                  <button onClick={() => window.print()} className="bg-gray-900 text-white hover:bg-black font-bold text-xs px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg">
                    <Download className="w-4 h-4" /> Imprimer / Exporter PDF
                  </button>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "w-full",
                    isClassReport ? "print:landscape-grid grid grid-cols-1 gap-8" : "print:block"
                  )}
                >
                  {isClassReport ? (
                    (reportData as any[]).map((r, i) => (
                      <div key={i} className={cn(
                        "w-full bg-white border border-gray-200 rounded-xl overflow-hidden print:border-none print:bg-transparent",
                        i % 2 === 1 ? "print:break-after" : ""
                      )}>
                        <ReportCard data={r} schoolName={schoolName} reportClass={reportClass} />
                      </div>
                    ))
                  ) : (
                    <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden print:border-none print:bg-transparent">
                      <ReportCard data={reportData} schoolName={schoolName} reportClass={reportClass} />
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {activeTab === "RAPPORTS" && (
        <div className="space-y-4">
          <div className="bg-card border border-border/50 p-3 md:p-4 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Trimestre / الفصل</label>
              <select 
                value={synthesisTerm}
                onChange={(e) => setSynthesisTerm(e.target.value)}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="BILAN_ANNUEL" className="font-bold text-emerald-600">BILAN ANNUEL (Fin d'année)</option>
                {TERMS.map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Classe / الصف</label>
              <select 
                value={synthesisClassId}
                onChange={(e) => setSynthesisClassId(e.target.value)}
                className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
              >
                <option value="">Sélectionner...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleGenerateSynthesisReport}
              disabled={!synthesisClassId || isGeneratingSynthesis}
              className="w-full bg-emerald-500 text-white font-black uppercase tracking-widest text-[11px] px-6 py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGeneratingSynthesis ? <Clock className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Générer Rapport
            </button>
          </div>

          <AnimatePresence>
            {synthesisData && (
              <div className="w-full relative mt-4">
                <style>{`
                  @media print {
                    @page { size: A4 portrait; margin: 10mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                  }
                `}</style>
                <div className="mb-4 flex justify-end print:hidden">
                  <button onClick={() => window.print()} className="bg-gray-900 text-white hover:bg-black font-bold text-xs px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg">
                    <Download className="w-4 h-4" /> Imprimer / Exporter PDF
                  </button>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white text-black p-4 md:p-8 rounded-2xl shadow-2xl mx-auto w-full max-w-5xl font-serif print:shadow-none print:p-0"
                >
                  {synthesisData.isAnnual ? (
                    <>
                      <div className="text-center mb-8">
                        <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest border border-black p-2 inline-block">
                          BILAN ANNUEL - DÉCISIONS DE PASSAGE
                        </h1>
                        {synthesisData.classData && (
                          <p className="mt-2 text-sm font-bold uppercase">CLASSE : {synthesisData.classData.name}</p>
                        )}
                        <p className="mt-1 text-xs text-red-600 font-bold uppercase">
                          Moyenne de passage : {synthesisData.passThreshold}
                        </p>
                      </div>

                      <table className="w-full text-center border-collapse border border-black mb-8 text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-black p-2 font-bold w-12">N°</th>
                            <th className="border border-black p-2 font-bold text-left">PRÉNOMS ET NOM</th>
                            <th className="border border-black p-2 font-bold w-12">SEXE</th>
                            <th className="border border-black p-2 font-bold">1er TRIM</th>
                            <th className="border border-black p-2 font-bold">2e TRIM</th>
                            <th className="border border-black p-2 font-bold">3e TRIM</th>
                            <th className="border border-black p-2 font-bold bg-blue-50">MOY. ANNUELLE</th>
                            <th className="border border-black p-2 font-bold">RANG</th>
                            <th className="border border-black p-2 font-bold">DÉCISION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {synthesisData.studentsData.map((s: any, idx: number) => (
                            <tr key={s.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}>
                              <td className="border border-black p-2 text-xs">{idx + 1}</td>
                              <td className="border border-black p-2 font-bold text-left text-xs uppercase">{s.firstName} {s.lastName}</td>
                              <td className="border border-black p-2 text-xs">{s.gender}</td>
                              <td className="border border-black p-2 text-xs">{s.t1 !== null ? s.t1 : "-"}</td>
                              <td className="border border-black p-2 text-xs">{s.t2 !== null ? s.t2 : "-"}</td>
                              <td className="border border-black p-2 text-xs">{s.t3 !== null ? s.t3 : "-"}</td>
                              <td className="border border-black p-2 text-xs font-bold bg-blue-50/50">{s.annualAvg !== null ? s.annualAvg : "-"}</td>
                              <td className="border border-black p-2 text-xs">{s.rank || "-"}</td>
                              <td className={cn(
                                "border border-black p-2 text-xs font-bold uppercase",
                                s.decision === "Passe" ? "text-emerald-600" : (s.decision === "Redouble" ? "text-red-600" : "")
                              )}>
                                {s.decision || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  ) : (
                    <>
                      <div className="text-center mb-8">
                        <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest border border-black p-2 inline-block">
                          RAPPORT DE L'ÉVALUATION DU {synthesisData.term.replace('_', ' ')}
                        </h1>
                      </div>

                      <h2 className="text-lg font-black uppercase mb-4 flex items-center gap-2">A. Synthèse des résultats</h2>
                      <table className="w-full text-center border-collapse border border-black mb-8 text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-black p-2 font-bold" rowSpan={2}>Sexe</th>
                            <th className="border border-black p-2 font-bold" rowSpan={2}>Effectif de la classe</th>
                            <th className="border border-black p-2 font-bold" rowSpan={2}>Ont composé</th>
                            <th className="border border-black p-2 font-bold" rowSpan={2}>Moyenne de la classe</th>
                            <th className="border border-black p-2 font-bold" colSpan={2}>Ont obtenu la moyenne</th>
                          </tr>
                          <tr className="bg-gray-100">
                            <th className="border border-black p-2 font-bold">Nbre</th>
                            <th className="border border-black p-2 font-bold">Taux</th>
                          </tr>
                        </thead>
                        <tbody>
                          {synthesisData.synthesisResult.map((res: any, idx: number) => (
                            <tr key={idx} className={res.sexe === "Total" ? "bg-green-50 font-bold" : ""}>
                              <td className="border border-black p-2">{res.sexe}</td>
                              <td className="border border-black p-2">{res.effectif}</td>
                              <td className="border border-black p-2">{res.ontCompose}</td>
                              <td className="border border-black p-2">{res.moyenne}</td>
                              <td className="border border-black p-2">{res.nbreMoyenne}</td>
                              <td className="border border-black p-2">{res.tauxMoyenne}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <h2 className="text-lg font-black uppercase mb-4 flex items-center gap-2 mt-12">B. Taux de réussite des élèves par discipline</h2>
                      <table className="w-full text-center border-collapse border border-black text-xs">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-black p-2 font-bold" rowSpan={2}>DISCIPLINES</th>
                            <th className="border border-black p-2 font-bold" rowSpan={2}>Niveau de Maîtrise &gt;</th>
                            <th className="border border-black p-2 font-bold text-red-600" rowSpan={2}>[ 0-25% [</th>
                            <th className="border border-black p-2 font-bold text-orange-600" rowSpan={2}>[ 25-50% [</th>
                            <th className="border border-black p-2 font-bold text-yellow-600" rowSpan={2}>[ 50-75% [</th>
                            <th className="border border-black p-2 font-bold text-green-600" rowSpan={2}>[ 75%-100% ]</th>
                          </tr>
                        </thead>
                        <tbody>
                          {synthesisData.subjectSuccessRates.map((s: any, idx: number) => (
                            <React.Fragment key={idx}>
                              <tr>
                                <td className="border border-black p-2 font-bold text-left" rowSpan={2}>{s.subject}</td>
                                <td className="border border-black p-1 font-semibold bg-gray-50">Nombre</td>
                                <td className="border border-black p-1">{s.bins["0_25"].count}</td>
                                <td className="border border-black p-1">{s.bins["25_50"].count}</td>
                                <td className="border border-black p-1">{s.bins["50_75"].count}</td>
                                <td className="border border-black p-1">{s.bins["75_100"].count}</td>
                              </tr>
                              <tr className="bg-gray-50/50">
                                <td className="border border-black p-1 font-semibold bg-gray-50">Taux</td>
                                <td className="border border-black p-1">{s.bins["0_25"].rate}%</td>
                                <td className="border border-black p-1">{s.bins["25_50"].rate}%</td>
                                <td className="border border-black p-1">{s.bins["50_75"].rate}%</td>
                                <td className="border border-black p-1">{s.bins["75_100"].rate}%</td>
                              </tr>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Add Grade Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border/50 rounded-[2rem] p-6 shadow-2xl z-10"
            >
              <h2 className="text-xl font-black uppercase tracking-tight mb-6">Saisir une Note</h2>

              <form onSubmit={handleAddGrade} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Classe</label>
                    <select 
                      required
                      value={selectedClassId}
                      onChange={(e) => { setSelectedClassId(e.target.value); setSelectedStudentId(""); }}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    >
                      <option value="">Sélectionner...</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Trimestre</label>
                    <select 
                      required
                      value={selectedTerm}
                      onChange={(e) => setSelectedTerm(e.target.value)}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    >
                      {TERMS.map(t => (
                        <option key={t} value={t}>{t.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Élève</label>
                  <select 
                    required
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    disabled={!selectedClassId}
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 disabled:opacity-50"
                  >
                    <option value="">Sélectionner un élève...</option>
                    {selectedClass?.students.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Matière</label>
                    <select 
                      required
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    >
                      <option value="">Sélectionner...</option>
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (Coef: {s.coefficient})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Évaluation (Titre)</label>
                    <input 
                      required
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Devoir 1, Composition..."
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Note (sur 20)</label>
                  <input 
                    required
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    value={gradeValue}
                    onChange={(e) => setGradeValue(e.target.value)}
                    placeholder="Ex: 15.5"
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-xl font-black focus:outline-none focus:border-primary/50 text-primary"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-xl border border-border/50 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={isAdding}
                    className="flex-[2] py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isAdding ? <Clock className="w-4 h-4 animate-spin" /> : "Enregistrer Note"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
