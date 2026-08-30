"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  UserPlus, 
  FileSpreadsheet,
  FileDown,
  Phone,
  Mail,
  GraduationCap
} from "lucide-react";
import { createStudent } from "@/lib/actions/students";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";

interface StudentsClientProps {
  classes: any[];
  students: any[];
}

export function StudentsClient({ classes, students: initialStudents }: StudentsClientProps) {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "M",
    classId: "",
    parentName: "",
    parentPhone: "",
    parentEmail: ""
  });

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.firstName.toLowerCase().includes(search.toLowerCase()) || 
                         s.lastName.toLowerCase().includes(search.toLowerCase()) ||
                         s.matricule.toLowerCase().includes(search.toLowerCase());
    const matchesClass = filterClass ? s.classId === filterClass : true;
    return matchesSearch && matchesClass;
  });

  const handleExportExcel = () => {
    const dataToExport = filteredStudents.map(s => ({
      "Matricule": s.matricule,
      "Nom": s.lastName,
      "Prénom": s.firstName,
      "Genre": s.gender === 'M' ? 'Garçon' : 'Fille',
      "Classe": s.class.name,
      "Parent": s.parentName,
      "Téléphone": s.parentPhone
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Élèves");
    XLSX.writeFile(wb, "liste_eleves.xlsx");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.loading("Inscription en cours...");

    const res = await createStudent(formData);
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Élève inscrit avec succès !");
      setShowAddModal(false);
      setFormData({
        firstName: "",
        lastName: "",
        gender: "M",
        classId: "",
        parentName: "",
        parentPhone: "",
        parentEmail: ""
      });
      // Mettre à jour l'état local ou recharger
      setTimeout(() => window.location.reload(), 1000);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Élèves & Inscriptions / الطلاب</h1>
          <p className="text-sm text-muted-foreground">Registre des effectifs et nouvelles inscriptions.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-card border border-border/50 hover:bg-muted text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2.5 rounded-xl bg-primary text-black text-xs font-bold uppercase tracking-widest transition-all hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Nouvel Élève
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-card border border-border/50 p-4 rounded-2xl">
        <div className="flex-1">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Classe / الصف</label>
          <select 
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="">Toutes les classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-[2] relative flex flex-col justify-end">
          <Search className="absolute left-3 top-[38px] w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Rechercher par nom, prénom, matricule..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Aucun élève trouvé.</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id} className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-lg uppercase">
                  {student.firstName[0]}{student.lastName[0]}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md">{student.matricule}</span>
                  <div className="text-xs font-bold text-primary mt-1">{student.class.name}</div>
                </div>
              </div>
              <h3 className="font-bold text-lg leading-tight mb-1">{student.firstName}</h3>
              <h3 className="font-black text-xl uppercase tracking-tight mb-4">{student.lastName}</h3>
              
              <div className="space-y-2 border-t border-border/50 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" /> <span className="truncate">{student.parentName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" /> {student.parentPhone}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Inscription */}
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
              className="relative w-full max-w-2xl bg-card border border-border/50 rounded-[2rem] p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Nouvelle Inscription</h2>
                  <p className="text-sm text-muted-foreground">Ajouter un élève à l'établissement.</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Prénom</label>
                    <input 
                      required
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nom</label>
                    <input 
                      required
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Genre</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    >
                      <option value="M">Garçon</option>
                      <option value="F">Fille</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Classe</label>
                    <select 
                      required
                      value={formData.classId}
                      onChange={(e) => setFormData({...formData, classId: e.target.value})}
                      className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    >
                      <option value="">Sélectionner une classe...</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <h3 className="font-bold mb-4">Informations du Tuteur / Parent</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Nom complet du parent</label>
                      <input 
                        required
                        type="text"
                        value={formData.parentName}
                        onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                        className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Numéro WhatsApp</label>
                        <input 
                          required
                          type="tel"
                          placeholder="+221..."
                          value={formData.parentPhone}
                          onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                          className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">Email (Optionnel)</label>
                        <input 
                          type="email"
                          value={formData.parentEmail}
                          onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                          className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 rounded-xl border border-border/50 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-4 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? "Inscription..." : "Valider l'Inscription"}
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
