"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Trash2, 
  Banknote,
  Search,
  Pencil,
  Loader2
} from "lucide-react";
import { addTeacher, updateTeacher, deleteTeacher, payTeacher } from "@/lib/actions/teachers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ImportExcelModal } from "@/components/modules/common/import-excel-modal";

import { useSpace } from "@/components/providers/space-provider";

interface TeacherItem {
  id: string;
  name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  mainSubject?: string | null;
  contractType?: string | null;
  hourlyRate?: number | null;
}

interface PaymentItem {
  id: string;
  createdAt: string | Date;
  description?: string | null;
  amount: number;
}

interface TeachersClientProps {
  teachers: TeacherItem[];
  recentPayments: PaymentItem[];
}

function normalizeTeacher(teacher: TeacherItem) {
  const parts = (teacher.name || "").trim().split(/\s+/).filter(Boolean);
  const firstName = teacher.firstName || parts[0] || "Oustaz";
  const lastName = teacher.lastName || parts.slice(1).join(" ") || "";
  return {
    ...teacher,
    firstName,
    lastName,
    mainSubject: teacher.mainSubject || null,
    contractType: teacher.contractType || "OUSTAZ",
    hourlyRate: Number(teacher.hourlyRate ?? 0),
  };
}

export function TeachersClient({ teachers: initialTeachers, recentPayments: initialPayments }: TeachersClientProps) {
  const { activeSpace } = useSpace();
  const isSchool = activeSpace === "school";

  const teachersList = initialTeachers.map(normalizeTeacher);
  const paymentsList = initialPayments;

  const [activeTab, setActiveTab] = useState<"TEACHERS" | "PAYMENTS">("TEACHERS");
  const [search, setSearch] = useState("");
  
  // Teacher state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [teacherForm, setTeacherForm] = useState({ 
    firstName: "", 
    lastName: "", 
    phone: "", 
    email: "", 
    mainSubject: "", 
    contractType: "VACATAIRE", 
    hourlyRate: "" 
  });
  const [editTeacherForm, setEditTeacherForm] = useState({ 
    firstName: "", 
    lastName: "", 
    phone: "", 
    email: "", 
    mainSubject: "", 
    contractType: "VACATAIRE", 
    hourlyRate: "" 
  });
  const [isSubmittingTeacher, setIsSubmittingTeacher] = useState(false);

  // Payment state
  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm, setPayForm] = useState({ teacherId: "", amount: "", description: "Salaire du mois" });
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  const filteredTeachers = teachersList.filter((t) => 
    t.firstName.toLowerCase().includes(search.toLowerCase()) || 
    t.lastName.toLowerCase().includes(search.toLowerCase()) ||
    (t.mainSubject || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTeacher(true);
    toast.loading("Ajout de l'enseignant...");

    const res = await addTeacher({
      ...teacherForm,
      hourlyRate: Number(teacherForm.hourlyRate) || 0
    });
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Enseignant ajouté avec succès !");
      setShowAddModal(false);
      setTeacherForm({ firstName: "", lastName: "", phone: "", email: "", mainSubject: "", contractType: "VACATAIRE", hourlyRate: "" });
      setTimeout(() => window.location.reload(), 1000);
    }
    setIsSubmittingTeacher(false);
  };

  const handlePayTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payForm.teacherId || !payForm.amount) {
      toast.error("Veuillez sélectionner un enseignant et saisir un montant.");
      return;
    }
    
    setIsSubmittingPay(true);
    toast.loading("Enregistrement du paiement...");

    const res = await payTeacher({
      teacherId: payForm.teacherId,
      amount: Number(payForm.amount),
      description: payForm.description
    });
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Paiement enregistré avec succès !");
      setShowPayModal(false);
      setPayForm({ teacherId: "", amount: "", description: "Salaire du mois" });
      setTimeout(() => window.location.reload(), 1000);
    }
    setIsSubmittingPay(false);
  };

  const handleOpenEditTeacher = (teacher: any) => {
    setEditingTeacher(teacher);
    setEditTeacherForm({
      firstName: teacher.firstName || "",
      lastName: teacher.lastName || "",
      phone: teacher.phone || "",
      email: teacher.email || "",
      mainSubject: teacher.mainSubject || "",
      contractType: teacher.contractType || "VACATAIRE",
      hourlyRate: String(teacher.hourlyRate || "")
    });
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    setIsSubmittingTeacher(true);
    toast.loading("Mise à jour...");

    const res = await updateTeacher(editingTeacher.id, {
      ...editTeacherForm,
      hourlyRate: Number(editTeacherForm.hourlyRate) || 0
    });
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Fiche enseignant modifiée avec succès !");
      setEditingTeacher(null);
      setTimeout(() => window.location.reload(), 800);
    }
    setIsSubmittingTeacher(false);
  };

  const handleDeleteTeacher = async (id: string, name: string) => {
    if (confirm(`Voulez-vous vraiment supprimer le profil de ${name} ?`)) {
      const res = await deleteTeacher(id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Enseignant supprimé.");
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
            {isSchool ? "Corps Enseignant Bilingue • École Pathé Pogne" : "Enseignants & Oustazs / المشايخ"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSchool ? "Gestion des professeurs (Français & Arabe), vacataires et émoluments." : "Gestion du corps professoral et de la paie du Daara."}
          </p>
        </div>
        <div className="flex bg-card p-1 rounded-2xl border border-border/50">
          <button 
            onClick={() => setActiveTab("TEACHERS")}
            className={cn(
              "px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === "TEACHERS" 
                ? (isSchool ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-extrabold shadow-md" : "bg-primary text-black shadow-md shadow-primary/20") 
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            Enseignants
          </button>
          <button 
            onClick={() => setActiveTab("PAYMENTS")}
            className={cn(
              "px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === "PAYMENTS" 
                ? (isSchool ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-extrabold shadow-md" : "bg-primary text-black shadow-md shadow-primary/20") 
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            <Banknote className="w-4 h-4" /> Historique Paie
          </button>
        </div>
      </div>

      {activeTab === "TEACHERS" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 bg-card border border-border/50 p-4 rounded-2xl">
            <div className="flex-[2] relative flex flex-col justify-end">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Rechercher un professeur (nom, matière)..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-background border border-border/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <ImportExcelModal type="teachers" onSuccess={() => window.location.reload()} />
              <button 
                onClick={() => setShowPayModal(true)}
                className="bg-card hover:bg-muted border border-border/50 text-foreground font-black uppercase text-[11px] px-4 sm:px-6 py-3 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 tracking-widest flex-1"
              >
                <Banknote className="w-4 h-4" /> Payer Salaire
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-primary hover:bg-primary/90 text-black font-black uppercase text-[11px] px-4 sm:px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 tracking-widest flex-1"
              >
                <Plus className="w-4 h-4" /> Nouveau Prof
              </button>
            </div>
          </div>

          {/* --- REGISTRE EXCEL PRO DU CORPS ENSEIGNANT --- */}
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none">
            {/* Barre de Titre Feuille Excel */}
            <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs select-none">
              <div className="flex items-center gap-2">
                <span className="bg-[#107c41] text-white px-2 py-0.5 rounded font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
                  <span>XLSX</span>
                </span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  {isSchool ? "Feuille : Corps Enseignant • Bilingue" : "Feuille : Corps Professoral & Shuyukhs"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {filteredTeachers.length} {filteredTeachers.length > 1 ? "enseignants" : "enseignant"}
                </span>
              </div>
            </div>

            {/* Grille Excel */}
            <div className="w-full overflow-x-auto touch-pan-x">
              <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-[#107c41] text-white select-none">
                    <th className="w-12 text-center px-2 py-2 text-[10px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50">N°</th>
                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[180px]">
                      {isSchool ? "Enseignant (Nom & Prénom)" : "Oustaz / Enseignant"}
                    </th>
                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[140px]">Contact Téléphonique</th>
                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[150px]">
                      {isSchool ? "Discipline / Matière" : "Matière(s)"}
                    </th>
                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[110px] text-center">Type Contrat</th>
                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[140px] text-right">Rémunération</th>
                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-b border-emerald-600/50 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-muted-foreground border-b border-slate-200 dark:border-slate-700/80 italic bg-white dark:bg-slate-900">
                        Aucun enseignant trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((t, idx) => (
                      <tr 
                        key={t.id} 
                        className={cn(
                          "transition-colors hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                          idx % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-900/60" : "bg-white dark:bg-slate-900"
                        )}
                      >
                        <td className="w-12 text-center bg-[#f1f3f5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold border-r border-b border-slate-200 dark:border-slate-700/80 select-none">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] uppercase shrink-0 border",
                              isSchool ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-emerald-100 text-emerald-900 border-emerald-300"
                            )}>
                              {t.firstName[0]}{t.lastName[0]}
                            </span>
                            <span>{t.lastName} {t.firstName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 font-mono text-[11px] text-slate-600 dark:text-slate-400 border-r border-b border-slate-200 dark:border-slate-700/80">
                          {t.phone || t.email || "—"}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300 border-r border-b border-slate-200 dark:border-slate-700/80">
                          {t.mainSubject || "Généraliste"}
                        </td>
                        <td className="px-3 py-2 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                          <span className={cn(
                            "inline-block font-black text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border",
                            t.contractType === "FIXE" 
                              ? "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300" 
                              : "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300"
                          )}>
                            {t.contractType}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                          {t.hourlyRate.toLocaleString('fr-FR')} FCFA<span className="text-[10px] text-muted-foreground font-normal">{t.contractType === 'VACATAIRE' ? '/h' : '/m'}</span>
                        </td>
                        <td className="px-3 py-2 text-center border-b border-slate-200 dark:border-slate-700/80">
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              type="button"
                              onClick={() => handleOpenEditTeacher(t)}
                              className="p-1.5 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-all"
                              title="Modifier l'enseignant"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDeleteTeacher(t.id, t.lastName)}
                              className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-all"
                              title="Supprimer l'enseignant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Barre d'état Excel */}
            <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium select-none">
              <div className="flex items-center gap-3">
                <span className="font-bold text-emerald-800 dark:text-emerald-400">PRÊT</span>
                <span>•</span>
                <span>Affichage : {filteredTeachers.length} lignes</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span>Total Rémunération : <strong>{filteredTeachers.reduce((acc, t) => acc + (t.hourlyRate || 0), 0).toLocaleString('fr-FR')} FCFA</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "PAYMENTS" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-card p-4 rounded-2xl border border-border/50">
            <div>
              <h2 className="font-extrabold text-sm uppercase tracking-wide">
                {isSchool ? "Registre Officiel des Salaires Décaissés — École Pathé Pogne" : "Registre Officiel des Salaires Décaissés"}
              </h2>
              <p className="text-xs text-muted-foreground">Historique chronologique des émoluments et salaires versés.</p>
            </div>
            <button 
              onClick={() => setShowPayModal(true)}
              className="text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl bg-primary text-black hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              + Nouveau Paiement
            </button>
          </div>

          {/* --- REGISTRE EXCEL PRO DES PAIEMENTS --- */}
          <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none">
            {/* Barre de Titre Feuille Excel */}
            <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs select-none">
              <div className="flex items-center gap-2">
                <span className="bg-[#107c41] text-white px-2 py-0.5 rounded font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
                  <span>XLSX</span>
                </span>
                <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  {isSchool ? "Feuille : Registre Paie • École Pathé Pogne" : "Feuille : Registre Salaires Décaissés"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {paymentsList.length} règlements
                </span>
              </div>
            </div>

            {/* Grille Excel */}
            <div className="w-full overflow-x-auto touch-pan-x">
              <table className="w-full min-w-[650px] border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-[#107c41] text-white select-none">
                    <th className="w-12 text-center px-2 py-2 text-[10px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50">N°</th>
                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[130px]">Date d'Émission</th>
                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50">Libellé / Motif du Règlement</th>
                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-b border-emerald-600/50 text-right min-w-[140px]">Montant Versé</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentsList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted-foreground border-b border-slate-200 dark:border-slate-700/80 italic bg-white dark:bg-slate-900">
                        Aucun paiement enregistré pour le moment.
                      </td>
                    </tr>
                  ) : (
                    paymentsList.map((p, idx) => (
                      <tr 
                        key={p.id} 
                        className={cn(
                          "transition-all hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                          idx % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-900/60" : "bg-white dark:bg-slate-900"
                        )}
                      >
                        <td className="w-12 text-center bg-[#f1f3f5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold border-r border-b border-slate-200 dark:border-slate-700/80 select-none">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-slate-600 dark:text-slate-400 border-r border-b border-slate-200 dark:border-slate-700/80">
                          {new Date(p.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                          {p.description}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-red-600 dark:text-red-400 border-b border-slate-200 dark:border-slate-700/80">
                          - {p.amount.toLocaleString('fr-FR')} FCFA
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Barre d'état Excel */}
            <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium select-none">
              <div className="flex items-center gap-3">
                <span className="font-bold text-emerald-800 dark:text-emerald-400">PRÊT</span>
                <span>•</span>
                <span>Affichage : {paymentsList.length} décaissements</span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span>Total Décaissé : <strong className="text-red-600 dark:text-red-400">- {paymentsList.reduce((acc, p) => acc + (p.amount || 0), 0).toLocaleString('fr-FR')} FCFA</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add Teacher */}
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
              className="relative w-full max-w-2xl bg-card border border-border/50 rounded-[2rem] p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-black uppercase tracking-tight mb-6">Ajouter un Enseignant</h2>
              <form onSubmit={handleAddTeacher} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Prénom</label>
                    <input 
                      required
                      type="text"
                      value={teacherForm.firstName}
                      onChange={(e) => setTeacherForm({...teacherForm, firstName: e.target.value})}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nom</label>
                    <input 
                      required
                      type="text"
                      value={teacherForm.lastName}
                      onChange={(e) => setTeacherForm({...teacherForm, lastName: e.target.value})}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 uppercase"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Téléphone</label>
                    <input 
                      required
                      type="tel"
                      value={teacherForm.phone}
                      onChange={(e) => setTeacherForm({...teacherForm, phone: e.target.value})}
                      placeholder="+221..."
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Matière Principale</label>
                    <input 
                      type="text"
                      value={teacherForm.mainSubject}
                      onChange={(e) => setTeacherForm({...teacherForm, mainSubject: e.target.value})}
                      placeholder="Ex: Coran, Arabe, Maths..."
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Type de Contrat</label>
                    <select 
                      value={teacherForm.contractType}
                      onChange={(e) => setTeacherForm({...teacherForm, contractType: e.target.value})}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    >
                      <option value="VACATAIRE">Vacataire (Payé à l'heure)</option>
                      <option value="FIXE">Permanent (Salaire mensuel)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                      {teacherForm.contractType === 'VACATAIRE' ? 'Taux Horaire (FCFA)' : 'Salaire Mensuel (FCFA)'}
                    </label>
                    <input 
                      required
                      type="number"
                      min="0"
                      value={teacherForm.hourlyRate}
                      onChange={(e) => setTeacherForm({...teacherForm, hourlyRate: e.target.value})}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 rounded-xl border border-border/50 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all">Annuler</button>
                  <button type="submit" disabled={isSubmittingTeacher} className="flex-[2] py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Ajouter Profil</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Pay Teacher */}
      <AnimatePresence>
        {showPayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPayModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border/50 rounded-[2rem] p-6 shadow-2xl z-10"
            >
              <h2 className="text-xl font-black uppercase tracking-tight mb-6">Enregistrer un Paiement</h2>
              <form onSubmit={handlePayTeacher} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Enseignant</label>
                  <select 
                    required
                    value={payForm.teacherId}
                    onChange={(e) => setPayForm({...payForm, teacherId: e.target.value})}
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="">Sélectionner un professeur...</option>
                    {teachersList.map(t => (
                      <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.contractType})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Description du paiement</label>
                  <input 
                    required
                    type="text"
                    value={payForm.description}
                    onChange={(e) => setPayForm({...payForm, description: e.target.value})}
                    placeholder="Ex: Salaire de Novembre, Heures sup..."
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Montant Versé (FCFA)</label>
                  <input 
                    required
                    type="number"
                    min="1"
                    value={payForm.amount}
                    onChange={(e) => setPayForm({...payForm, amount: e.target.value})}
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-xl font-black text-red-500 focus:outline-none focus:border-primary/50"
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowPayModal(false)} className="flex-1 py-3 rounded-xl border border-border/50 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all">Annuler</button>
                  <button type="submit" disabled={isSubmittingPay} className="flex-[2] py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Valider le Paiement</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE MODIFICATION ENSEIGNANT */}
      <AnimatePresence>
        {editingTeacher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
              <h2 className="text-xl font-black uppercase tracking-tight mb-2">Modifier l&apos;Enseignant</h2>
              <p className="text-xs text-muted-foreground mb-6">Mettre à jour les coordonnées ou le statut de l&apos;enseignant</p>
              
              <form onSubmit={handleUpdateTeacher} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Prénom *</label>
                    <input 
                      required
                      type="text"
                      value={editTeacherForm.firstName}
                      onChange={(e) => setEditTeacherForm({...editTeacherForm, firstName: e.target.value})}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nom *</label>
                    <input 
                      required
                      type="text"
                      value={editTeacherForm.lastName}
                      onChange={(e) => setEditTeacherForm({...editTeacherForm, lastName: e.target.value})}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Téléphone *</label>
                    <input 
                      required
                      type="text"
                      value={editTeacherForm.phone}
                      onChange={(e) => setEditTeacherForm({...editTeacherForm, phone: e.target.value})}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Email</label>
                    <input 
                      type="email"
                      value={editTeacherForm.email}
                      onChange={(e) => setEditTeacherForm({...editTeacherForm, email: e.target.value})}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Discipline / Spécialité</label>
                    <input 
                      type="text"
                      value={editTeacherForm.mainSubject}
                      onChange={(e) => setEditTeacherForm({...editTeacherForm, mainSubject: e.target.value})}
                      placeholder="Ex: Arabe, Coran, Maths..."
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Type Contrat</label>
                    <select
                      value={editTeacherForm.contractType}
                      onChange={(e) => setEditTeacherForm({...editTeacherForm, contractType: e.target.value})}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    >
                      <option value="VACATAIRE">Vacataire</option>
                      <option value="FIXE">Permanent / Fixe</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setEditingTeacher(null)} className="flex-1 py-3 rounded-xl border border-border/50 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all">Annuler</button>
                  <button type="submit" disabled={isSubmittingTeacher} className="flex-[2] py-3 rounded-xl bg-blue-600 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">Enregistrer</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
