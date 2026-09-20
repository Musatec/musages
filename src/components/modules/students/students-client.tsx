"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  UserPlus, 
  FileSpreadsheet,
  Phone,
  Sparkles
} from "lucide-react";
import { createStudent } from "@/lib/actions/students";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSpace } from "@/components/providers/space-provider";
import { useLocale, useTranslations } from "next-intl";

interface StudentsClientProps {
  classes: any[];
  students: any[];
}

const MOCK_SCHOOL_STUDENTS = [
  { id: "sch_s1", matricule: "EPP-2026-0001", firstName: "Mouhamed", lastName: "Faye", gender: "M", status: "EXTERNE", class: { name: "Classe CM2 Bilingue" }, parentName: "Moussa Faye", parentPhone: "+221 77 111 22 33" },
  { id: "sch_s2", matricule: "EPP-2026-0002", firstName: "Awa", lastName: "Diouf", gender: "F", status: "DEMI_PENSION", class: { name: "Classe CM1" }, parentName: "Ousmane Diouf", parentPhone: "+221 77 222 33 44" },
  { id: "sch_s3", matricule: "EPP-2026-0003", firstName: "Ibrahima", lastName: "Ba", gender: "M", status: "EXTERNE", class: { name: "Classe CE2" }, parentName: "Amadou Ba", parentPhone: "+221 77 333 44 55" },
  { id: "sch_s4", matricule: "EPP-2026-0004", firstName: "Mariama", lastName: "Kante", gender: "F", status: "EXTERNE", class: { name: "Classe CE1" }, parentName: "Saliou Kante", parentPhone: "+221 77 444 55 66" },
  { id: "sch_s5", matricule: "EPP-2026-0005", firstName: "Babacar", lastName: "Seck", gender: "M", status: "DEMI_PENSION", class: { name: "Classe CP" }, parentName: "Modou Seck", parentPhone: "+221 77 555 66 77" },
  { id: "sch_s6", matricule: "EPP-2026-0006", firstName: "Khadija", lastName: "Cissé", gender: "F", status: "EXTERNE", class: { name: "Classe CI (Initiation)" }, parentName: "Abdoulaye Cissé", parentPhone: "+221 77 666 77 88" },
];

