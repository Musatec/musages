"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  UsersRound, 
  Briefcase, 
  Plus, 
  Trash2, 
  CreditCard,
  Banknote,
  Search,
  BookOpen
} from "lucide-react";
import { addTeacher, deleteTeacher, payTeacher } from "@/lib/actions/teachers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TeachersClientProps {
  teachers: any[];
  recentPayments: any[];
}

export function TeachersClient({ teachers: initialTeachers, recentPayments: initialPayments }: TeachersClientProps) {
  const [activeTab, setActiveTab] = useState<"TEACHERS" | "PAYMENTS">("TEACHERS");
  const [search, setSearch] = useState("");
  
  // Teacher state
  const [showAddModal, setShowAddModal] = useState(false);
  const [teacherForm, setTeacherForm] = useState({ 
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

  const filteredTeachers = initialTeachers.filter(t => 
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic">Enseignants & Vacations / المعلمون</h1>
          <p className="text-sm text-muted-foreground">Gestion du corps professoral et de la paie.</p>
        </div>
        <div className="flex bg-card p-1 rounded-2xl border border-border/50">
          <button 
            onClick={() => setActiveTab("TEACHERS")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === "TEACHERS" ? "bg-primary text-black shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            Enseignants
          </button>
          <button 
            onClick={() => setActiveTab("PAYMENTS")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
              activeTab === "PAYMENTS" ? "bg-primary text-black shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted/50"
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
              <button 
                onClick={() => setShowPayModal(true)}
                className="bg-card hover:bg-muted border border-border/50 text-foreground font-black uppercase text-[11px] px-6 py-3 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 tracking-widest flex-1"
              >
                <Banknote className="w-4 h-4" /> Payer Salaire
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-primary hover:bg-primary/90 text-black font-black uppercase text-[11px] px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 tracking-widest flex-1"
              >
                <Plus className="w-4 h-4" /> Nouveau Prof
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
                <UsersRound className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Aucun enseignant trouvé.</p>
              </div>
            ) : (
              filteredTeachers.map((t) => (
                <div key={t.id} className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative">
                  <button 
                    onClick={() => handleDeleteTeacher(t.id, t.lastName)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xl uppercase shrink-0">
                      {t.firstName[0]}{t.lastName[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-xl uppercase tracking-tight leading-tight">{t.lastName}</h3>
                      <h4 className="font-bold text-muted-foreground">{t.firstName}</h4>
                    </div>
                  </div>
                  
                  <div className="space-y-3 border-t border-border/50 pt-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2"><BookOpen className="w-4 h-4" /> Matière(s)</span>
                      <span className="font-bold">{t.mainSubject || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4" /> Contrat</span>
                      <span className={cn("font-black text-[10px] uppercase tracking-wider px-2 py-1 rounded-md", t.contractType === "FIXE" ? "bg-blue-500/10 text-blue-500" : "bg-amber-500/10 text-amber-500")}>
                        {t.contractType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-2"><CreditCard className="w-4 h-4" /> Taux / Salaire</span>
                      <span className="font-bold text-emerald-500">{t.hourlyRate.toLocaleString('fr-FR')} FCFA{t.contractType === 'VACATAIRE' ? '/h' : '/mois'}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "PAYMENTS" && (
        <div className="space-y-6">
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/20 flex justify-between items-center">
              <h2 className="font-bold text-sm">Historique des Paiements de Salaires</h2>
              <button 
                onClick={() => setShowPayModal(true)}
                className="text-xs font-bold text-primary hover:underline"
              >
                + Nouveau Paiement
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold text-right">Montant Versé</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {initialPayments.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                        Aucun paiement enregistré.
                      </td>
                    </tr>
                  ) : (
                    initialPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-all">
                        <td className="px-6 py-4 font-mono text-xs">
                          {new Date(p.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-medium">{p.description}</td>
                        <td className="px-6 py-4 text-right font-black text-red-500">
                          - {p.amount.toLocaleString('fr-FR')} FCFA
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
              <h2 className="text-xl font-black uppercase tracking-tight italic mb-6">Ajouter un Enseignant</h2>
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
              <h2 className="text-xl font-black uppercase tracking-tight italic mb-6">Enregistrer un Paiement</h2>
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
                    {initialTeachers.map(t => (
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
    </div>
  );
}
