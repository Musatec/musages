"use client";

import { useState } from "react";
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
import { addGrade, getStudentReportCard } from "@/lib/actions/grades";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface GradesClientProps {
  classes: any[];
  subjects: any[];
  recentGrades: any[];
  schoolName: string;
}

const TERMS = ["TRIMESTRE_1", "TRIMESTRE_2", "TRIMESTRE_3", "SEMESTRE_1", "SEMESTRE_2"];

export function GradesClient({ 
  classes, 
  subjects, 
  recentGrades: initialRecentGrades,
  schoolName
}: GradesClientProps) {
  const [activeTab, setActiveTab] = useState<"SAISIE" | "BULLETINS">("SAISIE");
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
    }
    setIsGenerating(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic">Notes & Bulletins / الدرجات</h1>
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
            <div className="overflow-x-auto">
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
          </div>
        </div>
      )}

      {activeTab === "BULLETINS" && (
        <div className="space-y-6">
          <div className="bg-card border border-border/50 p-6 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
            <button 
              onClick={handleGenerateReport}
              disabled={!reportStudentId || isGenerating}
              className="w-full bg-primary text-black font-black uppercase tracking-widest text-[11px] px-6 py-3.5 rounded-xl shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? <Clock className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Générer Bulletin
            </button>
          </div>

          {/* Bulletin Preview */}
          <AnimatePresence>
            {reportData && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white text-black p-8 rounded-2xl shadow-2xl mx-auto max-w-4xl min-h-[800px] font-serif relative"
              >
                {/* PDF Download Button (Absolute positioning over the preview) */}
                <button className="absolute top-8 right-8 bg-gray-900 text-white hover:bg-black font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-all print:hidden">
                  <Download className="w-4 h-4" /> Télécharger PDF
                </button>

                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-gray-300 pb-6 mb-6">
                  <div className="w-1/3">
                    <h2 className="font-black text-xl uppercase tracking-tighter">{schoolName}</h2>
                    <p className="text-xs text-gray-600 mt-1">SaaS de Gestion Scolaire Franco-Arabe</p>
                    <p className="text-xs text-gray-500 italic">Année Scolaire 2025-2026</p>
                  </div>
                  <div className="w-1/3 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-2 border border-gray-200 shadow-inner">
                      <GraduationCap className="w-10 h-10 text-gray-400" />
                    </div>
                  </div>
                  <div className="w-1/3 text-right" dir="rtl">
                    <h2 className="font-black text-2xl" style={{ fontFamily: 'Amiri, serif' }}>{schoolName}</h2>
                    <p className="text-sm text-gray-600 mt-1" style={{ fontFamily: 'Amiri, serif' }}>برنامج الإدارة المدرسية الفرنسي العربي</p>
                    <p className="text-xs text-gray-500 italic">العام الدراسي ٢٠٢٥-٢٠٢٦</p>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-black uppercase tracking-widest">Bulletin de Notes</h1>
                  <h2 className="text-2xl font-bold text-gray-500" dir="rtl" style={{ fontFamily: 'Amiri, serif' }}>كشف الدرجات - {reportData.term.replace('_', ' ')}</h2>
                </div>

                {/* Student Info */}
                <div className="flex justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8 text-sm">
                  <div className="space-y-1">
                    <p><span className="font-bold text-gray-500">Prénom & Nom :</span> <span className="font-black text-lg">{reportData.student.firstName} {reportData.student.lastName}</span></p>
                    <p><span className="font-bold text-gray-500">Matricule :</span> {reportData.student.matricule}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p><span className="font-black text-lg">{reportClass?.name}</span> <span className="font-bold text-gray-500">: Classe</span></p>
                    <p>{reportData.student.gender === 'M' ? 'Garçon' : 'Fille'} <span className="font-bold text-gray-500">: Sexe</span></p>
                  </div>
                </div>

                {/* Grades Table */}
                <table className="w-full text-left border-collapse mb-8">
                  <thead>
                    <tr className="bg-gray-100 border-y-2 border-gray-300">
                      <th className="py-3 px-4 font-bold text-sm uppercase">Matière / المادة</th>
                      <th className="py-3 px-4 font-bold text-sm text-center uppercase">Coef</th>
                      <th className="py-3 px-4 font-bold text-sm text-right uppercase">Moyenne / ٢٠</th>
                      <th className="py-3 px-4 font-bold text-sm text-right uppercase">Moy. Pondérée</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reportData.subjectSummaries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-gray-500 italic">Aucune note enregistrée pour ce trimestre.</td>
                      </tr>
                    ) : (
                      reportData.subjectSummaries.map((s: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-bold text-gray-800">{s.subjectName}</td>
                          <td className="py-3 px-4 text-center font-mono text-gray-600">{s.coefficient}</td>
                          <td className="py-3 px-4 text-right font-black text-gray-900">
                            {s.averageOn20.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-gray-600">
                            {s.weightedAverage.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {reportData.subjectSummaries.length > 0 && (
                    <tfoot className="bg-gray-50 border-y-2 border-gray-300">
                      <tr>
                        <td className="py-4 px-4 font-black uppercase text-sm">Totaux & Moyenne Générale</td>
                        <td className="py-4 px-4 text-center font-black">{reportData.grandTotalCoefficients}</td>
                        <td colSpan={2} className="py-4 px-4 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-gray-500 text-xs font-bold uppercase mb-1">Moyenne du Trimestre</span>
                            <span className={cn(
                              "text-3xl font-black px-4 py-1 rounded-lg border-2",
                              reportData.overallAverage >= 10 ? "text-emerald-700 border-emerald-200 bg-emerald-50" : "text-red-700 border-red-200 bg-red-50"
                            )}>
                              {reportData.overallAverage.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} / 20
                            </span>
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>

                {/* Footer Info */}
                {reportData.subjectSummaries.length > 0 && (
                  <div className="flex justify-between items-center border-t-2 border-gray-300 pt-6">
                    <div>
                      <p className="font-bold text-gray-500 uppercase text-xs tracking-widest mb-1">Mention / التقدير</p>
                      <p className="font-black text-xl text-gray-900">{reportData.mention}</p>
                    </div>
                    <div className="text-center w-64">
                      <p className="font-bold text-gray-500 uppercase text-xs tracking-widest mb-8">Le Directeur / المدير</p>
                      <div className="border-b border-gray-400 border-dashed pb-2 text-gray-300 italic text-sm">Signature & Cachet</div>
                    </div>
                  </div>
                )}
              </motion.div>
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
              <h2 className="text-xl font-black uppercase tracking-tight italic mb-6">Saisir une Note</h2>

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
