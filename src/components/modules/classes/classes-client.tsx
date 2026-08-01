"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Library, 
  BookOpen, 
  Plus, 
  Users, 
  Trash2, 
  CreditCard,
  Hash
} from "lucide-react";
import { addClass, deleteClass, addSubject, deleteSubject } from "@/lib/actions/classes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ClassesClientProps {
  classes: any[];
  subjects: any[];
}

export function ClassesClient({ classes: initialClasses, subjects: initialSubjects }: ClassesClientProps) {
  const [activeTab, setActiveTab] = useState<"CLASSES" | "SUBJECTS">("CLASSES");
  
  // Classes state
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [classForm, setClassForm] = useState({ name: "", description: "", level: "Primaire", tuitionFee: "" });
  const [isSubmittingClass, setIsSubmittingClass] = useState(false);

  // Subjects state
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "", coefficient: "1" });
  const [isSubmittingSubject, setIsSubmittingSubject] = useState(false);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingClass(true);
    toast.loading("Création de la classe...");

    const res = await addClass({
      ...classForm,
      tuitionFee: Number(classForm.tuitionFee) || 0
    });
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Classe créée !");
      setShowAddClassModal(false);
      setClassForm({ name: "", description: "", level: "Primaire", tuitionFee: "" });
      setTimeout(() => window.location.reload(), 1000);
    }
    setIsSubmittingClass(false);
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSubject(true);
    toast.loading("Création de la matière...");

    const res = await addSubject({
      ...subjectForm,
      coefficient: Number(subjectForm.coefficient) || 1
    });
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Matière ajoutée !");
      setShowAddSubjectModal(false);
      setSubjectForm({ name: "", code: "", coefficient: "1" });
      setTimeout(() => window.location.reload(), 1000);
    }
    setIsSubmittingSubject(false);
  };

  const handleDeleteClass = async (id: string, name: string) => {
    if (confirm(`Voulez-vous vraiment supprimer la classe ${name} ?`)) {
      const res = await deleteClass(id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Classe supprimée.");
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (confirm(`Voulez-vous vraiment supprimer la matière ${name} ?`)) {
      const res = await deleteSubject(id);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Matière supprimée.");
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight italic">Classes & Matières / الفصول والمواد</h1>
          <p className="text-sm text-muted-foreground">Configuration pédagogique de l'établissement.</p>
        </div>
        <div className="flex bg-card p-1 rounded-2xl border border-border/50">
          <button 
            onClick={() => setActiveTab("CLASSES")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === "CLASSES" ? "bg-primary text-black shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            Classes
          </button>
          <button 
            onClick={() => setActiveTab("SUBJECTS")}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === "SUBJECTS" ? "bg-primary text-black shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            Matières
          </button>
        </div>
      </div>

      {activeTab === "CLASSES" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={() => setShowAddClassModal(true)}
              className="bg-primary hover:bg-primary/90 text-black font-black uppercase text-[11px] px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 tracking-widest"
            >
              <Plus className="w-4 h-4" /> Nouvelle Classe
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {initialClasses.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
                <Library className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Aucune classe configurée.</p>
              </div>
            ) : (
              initialClasses.map((c) => (
                <div key={c.id} className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative">
                  <button 
                    onClick={() => handleDeleteClass(c.id, c.name)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Library className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-2xl uppercase tracking-tight mb-1">{c.name}</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">{c.level || "Non défini"}</p>
                  
                  <div className="space-y-3 border-t border-border/50 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4" /> Effectif</span>
                      <span className="font-bold">{c._count.students} élèves</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2"><CreditCard className="w-4 h-4" /> Écolage</span>
                      <span className="font-bold">{c.tuitionFee.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "SUBJECTS" && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button 
              onClick={() => setShowAddSubjectModal(true)}
              className="bg-primary hover:bg-primary/90 text-black font-black uppercase text-[11px] px-6 py-3 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 tracking-widest"
            >
              <Plus className="w-4 h-4" /> Nouvelle Matière
            </button>
          </div>

          <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Matière</th>
                  <th className="px-6 py-4 font-semibold">Code</th>
                  <th className="px-6 py-4 font-semibold text-center">Coefficient</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {initialSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      Aucune matière configurée.
                    </td>
                  </tr>
                ) : (
                  initialSubjects.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/20 transition-all">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" /> {s.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground font-mono text-xs uppercase">
                          {s.code || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-black text-lg">
                        {s.coefficient}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteSubject(s.id, s.name)}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add Class */}
      <AnimatePresence>
        {showAddClassModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddClassModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border/50 rounded-[2rem] p-6 shadow-2xl z-10"
            >
              <h2 className="text-xl font-black uppercase tracking-tight italic mb-6">Nouvelle Classe</h2>
              <form onSubmit={handleAddClass} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nom de la classe</label>
                  <input 
                    required
                    type="text"
                    value={classForm.name}
                    onChange={(e) => setClassForm({...classForm, name: e.target.value})}
                    placeholder="Ex: CP, 6ème A..."
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Niveau d'enseignement</label>
                  <select 
                    value={classForm.level}
                    onChange={(e) => setClassForm({...classForm, level: e.target.value})}
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="Préscolaire">Préscolaire (Maternelle)</option>
                    <option value="Primaire">Primaire</option>
                    <option value="Collège">Collège (Moyen)</option>
                    <option value="Lycée">Lycée (Secondaire)</option>
                    <option value="Daara">Daara / Coranique</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Mensualité de base (Écolage)</label>
                  <div className="relative">
                    <input 
                      required
                      type="number"
                      min="0"
                      value={classForm.tuitionFee}
                      onChange={(e) => setClassForm({...classForm, tuitionFee: e.target.value})}
                      placeholder="Ex: 15000"
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 pr-16"
                    />
                    <span className="absolute right-4 top-[14px] text-xs font-bold text-muted-foreground">FCFA</span>
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowAddClassModal(false)} className="flex-1 py-3 rounded-xl border border-border/50 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all">Annuler</button>
                  <button type="submit" disabled={isSubmittingClass} className="flex-[2] py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Créer</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Add Subject */}
      <AnimatePresence>
        {showAddSubjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddSubjectModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border/50 rounded-[2rem] p-6 shadow-2xl z-10"
            >
              <h2 className="text-xl font-black uppercase tracking-tight italic mb-6">Nouvelle Matière</h2>
              <form onSubmit={handleAddSubject} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nom de la matière</label>
                  <input 
                    required
                    type="text"
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                    placeholder="Ex: Mathématiques, Arabe..."
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Code (Optionnel)</label>
                    <input 
                      type="text"
                      value={subjectForm.code}
                      onChange={(e) => setSubjectForm({...subjectForm, code: e.target.value})}
                      placeholder="Ex: MATH"
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 uppercase"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Coefficient</label>
                    <input 
                      required
                      type="number"
                      min="1"
                      value={subjectForm.coefficient}
                      onChange={(e) => setSubjectForm({...subjectForm, coefficient: e.target.value})}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowAddSubjectModal(false)} className="flex-1 py-3 rounded-xl border border-border/50 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all">Annuler</button>
                  <button type="submit" disabled={isSubmittingSubject} className="flex-[2] py-3 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Ajouter</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