export function StudentsClient({ classes, students: initialStudents }: StudentsClientProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const t = useTranslations("Talibes");
  const tCommon = useTranslations("Common");
  const { activeSpace } = useSpace();
  const isSchool = activeSpace === "school";

  const [students, setStudents] = useState<any[]>(isSchool ? MOCK_SCHOOL_STUDENTS : initialStudents);

  useEffect(() => {
    setStudents(isSchool ? MOCK_SCHOOL_STUDENTS : initialStudents);
  }, [isSchool, initialStudents]);

  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [selectedYear, setSelectedYear] = useState("2026-2027");
  const [selectedTab, setSelectedTab] = useState<"ALL" | "GARCON" | "FILLE" | "INTERNE" | "EXTERNE" | "DEMI_PENSION">("ALL");
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleExportExcel = () => {
    const dataToExport = filteredStudents.map(s => ({
      [t("matricule")]: s.matricule,
      [t("fullname")]: `${s.firstName} ${s.lastName}`,
      [t("gender")]: s.gender === 'M' ? (isAr ? 'ذكر' : 'Garçon') : (isAr ? 'أنثى' : 'Fille'),
      [t("regime")]: s.status === 'INTERNE' ? t("interne") : s.status === 'DEMI_PENSION' ? t("demi_pension") : t("externe"),
      [t("halqa")]: s.halqa?.name || s.class?.name || 'Non assigné',
      [t("parent_contact")]: s.parentName || 'N/A',
      "Téléphone WhatsApp": s.parentPhone || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Effectif_${selectedYear}`);
    XLSX.writeFile(wb, `effectif_${isSchool ? 'ecole_pathe_pogne' : 'daara'}_${selectedYear}.xlsx`);
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className={cn(
        "relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-xl border",
        isSchool 
          ? "bg-gradient-to-r from-amber-950 via-amber-900 to-yellow-900 border-amber-500/30" 
          : "bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 border-emerald-500/20"
      )}>
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
          <Users className={cn("w-96 h-96", isSchool ? "text-amber-400" : "text-emerald-400")} />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className={cn(
            "inline-flex max-w-full flex-wrap items-center gap-2 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border",
            isSchool 
              ? "bg-amber-500/20 border-amber-500/30 text-amber-200" 
              : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
          )}>
            <Sparkles className={cn("w-4 h-4", isSchool ? "text-amber-400" : "text-emerald-400")} /> 
            {isSchool 
              ? (isAr ? "سجل التلاميذ • مدرسة باثي بوني" : "Effectif Général • École Pathé Pogne (CI - CM2)")
              : (isAr ? "سجل الطلاب العام" : "Effectif Général & Registre des Talibés")}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-arabic leading-snug text-white drop-shadow-md">
            {isSchool ? (isAr ? "سجل التلاميذ والإمكانيات" : "Effectif Général des Élèves") : t("title")}
          </h1>
          <p className={cn("text-sm md:text-base leading-relaxed", isSchool ? "text-amber-100/90" : "text-emerald-100/90")}>
            {isSchool 
              ? "Registre général des élèves de l'École Franco-Arabe Pathé Pogne, gestion des classes et suivi des informations de contact des parents."
              : t("subtitle")}
          </p>
        </div>
      </div>

      {/* Stats Cards - Headcount per Category (100% Translated) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border border-emerald-500/20 shadow-xs">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] font-extrabold uppercase text-muted-foreground">{t("total_effectif")}</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{totalStudents}</h3>
          </CardContent>
        </Card>

        <Card className="border border-blue-500/20 shadow-xs">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] font-extrabold uppercase text-muted-foreground">{t("boys")}</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">{countBoys}</h3>
          </CardContent>
        </Card>

        <Card className="border border-pink-500/20 shadow-xs">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] font-extrabold uppercase text-muted-foreground">{t("girls")}</p>
            <h3 className="text-2xl font-black text-pink-600 mt-1">{countGirls}</h3>
          </CardContent>
        </Card>

        <Card className="border border-amber-500/20 shadow-xs">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] font-extrabold uppercase text-muted-foreground">{t("interne")}</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{countInternes}</h3>
          </CardContent>
        </Card>

        <Card className="border border-purple-500/20 shadow-xs">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] font-extrabold uppercase text-muted-foreground">{t("demi_pension")}</p>
            <h3 className="text-2xl font-black text-purple-600 mt-1">{countDemiPension}</h3>
          </CardContent>
        </Card>

        <Card className="border border-teal-500/20 shadow-xs">
          <CardContent className="p-4 text-center">
            <p className="text-[10px] font-extrabold uppercase text-muted-foreground">{t("externe")}</p>
            <h3 className="text-2xl font-black text-teal-600 mt-1">{countExternes}</h3>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/40 p-3 sm:p-4 rounded-2xl border border-border">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full sm:w-auto">
            <button 
              onClick={() => setSelectedTab("ALL")}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-bold uppercase shrink-0 transition-all", selectedTab === "ALL" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
            >
              {t("all")} ({totalStudents})
            </button>
            <button 
              onClick={() => setSelectedTab("GARCON")}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-bold uppercase shrink-0 transition-all", selectedTab === "GARCON" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
            >
              {t("boys")} ({countBoys})
            </button>
            <button 
              onClick={() => setSelectedTab("FILLE")}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-bold uppercase shrink-0 transition-all", selectedTab === "FILLE" ? "bg-pink-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
            >
              {t("girls")} ({countGirls})
            </button>
            <button 
              onClick={() => setSelectedTab("INTERNE")}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-bold uppercase shrink-0 transition-all", selectedTab === "INTERNE" ? "bg-amber-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
            >
              {t("interne")} ({countInternes})
            </button>
            <button 
              onClick={() => setSelectedTab("DEMI_PENSION")}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-bold uppercase shrink-0 transition-all", selectedTab === "DEMI_PENSION" ? "bg-purple-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
            >
              {t("demi_pension")} ({countDemiPension})
            </button>
            <button 
              onClick={() => setSelectedTab("EXTERNE")}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-bold uppercase shrink-0 transition-all", selectedTab === "EXTERNE" ? "bg-teal-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
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

      {/* Talibes / Eleves Table with Space-Specific Design */}
      <Card className={cn(
        "border shadow-sm overflow-hidden transition-colors duration-300",
        isSchool ? "border-amber-500/30 bg-card" : "border-emerald-500/20 bg-card"
      )}>
        <div className="overflow-x-auto touch-pan-x">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className={cn(
              "text-xs uppercase tracking-wider font-extrabold border-b",
              isSchool 
                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-800 border-t-4 border-t-amber-600" 
                : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 border-t-4 border-t-emerald-600"
            )}>
              <tr>
                <th className="px-6 py-3.5 font-bold">{isSchool ? "Matricule Écolier" : t("matricule")}</th>
                <th className="px-6 py-3.5 font-bold">{isSchool ? "Nom & Prénom Élève" : t("fullname")}</th>
                <th className="px-6 py-3.5 font-bold">{t("gender")}</th>
                <th className="px-6 py-3.5 font-bold">{isSchool ? "Régime d'Écolage" : t("regime")}</th>
                <th className="px-6 py-3.5 font-bold">{isSchool ? "Classe Bilingue (CI-CM2)" : t("halqa")}</th>
                <th className="px-6 py-3.5 font-bold">{isSchool ? "Parent & Contact WhatsApp" : t("parent_contact")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-bold">
                      {isSchool 
                        ? (isAr ? "لا يوجد تلميذ يطابق معايير البحث." : "Aucun élève ne correspond aux critères sélectionnés.")
                        : (isAr ? "لا يوجد طالب يطابق معايير البحث." : "Aucun Talibé ne correspond aux critères sélectionnés.")}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className={cn("transition-colors", isSchool ? "hover:bg-amber-500/5" : "hover:bg-emerald-500/5")}>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-md font-mono text-xs font-bold border",
                        isSchool 
                          ? "bg-amber-100 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 border-amber-300 dark:border-amber-700" 
                          : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700"
                      )}>
                        {s.matricule || `EPP-2026-${String(s.id).slice(-4)}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">
                      {s.gender === "M" ? (
                        <span className="text-blue-600 font-bold">{isAr ? "ذكر" : "Garçon"}</span>
                      ) : (
                        <span className="text-pink-600 font-bold">{isAr ? "أنثى" : "Fille"}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={
                        s.status === "INTERNE" ? "bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold" :
                        s.status === "DEMI_PENSION" ? "bg-purple-500/10 text-purple-600 border-purple-500/30 font-bold" :
                        "bg-teal-500/10 text-teal-600 border-teal-500/30 font-bold"
                      }>
                        {s.status === "INTERNE" ? (isSchool ? "Pensionnaire" : t("interne")) : s.status === "DEMI_PENSION" ? t("demi_pension") : t("externe")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-muted-foreground">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[11px] font-bold border",
                        isSchool ? "bg-amber-950/30 text-amber-300 border-amber-500/20" : "bg-emerald-950/30 text-emerald-300 border-emerald-500/20"
                      )}>
                        {s.class?.name || s.halqa?.name || (isSchool ? "Classe Primaire" : "Halqa Général")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <p className="font-bold text-foreground">{s.parentName || "Non renseigné"}</p>
                      {s.parentPhone && (
                        <span className={cn(
                          "font-mono flex items-center gap-1 mt-0.5 font-semibold",
                          isSchool ? "text-amber-500" : "text-emerald-600"
                        )}>
                          <Phone className="w-3 h-3" /> {s.parentPhone}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
