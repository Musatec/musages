"use client";

import { useState } from "react";
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

  const [students, setStudents] = useState<any[]>(initialStudents);
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
    status: "INTERNE",
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
    XLSX.writeFile(wb, `effectif_daara_${selectedYear}.xlsx`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      toast.error(isAr ? "الاسم الأول واسم العائلة مطلوبان." : "Le prénom et le nom du Talibé sont obligatoires.");
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
      toast.success(isAr ? "تم تسجيل الطالب بنجاح! 🎉" : "Talibé inscrit avec succès au Daara ! 🎉");
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
        status: "INTERNE",
        healthNotes: "",
        parentName: "",
        parentPhone: "",
        parentEmail: ""
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Contrast Fix (text-white) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 p-6 md:p-8 text-white border border-emerald-500/20 shadow-xl">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-8 -translate-y-8">
          <Users className="w-96 h-96 text-emerald-400" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-400" /> {isAr ? "سجل الطلاب العام" : "Effectif Général & Registre des Talibés"}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-arabic leading-snug text-white drop-shadow-md">
            {t("title")}
          </h1>
          <p className="text-emerald-100/90 text-sm md:text-base leading-relaxed">
            {t("subtitle")}
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/40 p-4 rounded-2xl border border-border">
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setSelectedTab("ALL")}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all", selectedTab === "ALL" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
            >
              {t("all")} ({totalStudents})
            </button>
            <button 
              onClick={() => setSelectedTab("GARCON")}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all", selectedTab === "GARCON" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
            >
              {t("boys")} ({countBoys})
            </button>
            <button 
              onClick={() => setSelectedTab("FILLE")}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all", selectedTab === "FILLE" ? "bg-pink-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
            >
              {t("girls")} ({countGirls})
            </button>
            <button 
              onClick={() => setSelectedTab("INTERNE")}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all", selectedTab === "INTERNE" ? "bg-amber-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
            >
              {t("interne")} ({countInternes})
            </button>
            <button 
              onClick={() => setSelectedTab("DEMI_PENSION")}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all", selectedTab === "DEMI_PENSION" ? "bg-purple-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
            >
              {t("demi_pension")} ({countDemiPension})
            </button>
            <button 
              onClick={() => setSelectedTab("EXTERNE")}
              className={cn("px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all", selectedTab === "EXTERNE" ? "bg-teal-600 text-white shadow-xs" : "text-muted-foreground hover:bg-muted")}
            >
              {t("externe")} ({countExternes})
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            {/* Year Selector */}
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-bold text-foreground"
            >
              <option value="2026-2027">{isAr ? "السنة ٢٠٢٦ - ٢٠٢٧" : "Année 2026 - 2027"}</option>
              <option value="2025-2026">{isAr ? "السنة ٢٠٢٥ - ٢٠٢٦" : "Année 2025 - 2026"}</option>
              <option value="2024-2025">{isAr ? "السنة ٢٠٢٤ - ٢٠٢٥" : "Année 2024 - 2025"}</option>
            </select>

            <Button onClick={handleExportExcel} variant="outline" className="text-xs font-bold gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> {t("export_excel")}
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

      {/* Talibes Table */}
      <Card className="border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 font-bold">{t("matricule")}</th>
                <th className="px-6 py-3.5 font-bold">{t("fullname")}</th>
                <th className="px-6 py-3.5 font-bold">{t("gender")}</th>
                <th className="px-6 py-3.5 font-bold">{t("regime")}</th>
                <th className="px-6 py-3.5 font-bold">{t("halqa")}</th>
                <th className="px-6 py-3.5 font-bold">{t("parent_contact")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-bold">{isAr ? "لا يوجد طالب يطابق معايير البحث." : "Aucun Talibé ne correspond aux critères sélectionnés."}</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-emerald-600">
                      {s.matricule}
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
                        {s.status === "INTERNE" ? t("interne") : s.status === "DEMI_PENSION" ? t("demi_pension") : t("externe")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-muted-foreground">
                      {s.halqa?.name || s.class?.name || (isAr ? "الحلقة العامة" : "Halqa Général")}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <p className="font-bold text-foreground">{s.parentName || "Non renseigné"}</p>
                      {s.parentPhone && (
                        <span className="font-mono text-emerald-600 flex items-center gap-1 mt-0.5 font-semibold">
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
