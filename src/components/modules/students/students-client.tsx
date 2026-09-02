"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  UserPlus, 
  FileSpreadsheet,
  Phone,
  BookOpen,
  GraduationCap,
  Sparkles,
  Award
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

  // Form State avec attributs spécifiques Daara Ibnoul Khayim
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "M",
    classId: "",
    hizbLevel: "0",
    regime: "INTERNE",
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
      "Halqa": s.class?.name || 'Non assigné',
      "Parent / Tuteur": s.parentName,
      "Téléphone WhatsApp": s.parentPhone
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Talibes_Ibnoul_Khayim");
    XLSX.writeFile(wb, "liste_talibes_ibnoul_khayim.xlsx");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast.loading("Inscription du talibé en cours...");

    const res = await createStudent(formData);
    toast.dismiss();

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Talibé inscrit avec succès au Daara Ibnoul Khayim !");
      setShowAddModal(false);
      setFormData({
        firstName: "",
        lastName: "",
        gender: "M",
        classId: "",
        hizbLevel: "0",
        regime: "INTERNE",
        parentName: "",
        parentPhone: "",
        parentEmail: ""
      });
      setTimeout(() => window.location.reload(), 1000);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">
            École Ibnoul Khayim Al Jawziya — مدرسة ابن القيم الجوزية
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0A192F] font-classic tracking-tight mt-1">
            Gestion des Talibés & Effectifs
          </h1>
          <p className="text-xs md:text-sm text-slate-600 font-medium">
            Registre officiel des apprenants, suivi du niveau de mémorisation et affectation aux Halqas.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-[#0A192F] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#0C5A34]" /> Export Excel
          </button>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0C5A34] hover:bg-[#06381F] text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-[#FFE57F]" /> Inscrire un Talibé
          </button>
        </div>
      </div>

      {/* Barre de Recherche & Filtres */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        <div className="flex-1">
          <label className="text-[11px] font-extrabold uppercase tracking-widest text-[#0C5A34] mb-1.5 block">
            Halqa d'Étude / الحلقة
          </label>
          <select 
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full bg-[#FAFAF7] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
          >
            <option value="">Toutes les Halqas du Daara</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex-[2] relative flex flex-col justify-end">
          <label className="text-[11px] font-extrabold uppercase tracking-widest text-[#0C5A34] mb-1.5 block">
            Recherche Talibé / البحث
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher par nom, prénom, matricule..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FAFAF7] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
            />
          </div>
        </div>
      </div>

      {/* Grille des Cartes Talibés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 bg-white border-2 border-dashed border-slate-200 rounded-2xl">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-semibold">Aucun talibé trouvé dans le registre.</p>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-[#0C5A34] hover:shadow-md transition-all group relative overflow-hidden">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0C5A34] to-[#127844] text-white flex items-center justify-center font-extrabold text-base border border-[#D4AF37]/40 shadow-xs">
                  {student.firstName[0]}{student.lastName[0]}
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-bold">{student.matricule}</span>
                  <div className="text-xs font-bold text-[#0C5A34] mt-1">{student.class?.name || 'Sans Halqa'}</div>
                </div>
              </div>

              <h3 className="font-bold text-base text-[#0A192F] leading-tight">{student.firstName}</h3>
              <h3 className="font-extrabold text-lg text-[#0C5A34] uppercase tracking-tight mb-3">{student.lastName}</h3>
              
              <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Hizb Actuel :
                  </span>
                  <span className="font-bold text-[#0A192F] bg-amber-50 text-[#B8860B] px-2 py-0.5 rounded-md">
                    {student.hizbLevel || 0} / 60 Hizbs
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Tuteur :
                  </span>
                  <span className="font-medium text-slate-800 truncate max-w-[120px]">{student.parentName}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-[#0C5A34]" />
                    WhatsApp :
                  </span>
                  <span className="font-semibold text-slate-800">{student.parentPhone}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Nouvelle Inscription */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">
                    Daara Ibnoul Khayim Al Diawziya
                  </p>
                  <h2 className="text-2xl font-extrabold text-[#0A192F] font-classic">
                    Inscription d'un Nouveau Talibé
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Renseignez l'identité du talibé, le niveau de mémorisation et le contact du tuteur.
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#0C5A34]">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A192F] mb-1.5 block">Prénom du Talibé *</label>
                    <input 
                      required
                      type="text"
                      placeholder="Ex: Mouhamadou"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-[#FAFAF7] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A192F] mb-1.5 block">Nom de Famille *</label>
                    <input 
                      required
                      type="text"
                      placeholder="Ex: Ndiaye"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-[#FAFAF7] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C5A34] uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A192F] mb-1.5 block">Genre *</label>
                    <select 
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full bg-[#FAFAF7] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
                    >
                      <option value="M">Garçon (طالب)</option>
                      <option value="F">Fille (طالبة)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A192F] mb-1.5 block">Halqa d'Étude *</label>
                    <select 
                      required
                      value={formData.classId}
                      onChange={(e) => setFormData({...formData, classId: e.target.value})}
                      className="w-full bg-[#FAFAF7] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
                    >
                      <option value="">Sélectionner une Halqa...</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A192F] mb-1.5 block">Hizb Actuel (0 à 60)</label>
                    <input 
                      type="number"
                      min={0}
                      max={60}
                      placeholder="Ex: 5"
                      value={formData.hizbLevel}
                      onChange={(e) => setFormData({...formData, hizbLevel: e.target.value})}
                      className="w-full bg-[#FAFAF7] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#0C5A34] mb-3">Informations du Tuteur / Parent</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A192F] mb-1.5 block">Nom complet du parent *</label>
                      <input 
                        required
                        type="text"
                        placeholder="Ex: El Hadji Ndiaye"
                        value={formData.parentName}
                        onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                        className="w-full bg-[#FAFAF7] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A192F] mb-1.5 block">Téléphone (WhatsApp) *</label>
                        <input 
                          required
                          type="tel"
                          placeholder="+221 77 000 00 00"
                          value={formData.parentPhone}
                          onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                          className="w-full bg-[#FAFAF7] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0A192F] mb-1.5 block">Email (Optionnel)</label>
                        <input 
                          type="email"
                          placeholder="parent@gmail.com"
                          value={formData.parentEmail}
                          onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                          className="w-full bg-[#FAFAF7] border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-300 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all"
                  >
                    Annuler
                  </button>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] py-3 rounded-xl bg-[#0C5A34] text-white text-xs font-extrabold uppercase tracking-wider hover:bg-[#06381F] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? "Inscription..." : "Valider l'Inscription au Daara"}
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
