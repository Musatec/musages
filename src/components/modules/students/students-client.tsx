"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  UserPlus, 
  FileSpreadsheet,
  Phone,
  Sparkles,
  Pencil,
  Trash2,
  Loader2
} from "lucide-react";
import { createStudent, updateStudent, deleteStudent } from "@/lib/actions/students";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImportExcelModal } from "@/components/modules/common/import-excel-modal";
import { useSpace } from "@/components/providers/space-provider";
import { useLocale, useTranslations } from "next-intl";

interface StudentsClientProps {
  classes: any[];
  students: any[];
}

export function StudentsClient({ classes, students: initialStudents }: StudentsClientProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations("Talibes");
  const tCommon = useTranslations("Common");
  const { activeSpace } = useSpace();
  const isSchool = activeSpace === "school";

  const [students, setStudents] = useState<any[]>(initialStudents);
  const [prevInitialStudents, setPrevInitialStudents] = useState(initialStudents);

  if (initialStudents !== prevInitialStudents) {
    setPrevInitialStudents(initialStudents);
    setStudents(initialStudents);
  }

  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [selectedYear, setSelectedYear] = useState("2026-2027");
  const [selectedTab, setSelectedTab] = useState<"ALL" | "GARCON" | "FILLE" | "INTERNE" | "EXTERNE" | "DEMI_PENSION">("ALL");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "M",
    classId: "",
    status: "EXTERNE",
    healthNotes: "",
    parentName: "",
    parentPhone: "",
    parentEmail: ""
  });

  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    gender: "M",
    classId: "",
    status: "EXTERNE",
    healthNotes: "",
    parentName: "",
    parentPhone: "",
    parentEmail: ""
  });

  // Calculate Headcount Stats
  const totalStudents = students.length;
  const countBoys = students.filter(s => s.gender === "M").length;
  const countGirls = students.filter(s => s.gender === "F").length;
  const countInternes = students.filter(s => s.status === "INTERNE").length;
  const countExternes = students.filter(s => s.status === "EXTERNE").length;
  const countDemiPension = students.filter(s => s.status === "DEMI_PENSION").length;

  const filteredStudents = students.filter(s => {
    const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
                         (s.matricule || "").toLowerCase().includes(search.toLowerCase()) ||
                         (s.parentPhone || "").includes(search);
    const matchesClass = filterClass ? (s.halqaId === filterClass || s.classId === filterClass) : true;
    
    let matchesTab = true;
    if (selectedTab === "GARCON") matchesTab = s.gender === "M";
    if (selectedTab === "FILLE") matchesTab = s.gender === "F";
    if (selectedTab === "INTERNE") matchesTab = s.status === "INTERNE";
    if (selectedTab === "EXTERNE") matchesTab = s.status === "EXTERNE";
    if (selectedTab === "DEMI_PENSION") matchesTab = s.status === "DEMI_PENSION";

    return matchesSearch && matchesClass && matchesTab;
  });

  const handleExportExcel = async () => {
    const dataToExport = filteredStudents.map(s => ({
      [t("matricule")]: s.matricule,
      [t("fullname")]: `${s.firstName} ${s.lastName}`,
      [t("gender")]: s.gender === 'M' ? (isAr ? 'ذكر' : 'Garçon') : (isAr ? 'أنثى' : 'Fille'),
      [t("regime")]: s.status === 'INTERNE' ? t("interne") : s.status === 'DEMI_PENSION' ? t("demi_pension") : t("externe"),
      [t("halqa")]: s.halqa?.name || s.class?.name || 'Non assigné',
      [t("parent_contact")]: s.parentName || 'N/A',
      "Téléphone WhatsApp": s.parentPhone || 'N/A'
    }));

    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Effectif_${selectedYear}`);
    XLSX.writeFile(wb, `effectif_${isSchool ? 'ecole_pathe_pogne' : 'daara'}_${selectedYear}.xlsx`);
    toast.success(isAr ? "تم تصدير ملف Excel بنجاح" : "Fichier Excel exporté avec succès !");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      toast.error(isAr ? "الاسم الأول واسم العائلة مطلوبان." : "Le prénom et le nom de l'élève sont obligatoires.");
      return;
    }

    setIsSubmitting(true);
    const res = await createStudent({
      ...formData,
      status: formData.status as any
    });

    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(isAr ? "تم تسجيل الطالب بنجاح! 🎉" : (isSchool ? "Élève inscrit avec succès à l'École Pathé Pogne ! 🎉" : "Talibé inscrit avec succès au Daara ! 🎉"));
      setShowAddModal(false);
      const newStudent = (res as any).talibe || (res as any).student;
      if (newStudent) {
        setStudents([newStudent, ...students]);
      }
      setFormData({
        firstName: "",
        lastName: "",
        gender: "M",
        classId: "",
        status: isSchool ? "EXTERNE" : "INTERNE",
        healthNotes: "",
        parentName: "",
        parentPhone: "",
        parentEmail: ""
      });
    }
  };

  const handleOpenEdit = (student: any) => {
    setEditingStudent(student);
    setEditFormData({
      firstName: student.firstName || "",
      lastName: student.lastName || "",
      gender: student.gender || "M",
      classId: student.classId || student.halqaId || "",
      status: student.status || (isSchool ? "EXTERNE" : "INTERNE"),
      healthNotes: student.healthNotes || "",
      parentName: student.parentName || "",
      parentPhone: student.parentPhone || "",
      parentEmail: student.parentEmail || ""
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!editFormData.firstName || !editFormData.lastName) {
      toast.error(isAr ? "الاسم الأول واسم العائلة مطلوبان." : "Le prénom et le nom sont obligatoires.");
      return;
    }

    setIsSubmitting(true);
    const res = await updateStudent(editingStudent.id, {
      ...editFormData,
      status: editFormData.status as any
    });
    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(isAr ? "تم تحديث بيانات الطالب بنجاح" : "Fiche élève mise à jour avec succès !");
      setStudents(students.map(s => s.id === editingStudent.id ? { ...s, ...editFormData } : s));
      setEditingStudent(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(isAr ? `هل أنت متأكد من حذف ${name}؟` : `Voulez-vous vraiment supprimer définitivement ${name} ?`)) {
      return;
    }

    setIsDeleting(id);
    const res = await deleteStudent(id);
    setIsDeleting(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(isAr ? "تم حذف الطالب بنجاح" : `${name} a été supprimé du registre.`);
      setStudents(students.filter(s => s.id !== id));
    }
  };

  return (
    <div className="space-y-3">
      {/* TOOLBAR COMPACTE PRO - SANS GRANDES CARTES */}
      <div className="bg-card border border-border rounded-xl p-3 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 border",
            isSchool ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
          )}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-black text-foreground">
                {isSchool ? (isAr ? "سجل التلاميذ • مدرسة باثي بوني" : "Effectif Général des Élèves") : t("title")}
              </h1>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded border",
                isSchool ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
              )}>
                {totalStudents} {isSchool ? "Élèves" : "Talibés"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {isSchool 
                ? "Registre officiel des élèves, répartition par classe et contact des parents" 
                : t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Barre de Filtres de Catégories & Recherche */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-muted/30 p-2 rounded-xl border border-border">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setSelectedTab("ALL")}
              className={cn("px-2.5 py-1 rounded-md text-xs font-bold uppercase shrink-0 transition-all", selectedTab === "ALL" ? (isSchool ? "bg-amber-600 text-white shadow-xs" : "bg-emerald-600 text-white shadow-xs") : "text-muted-foreground hover:bg-muted")}
            >
              {t("all")} ({totalStudents})
            </button>
            <button 
              onClick={() => setSelectedTab("GARCON")}
              className={cn("px-2.5 py-1 rounded-md text-xs font-bold uppercase shrink-0 transition-all", selectedTab === "GARCON" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
            >
              {t("boys")} ({countBoys})
            </button>
            <button 
              onClick={() => setSelectedTab("FILLE")}
              className={cn("px-2.5 py-1 rounded-md text-xs font-bold uppercase shrink-0 transition-all", selectedTab === "FILLE" ? "bg-pink-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
            >
              {t("girls")} ({countGirls})
            </button>
            <button 
              onClick={() => setSelectedTab("INTERNE")}
              className={cn("px-2.5 py-1 rounded-md text-xs font-bold uppercase shrink-0 transition-all", selectedTab === "INTERNE" ? "bg-amber-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
            >
              {t("interne")} ({countInternes})
            </button>
            <button 
              onClick={() => setSelectedTab("DEMI_PENSION")}
              className={cn("px-2.5 py-1 rounded-md text-xs font-bold uppercase shrink-0 transition-all", selectedTab === "DEMI_PENSION" ? "bg-purple-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
            >
              {t("demi_pension")} ({countDemiPension})
            </button>
            <button 
              onClick={() => setSelectedTab("EXTERNE")}
              className={cn("px-2.5 py-1 rounded-md text-xs font-bold uppercase shrink-0 transition-all", selectedTab === "EXTERNE" ? "bg-teal-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
            >
              {t("externe")} ({countExternes})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Year Selector */}
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-9 px-2.5 rounded-xl border border-input bg-background text-xs font-bold text-foreground shrink-0"
            >
              <option value="2026-2027">{isAr ? "٢٠٢٦ - ٢٠٢٧" : "2026 - 2027"}</option>
              <option value="2025-2026">{isAr ? "٢٠٢٥ - ٢٠٢٦" : "2025 - 2026"}</option>
              <option value="2024-2025">{isAr ? "٢٠٢٤ - ٢٠٢٥" : "2024 - 2025"}</option>
            </select>

            <Button onClick={handleExportExcel} variant="outline" className="text-xs font-bold gap-1.5 h-9 px-3 shrink-0">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> <span className="hidden sm:inline">{t("export_excel")}</span>
            </Button>

            <ImportExcelModal type="students" onSuccess={() => window.location.reload()} />

            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 shadow-md">
                  <UserPlus className="w-4 h-4" /> {t("register_talibe")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg font-bold font-arabic">
                    <UserPlus className="w-5 h-5 text-emerald-600" /> {t("register_talibe")}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-muted-foreground">{isAr ? "الاسم الأول *" : "Prénom *"}</label>
                      <Input 
                        placeholder={isAr ? "مثال: مصطفى" : "Ex: Moustapha"} 
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-muted-foreground">{isAr ? "اسم العائلة *" : "Nom *"}</label>
                      <Input 
                        placeholder={isAr ? "مثال: انضاي" : "Ex: Ndiaye"} 
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-muted-foreground">{t("gender")}</label>
                      <select 
                        value={formData.gender} 
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-semibold"
                      >
                        <option value="M">{isAr ? "ذكر" : "Garçon"}</option>
                        <option value="F">{isAr ? "أنثى" : "Fille"}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-muted-foreground">{t("regime")}</label>
                      <select 
                        value={formData.status} 
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-semibold"
                      >
                        <option value="INTERNE">{t("interne")}</option>
                        <option value="DEMI_PENSION">{t("demi_pension")}</option>
                        <option value="EXTERNE">{t("externe")}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-muted-foreground">{t("halqa")}</label>
                    <select 
                      value={formData.classId} 
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-semibold"
                    >
                      <option value="">{isAr ? "-- اختر الحلقة --" : "-- Sélectionner la Halqa --"}</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-muted-foreground">{isAr ? "اسم ولي الأمر" : "Nom du Parent / Tuteur"}</label>
                      <Input 
                        placeholder={isAr ? "مثال: الشيخ أمادو انضاي" : "Ex: Serigne Amadou Ndiaye"} 
                        value={formData.parentName}
                        onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase text-muted-foreground">{isAr ? "هاتف الواتساب" : "Téléphone WhatsApp Parent"}</label>
                      <Input 
                        placeholder="Ex: +221 77 000 00 00" 
                        value={formData.parentPhone}
                        onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                      {tCommon("cancel")}
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                      {isSubmitting ? tCommon("loading") : (isAr ? "حفظ وتأكيد" : "Valider l'Inscription")}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input 
            placeholder={t("search_placeholder")} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 text-sm bg-card border-border"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEUILLE DE CALCUL EXCEL PROFESSIONNELLE (BORDURES FINES, ALIGNEMENTS NETS) */}
      {/* ========================================================================= */}
      <div className="w-full overflow-hidden rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm print:border-none print:shadow-none">
        
        {/* BANDEAU SUPÉRIEUR FEUILLE EXCEL */}
        <div className="bg-slate-100 dark:bg-slate-800/90 px-4 py-2.5 border-b border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 font-bold text-slate-800 dark:text-slate-200">
            <div className="w-5 h-5 rounded bg-[#107c41] text-white flex items-center justify-center font-black text-[10px] shrink-0">
              X
            </div>
            <span className="font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              {isSchool ? "Feuille : Registre Général des Élèves • École Pathé Pogne" : "Feuille : Registre Matriculaire des Talibés • Daara Ibnoul Khayim"}
            </span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="text-slate-500 font-mono text-[11px]">Année Scolaire 2025/2026</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-2 py-0.5 rounded bg-[#107c41]/10 text-[#107c41] dark:text-emerald-400 border border-[#107c41]/30 font-bold">
              {filteredStudents.length} Lignes affichées
            </span>
          </div>
        </div>

        {/* TABLEAU GRILLE EXCEL (DÉFILEMENT HORIZONTAL FLUIDE) */}
        <div className="w-full overflow-x-auto touch-pan-x">
          <table className="w-full min-w-[850px] border-collapse text-left text-xs text-slate-800 dark:text-slate-200">
            <thead>
              <tr className="bg-[#107c41] text-white font-bold text-xs uppercase tracking-wider select-none">
                <th className="w-12 py-2.5 px-2 text-center border-r border-emerald-600/50 bg-[#0d6937] text-white/90 font-mono text-[11px]">
                  N°
                </th>
                <th className="w-32 py-2.5 px-3 text-center border-r border-emerald-600/50">
                  {isSchool ? "Matricule" : t("matricule")}
                </th>
                <th className="py-2.5 px-3 border-r border-emerald-600/50 min-w-[180px]">
                  {isSchool ? "Nom & Prénom" : t("fullname")}
                </th>
                <th className="w-20 py-2.5 px-2 text-center border-r border-emerald-600/50">
                  {t("gender")}
                </th>
                <th className="w-32 py-2.5 px-3 text-center border-r border-emerald-600/50">
                  {isSchool ? "Régime d'Écolage" : t("regime")}
                </th>
                <th className="py-2.5 px-3 border-r border-emerald-600/50 min-w-[140px]">
                  {isSchool ? "Classe" : t("halqa")}
                </th>
                <th className="py-2.5 px-3 border-r border-emerald-600/50 min-w-[200px]">
                  {isSchool ? "Parent & Contact" : t("parent_contact")}
                </th>
                <th className="w-24 py-2.5 px-2 text-center border-b border-emerald-600/50">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 border-b border-slate-200 dark:border-slate-800 italic">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">
                      {isSchool 
                        ? (isAr ? "لا يوجد تلميذ يطابق معايير البحث." : "Aucun élève ne correspond aux critères sélectionnés.")
                        : (isAr ? "لا يوجد طالب يطابق معايير البحث." : "Aucun Talibé ne correspond aux critères sélectionnés.")}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s, index) => {
                  const isInternat = s.status === "INTERNE";
                  const isDemi = s.status === "DEMI_PENSION";

                  return (
                    <tr 
                      key={s.id} 
                      className={cn(
                        "transition-colors hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                        index % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-800/40" : "bg-white dark:bg-slate-900"
                      )}
                    >
                      {/* N° Excel */}
                      <td className="py-2 px-2 text-center font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-[#f1f3f5] dark:bg-slate-800/70 border-r border-b border-slate-200 dark:border-slate-700/80 select-none">
                        {index + 1}
                      </td>

                      {/* Matricule */}
                      <td className="py-2 px-3 text-center border-r border-b border-slate-200 dark:border-slate-700/80 font-mono font-bold text-emerald-700 dark:text-emerald-400 text-[11px]">
                        {s.matricule || `EPP-2026-${String(s.id).slice(-4)}`}
                      </td>

                      {/* Nom & Prénom */}
                      <td className="py-2 px-3 font-extrabold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                        {s.lastName} {s.firstName}
                      </td>

                      {/* Genre */}
                      <td className="py-2 px-2 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                        {s.gender === "M" ? (
                          <span className="text-blue-700 dark:text-blue-400 font-bold font-mono text-[11px]">{isAr ? "ذكر" : "M"}</span>
                        ) : (
                          <span className="text-pink-700 dark:text-pink-400 font-bold font-mono text-[11px]">{isAr ? "أنثى" : "F"}</span>
                        )}
                      </td>

                      {/* Régime (Cellule Pro) */}
                      <td className="py-2 px-3 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                          isInternat 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800" 
                            : isDemi 
                              ? "bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800" 
                              : "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                        )}>
                          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isInternat ? "bg-emerald-600" : isDemi ? "bg-purple-600" : "bg-amber-600")} />
                          {isInternat ? (isSchool ? "Pensionnaire" : "Interne") : isDemi ? "Demi-Pen." : "Externe"}
                        </span>
                      </td>

                      {/* Classe / Halqa */}
                      <td className="py-2 px-3 border-r border-b border-slate-200 dark:border-slate-700/80 font-semibold text-slate-700 dark:text-slate-300">
                        {s.class?.name || s.halqa?.name || (isSchool ? "Classe Primaire" : "Halqa Général")}
                      </td>

                      {/* Parent & Contact */}
                      <td className="py-2 px-3 border-r border-b border-slate-200 dark:border-slate-700/80">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{s.parentName || "—"}</span>
                          {s.parentPhone && (
                            <a
                              href={`https://wa.me/${s.parentPhone.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono text-[11px] font-bold border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-600 hover:text-white transition-all shrink-0"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{s.parentPhone}</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Actions (Modifier / Supprimer) */}
                      <td className="py-2 px-2 text-center border-b border-slate-200 dark:border-slate-700/80">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(s)}
                            className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={isDeleting === s.id}
                            onClick={() => handleDelete(s.id, `${s.firstName} ${s.lastName}`)}
                            className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            {isDeleting === s.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* PIED DU TABLEAU EXCEL (BARRE DE STATUT & TOTAUX) */}
            <tfoot>
              <tr className="bg-[#f1f3f5] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-t-2 border-slate-300 dark:border-slate-600 text-xs select-none">
                <td colSpan={3} className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] mr-2">TOTAL :</span>
                  <span>{filteredStudents.length} Inscrits au registre</span>
                </td>
                <td colSpan={3} className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                  <span className="mr-3">Garçons : {countBoys}</span>
                  <span>Filles : {countGirls}</span>
                </td>
                <td colSpan={3} className="py-2.5 px-3 text-right font-mono text-[11px] text-slate-500">
                  Internes : {countInternes} | Externes : {countExternes}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* MODAL DE MODIFICATION ÉLÈVE */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Pencil className="w-4 h-4 text-blue-600" />
              <span>{isSchool ? "Modifier la fiche de l'élève" : "Modifier la fiche du Talibé"}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Prénom *</label>
                <Input 
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Nom *</label>
                <Input 
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Genre</label>
                <select 
                  value={editFormData.gender}
                  onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-medium"
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Régime</label>
                <select 
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-medium"
                >
                  <option value="INTERNE">{isSchool ? "Pensionnaire (Interne)" : "Interne (Pensionnat)"}</option>
                  <option value="EXTERNE">Externe (Journée)</option>
                  <option value="DEMI_PENSION">Demi-Pension</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">Classe / Halqa</label>
              <select 
                value={editFormData.classId}
                onChange={(e) => setEditFormData({ ...editFormData, classId: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-xs font-medium"
              >
                <option value="">-- Sans classe assignée --</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Nom du parent</label>
                <Input 
                  value={editFormData.parentName}
                  onChange={(e) => setEditFormData({ ...editFormData, parentName: e.target.value })}
                  placeholder="Ex: Ibrahima Sow"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Téléphone parent</label>
                <Input 
                  value={editFormData.parentPhone}
                  onChange={(e) => setEditFormData({ ...editFormData, parentPhone: e.target.value })}
                  placeholder="Ex: 771234567"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-muted-foreground">Notes de santé / Particularités</label>
              <Input 
                value={editFormData.healthNotes}
                onChange={(e) => setEditFormData({ ...editFormData, healthNotes: e.target.value })}
                placeholder="Allergies, traitement, etc."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingStudent(null)}>
                Annuler
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5">
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pencil className="w-3.5 h-3.5" />}
                <span>Enregistrer les modifications</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
