"use client";

import { useState, useEffect } from "react";
import { 
  BookOpen, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  Search, 
  User,
  Star,
  Printer,
  PenTool,
  Save,
  Grid,
  FileSpreadsheet,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { addHifzRecord } from "@/lib/actions/hifz";
import { enqueueOfflineAction, cacheHalqas, cacheTalibes } from "@/lib/offline/db";

export interface TalibeHifzItem {
  id: string;
  halqaId?: string;
  matricule: string;
  firstName?: string;
  lastName?: string;
  name: string;
  nameAr?: string;
  halqa: string;
  hizbValidated: number;
  lastHizb: number;
  lastUpdate: string;
  allwaStatus: string;
  status: "INTERNE" | "EXTERNE";
}

export interface HalqaHifzItem {
  id: string;
  name: string;
  level?: string | null;
  oustazName?: string | null;
  talibes?: TalibeHifzItem[];
  _count?: { talibes: number };
}

interface HifzTrackerProps {
  daaraName?: string;
  halqas?: HalqaHifzItem[];
  initialTalibes?: TalibeHifzItem[];
}

// 17 Élèves issus de la fiche officielle Word transmise
const OFFICIAL_WORD_TALIBES = [
  { id: "w1", num: "01", nameAr: "إبراهيم صمب", nameFr: "Ibrahima Sow", surah: "الكهف", fromAyah: 1, toAyah: 15, qty: "صفحة واحدة", evalSabi: "ممتاز", allwa: "اللوح : 1-15", evalAllwa: "ممتاز", murajaa: "الحزب 42", totalHizb: 42, evalMurajaa: "ممتاز" },
  { id: "w2", num: "02", nameAr: "آمنة انجاي", nameFr: "Amina Ndiaye", surah: "مريم", fromAyah: 1, toAyah: 25, qty: "نصف صفحة", evalSabi: "جيد جداً", allwa: "اللوح : 1-25", evalAllwa: "جيد جداً", murajaa: "الحزب 18", totalHizb: 18, evalMurajaa: "جيد جداً" },
  { id: "w3", num: "03", nameAr: "ثومب انجاي", nameFr: "Thioumb Ndiaye", surah: "طه", fromAyah: 1, toAyah: 30, qty: "صفحة واحدة", evalSabi: "ممتاز", allwa: "اللوح : 1-30", evalAllwa: "ممتاز", murajaa: "الحزب 30", totalHizb: 30, evalMurajaa: "ممتاز" },
  { id: "w4", num: "04", nameAr: "باب مود باه", nameFr: "Pape Modou Ba", surah: "الأنبياء", fromAyah: 1, toAyah: 20, qty: "صفحة واحدة", evalSabi: "جيد", allwa: "اللوح : 1-20", evalAllwa: "جيد", murajaa: "الحزب 12", totalHizb: 12, evalMurajaa: "جيد" },
  { id: "w5", num: "05", nameAr: "مصطفى درام", nameFr: "Moustapha Dramé", surah: "الحج", fromAyah: 1, toAyah: 15, qty: "نصف صفحة", evalSabi: "ممتاز", allwa: "اللوح : 1-15", evalAllwa: "ممتاز", murajaa: "الحزب 55", totalHizb: 55, evalMurajaa: "ممتاز" },
  { id: "w6", num: "06", nameAr: "بمبا انجاي", nameFr: "Bamba Ndiaye", surah: "المؤمنون", fromAyah: 1, toAyah: 22, qty: "صفحة واحدة", evalSabi: "ممتاز", allwa: "اللوح : 1-22", evalAllwa: "ممتاز", murajaa: "الحزب 25", totalHizb: 25, evalMurajaa: "ممتاز" },
  { id: "w7", num: "07", nameAr: "داود توري", nameFr: "Daouda Touré", surah: "النور", fromAyah: 1, toAyah: 18, qty: "صفحة واحدة", evalSabi: "جيد جداً", allwa: "اللوح : 1-18", evalAllwa: "جيد جداً", murajaa: "الحزب 38", totalHizb: 38, evalMurajaa: "جيد جداً" },
  { id: "w8", num: "08", nameAr: "رقية سيك", nameFr: "Rokhaya Seck", surah: "الفرقان", fromAyah: 1, toAyah: 20, qty: "نصف صفحة", evalSabi: "ممتاز", allwa: "اللوح : 1-20", evalAllwa: "ممتاز", murajaa: "الحزب 10", totalHizb: 10, evalMurajaa: "ممتاز" },
  { id: "w9", num: "09", nameAr: "محمد في", nameFr: "Mouhamed Faye", surah: "الشعراء", fromAyah: 1, toAyah: 30, qty: "صفحة واحدة", evalSabi: "ممتاز", allwa: "اللوح : 1-30", evalAllwa: "ممتاز", murajaa: "الحزب 48", totalHizb: 48, evalMurajaa: "ممتاز" },
  { id: "w10", num: "10", nameAr: "شيخ سيسي", nameFr: "Cheikh Cissé", surah: "النمل", fromAyah: 1, toAyah: 15, qty: "صفحة واحدة", evalSabi: "جيد", allwa: "اللوح : 1-15", evalAllwa: "جيد", murajaa: "الحزب 15", totalHizb: 15, evalMurajaa: "جيد" },
  { id: "w11", num: "11", nameAr: "إبراهيم بجان", nameFr: "Ibrahima Badji", surah: "القصص", fromAyah: 1, toAyah: 25, qty: "صفحة واحدة", evalSabi: "ممتاز", allwa: "اللوح : 1-25", evalAllwa: "ممتاز", murajaa: "الحزب 32", totalHizb: 32, evalMurajaa: "ممتاز" },
  { id: "w12", num: "12", nameAr: "محمد جوب", nameFr: "Mouhamed Diop", surah: "العنكبوت", fromAyah: 1, toAyah: 20, qty: "نصف صفحة", evalSabi: "جيد جداً", allwa: "اللوح : 1-20", evalAllwa: "جيد جداً", murajaa: "الحزب 20", totalHizb: 20, evalMurajaa: "جيد جداً" },
  { id: "w13", num: "13", nameAr: "عبد فال", nameFr: "Abdou Fall", surah: "الروم", fromAyah: 1, toAyah: 18, qty: "صفحة واحدة", evalSabi: "ممتاز", allwa: "اللوح : 1-18", evalAllwa: "ممتاز", murajaa: "الحزب 60", totalHizb: 60, evalMurajaa: "ممتاز" },
  { id: "w14", num: "14", nameAr: "مود مالك صو", nameFr: "Modou Malick Sow", surah: "لقمان", fromAyah: 1, toAyah: 15, qty: "صفحة واحدة", evalSabi: "ممتاز", allwa: "اللوح : 1-15", evalAllwa: "ممتاز", murajaa: "الحزب 40", totalHizb: 40, evalMurajaa: "ممتاز" },
  { id: "w15", num: "15", nameAr: "عمر غيت", nameFr: "Omar Gueye", surah: "السجدة", fromAyah: 1, toAyah: 20, qty: "صفحة واحدة", evalSabi: "جيد جداً", allwa: "اللوح : 1-20", evalAllwa: "جيد جداً", murajaa: "الحزب 28", totalHizb: 28, evalMurajaa: "جيد جداً" },
  { id: "w16", num: "16", nameAr: "ممد اندو", nameFr: "Mamadou Ndao", surah: "الأحزاب", fromAyah: 1, toAyah: 15, qty: "نصف صفحة", evalSabi: "ممتاز", allwa: "اللوح : 1-15", evalAllwa: "ممتاز", murajaa: "الحزب 50", totalHizb: 50, evalMurajaa: "ممتاز" },
  { id: "w17", num: "17", nameAr: "بي جينجو", nameFr: "Pape Dieng", surah: "سبأ", fromAyah: 1, toAyah: 22, qty: "صفحة واحدة", evalSabi: "ممتاز", allwa: "اللوح : 1-22", evalAllwa: "ممتاز", murajaa: "الحزب 35", totalHizb: 35, evalMurajaa: "ممتاز" },
];

export function HifzTracker({ daaraName, halqas: initialHalqas, initialTalibes }: HifzTrackerProps) {
  const [activeTab, setActiveTab] = useState<"word" | "grid">("word");
  
  // Halqas List
  const listHalqas = initialHalqas && initialHalqas.length > 0 ? initialHalqas : [
    { id: "h1", name: "حلقة عمر بن الخطاب (أستاذ أمل)", oustazName: "Moustapha Amar", level: "MÉMORISATION (Hifz)" },
    { id: "h2", name: "حلقة أستاذ محمد انضاو (Coran / القرآن)", oustazName: "Mouhamed Ndaw", level: "MÉMORISATION (Hifz)" },
    { id: "h3", name: "حلقة أستاذ موسى انضاو (Coran / القرآن)", oustazName: "Moussa Ndaw", level: "MÉMORISATION (Hifz)" },
    { id: "h4", name: "حلقة أستاذ محمد توبر (Coran / القرآن)", oustazName: "Mouhamed Top", level: "MÉMORISATION (Hifz)" },
  ];

  const [selectedHalqaId, setSelectedHalqaId] = useState<string>(listHalqas[0].id);

  // Active Halqa object
  const currentHalqa = listHalqas.find(h => h.id === selectedHalqaId) || listHalqas[0];

  // State Fiche Journalière Word
  const [ficheNo, setFicheNo] = useState<string>("25");
  const [hijriDate, setHijriDate] = useState<string>("1447");
  const [gregorianDate, setGregorianDate] = useState<string>("2026/09/20");

  // Local rows for current Halqa's daily Word sheet
  const [tableRows, setTableRows] = useState(OFFICIAL_WORD_TALIBES);

  // State for Modal Saisie Hizb (Vue Grille)
  const talibeList = initialTalibes && initialTalibes.length > 0 ? initialTalibes : [];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTalibe, setSelectedTalibe] = useState<TalibeHifzItem>(talibeList[0] || {
    id: "1", matricule: "DAA-001", name: "إبراهيم صمب (Ibrahima Sow)", halqa: currentHalqa.name, hizbValidated: 42, lastHizb: 43, lastUpdate: "Aujourd'hui", allwaStatus: "Sabi: Sourate Al-Kahf (v. 1-15)", status: "INTERNE"
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentHizb, setCurrentHizb] = useState<number>(selectedTalibe?.lastHizb || 1);
  const [evaluation, setEvaluation] = useState<"MUMTAZ" | "JAYYID_JIDDAN" | "JAYYID" | "A_REVISER">("MUMTAZ");
  const [category, setCategory] = useState<string>("SABI");
  const [allwaNotes, setAllwaNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCellChange = (id: string, field: string, value: any) => {
    setTableRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (initialHalqas && initialHalqas.length > 0) {
      cacheHalqas(initialHalqas);
    }
    if (initialTalibes && initialTalibes.length > 0) {
      cacheTalibes(initialTalibes);
    }
  }, [initialHalqas, initialTalibes]);

  const handleSaveHifz = async () => {
    if (!selectedTalibe) return;

    setIsSubmitting(true);

    const recordPayload = {
      talibeId: selectedTalibe.id,
      hizbNumber: currentHizb,
      grade: evaluation,
      allwaBoard: allwaNotes,
      notes: `Catégorie: ${category}`
    };

    // Cas 1 : Appareil hors-ligne
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await enqueueOfflineAction("SAVE_HIFZ", recordPayload);
      setIsSubmitting(false);
      setIsModalOpen(false);
      toast.success(`Hifz enregistré localement (Mode Hors-Ligne) pour ${selectedTalibe.name} 💾`);
      return;
    }

    // Cas 2 : En ligne avec fallback
    try {
      const res = await addHifzRecord(recordPayload);
      setIsSubmitting(false);

      if (res.success) {
        toast.success(`Hifz enregistré avec succès pour ${selectedTalibe.name} ! 🎉`);
        setIsModalOpen(false);
      } else {
        toast.error(res.error || "Erreur lors de l'enregistrement de la récitation.");
      }
    } catch {
      await enqueueOfflineAction("SAVE_HIFZ", recordPayload);
      setIsSubmitting(false);
      setIsModalOpen(false);
      toast.info(`Connexion instable : progrès Hifz mis en attente hors-ligne 💾`);
    }
  };

  return (
    <div className="space-y-4 w-full max-w-full font-sans">

      {/* BARRE SUPÉRIEURE DE NAVIGATION ET DE SÉLECTION DU SÉLECTEUR DE HALQA */}
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 print:hidden w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Suivi du Hifz & Fiche Journalière (لوح وحفظ القرآن)</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 font-arabic">
                ٦٠ حزباً
              </span>
            </h1>
          </div>
        </div>

        {/* Action Controls & View Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end text-xs font-bold">
          
          {/* Sélecteur de Halqa */}
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-slate-800 border border-emerald-300 dark:border-slate-700 px-3 py-1 rounded-lg text-xs font-bold font-arabic">
            <span className="text-slate-500 font-sans text-[11px]">Halqa :</span>
            <select
              value={selectedHalqaId}
              onChange={(e) => setSelectedHalqaId(e.target.value)}
              className="bg-transparent outline-none font-bold text-emerald-950 dark:text-emerald-200 cursor-pointer text-xs"
            >
              {listHalqas.map((h) => (
                <option key={h.id} value={h.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          <Button 
            onClick={handlePrint}
            variant="outline" 
            size="sm"
            className="border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs gap-1.5 rounded-lg"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-600" /> Imprimer la Fiche
          </Button>

          {/* Toggle Vue Word / Vue Grille */}
          <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab("word")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${activeTab === "word" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"}`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Fiche Word Officielle
            </button>
            <button
              onClick={() => setActiveTab("grid")}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${activeTab === "grid" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs" : "text-slate-500"}`}
            >
              <Grid className="w-3.5 h-3.5 text-emerald-600" /> Grille 60 Hizb
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VUE 1 : FICHE WORD JOURNALIÈRE OFFICIELLE (EXACTE REPRODUCTION DE LA PHOTO) */}
      {/* ========================================================================= */}
      {activeTab === "word" && (
        <div className="space-y-3 w-full">

          {/* TABLEAU REGISTRE STYLE WORD EXACTEMENT COMME SUR LA PHOTO (RTL & BORDURES) */}
          <div className="md:hidden flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-300/60 dark:border-amber-800">
            <span>👈 Glissez horizontalement avec votre doigt pour parcourir l'intégralité du registre de Hifz 👉</span>
          </div>
          <div className="w-full overflow-x-auto touch-pan-x bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-700 shadow-sm p-4 print:p-0 print:border-none print:shadow-none">
            
            <table className="w-full min-w-[850px] border-collapse border-2 border-slate-400 dark:border-slate-700 text-right dir-rtl font-arabic">
              
              {/* EN-TÊTE SUPÉRIEUR EXACT DE LA FICHE WORD (REPRODUCTION DE LA PHOTO) */}
              <thead>
                {/* LIGNE 1 : EN-TÊTE PRINCIPAL (N° FICHE | NOM DAARA | HALQA) */}
                <tr>
                  <th colSpan={3} className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 border border-slate-400 dark:border-slate-700 text-center font-bold text-xs sm:text-sm">
                    <div className="flex items-center justify-center gap-2 font-sans">
                      <span>رقم</span>
                      <input 
                        type="text" 
                        value={ficheNo} 
                        onChange={(e) => setFicheNo(e.target.value)}
                        className="w-12 text-center bg-white dark:bg-slate-900 border border-slate-400 rounded font-black py-0.5 outline-none text-emerald-700"
                      />
                    </div>
                  </th>
                  <th colSpan={5} className="bg-emerald-50 dark:bg-slate-800 text-emerald-900 dark:text-emerald-300 p-3 border border-slate-400 dark:border-slate-700 text-center text-lg sm:text-2xl font-black tracking-wide">
                    {daaraName || "مدرسة ابن القيم الجوزية"}
                  </th>
                  <th colSpan={3} className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 border border-slate-400 dark:border-slate-700 text-center font-black text-xs sm:text-sm">
                    <span className="text-emerald-800 dark:text-emerald-300">{currentHalqa.name}</span>
                  </th>
                </tr>

                {/* LIGNE 2 : BARRE DES DATES HIJRI & GRÉGORIENNE */}
                <tr>
                  <th colSpan={11} className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2 px-4 border border-slate-400 dark:border-slate-700 text-xs sm:text-sm font-bold text-center">
                    <div className="flex flex-wrap items-center justify-center gap-6 font-arabic dir-rtl">
                      <span>
                        التاريخ : <input type="text" value={hijriDate} onChange={(e) => setHijriDate(e.target.value)} className="w-16 text-center bg-transparent border-b border-dashed border-slate-400 font-bold outline-none" /> هجري
                      </span>
                      <span>
                        الموافق : <input type="text" value={gregorianDate} onChange={(e) => setGregorianDate(e.target.value)} className="w-28 text-center bg-transparent border-b border-dashed border-slate-400 font-bold outline-none font-sans" /> م
                      </span>
                    </div>
                  </th>
                </tr>

                {/* LIGNE 3 & 4 : INTITULÉS DES COLONNES DU TABLEAU DE SUIVI DU HIFZ (STRUCTURE MULTI-LIGNES PHOTO) */}
                <tr className="bg-emerald-100/90 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-black">
                  <th rowSpan={2} className="p-2 text-center border border-slate-400 dark:border-slate-700 bg-emerald-200 dark:bg-slate-700 w-12 sticky right-0 z-20 shadow-xs">
                    الرقم
                  </th>
                  <th rowSpan={2} className="p-2.5 border border-slate-400 dark:border-slate-700 text-right min-w-[150px] bg-emerald-200 dark:bg-slate-700 sticky right-12 z-20 shadow-xs">
                    الأسماء والألقاب
                  </th>
                  <th colSpan={4} className="p-2 text-center border border-slate-400 dark:border-slate-700 bg-emerald-200/70 dark:bg-slate-700">
                    الدرس الجديد (Sabi)
                  </th>
                  <th rowSpan={2} className="p-2 text-center border border-slate-400 dark:border-slate-700 w-16">
                    الحفظ
                  </th>
                  <th rowSpan={2} className="p-2 text-center border border-slate-400 dark:border-slate-700 min-w-[100px]">
                    جنب اللوح (Allwa)
                  </th>
                  <th rowSpan={2} className="p-2 text-center border border-slate-400 dark:border-slate-700 w-16">
                    الحفظ
                  </th>
                  <th rowSpan={2} className="p-2 text-center border border-slate-400 dark:border-slate-700 min-w-[100px]">
                    المراجعات
                  </th>
                  <th rowSpan={2} className="p-2 text-center border border-slate-400 dark:border-slate-700 w-24">
                    عدد الأحزاب
                  </th>
                  <th rowSpan={2} className="p-2 text-center border border-slate-400 dark:border-slate-700 w-16">
                    الحفظ
                  </th>
                </tr>

                {/* SOUS-COLONNES DU DARS JADID (الدرس الجديد) */}
                <tr className="bg-emerald-200/80 dark:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold text-center">
                  <th className="p-1.5 border border-slate-400 dark:border-slate-700 min-w-[90px]">السورة</th>
                  <th className="p-1.5 border border-slate-400 dark:border-slate-700 w-14">من آية</th>
                  <th className="p-1.5 border border-slate-400 dark:border-slate-700 w-14">إلى آية</th>
                  <th className="p-1.5 border border-slate-400 dark:border-slate-700 min-w-[90px]">مقدار الدرس</th>
                </tr>
              </thead>

              {/* CORPS DU TABLEAU WORD DE SUIVI QUOTIDIEN (17 LIGNES D'ÉLÈVES) */}
              <tbody className="text-xs sm:text-sm font-arabic">
                {tableRows.map((row) => (
                  <tr key={row.id} className="hover:bg-emerald-50/50 dark:hover:bg-slate-800/60 transition-colors">
                    
                    {/* الرقم (N°) */}
                    <td className="p-2 text-center font-black bg-slate-100 dark:bg-slate-800 border border-slate-400 dark:border-slate-700 font-sans text-xs sticky right-0 z-10 shadow-xs">
                      {row.num}
                    </td>

                    {/* الأسماء والألقاب (Nom & Prénom) */}
                    <td className="p-2 border border-slate-400 dark:border-slate-700 font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 sticky right-12 z-10 shadow-xs">
                      <div className="flex items-center justify-between gap-1">
                        <span>{row.nameAr}</span>
                        <span className="text-[10px] text-slate-400 font-sans font-normal print:hidden">
                          ({row.nameFr})
                        </span>
                      </div>
                    </td>

                    {/* الدرس الجديد : السورة */}
                    <td className="p-1 border border-slate-400 dark:border-slate-700 text-center">
                      <input 
                        type="text" 
                        value={row.surah} 
                        onChange={(e) => handleCellChange(row.id, "surah", e.target.value)}
                        className="w-full text-center bg-transparent font-bold outline-none"
                      />
                    </td>

                    {/* الدرس الجديد : من آية */}
                    <td className="p-1 border border-slate-400 dark:border-slate-700 text-center font-sans">
                      <input 
                        type="number" 
                        value={row.fromAyah} 
                        onChange={(e) => handleCellChange(row.id, "fromAyah", e.target.value)}
                        className="w-full text-center bg-transparent font-bold outline-none"
                      />
                    </td>

                    {/* الدرس الجديد : إلى آية */}
                    <td className="p-1 border border-slate-400 dark:border-slate-700 text-center font-sans">
                      <input 
                        type="number" 
                        value={row.toAyah} 
                        onChange={(e) => handleCellChange(row.id, "toAyah", e.target.value)}
                        className="w-full text-center bg-transparent font-bold outline-none"
                      />
                    </td>

                    {/* الدرس الجديد : مقدار الدرس */}
                    <td className="p-1 border border-slate-400 dark:border-slate-700 text-center text-xs">
                      <input 
                        type="text" 
                        value={row.qty} 
                        onChange={(e) => handleCellChange(row.id, "qty", e.target.value)}
                        className="w-full text-center bg-transparent font-semibold outline-none"
                      />
                    </td>

                    {/* الدرس الجديد : الحفظ (Évaluation Sabi) */}
                    <td className="p-1 border border-slate-400 dark:border-slate-700 text-center font-bold">
                      <select 
                        value={row.evalSabi} 
                        onChange={(e) => handleCellChange(row.id, "evalSabi", e.target.value)}
                        className="bg-transparent text-center font-bold outline-none cursor-pointer text-emerald-800 dark:text-emerald-300"
                      >
                        <option value="ممتاز" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-bold">ممتاز</option>
                        <option value="جيد جداً" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-bold">جيد جداً</option>
                        <option value="جيد" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-bold">جيد</option>
                        <option value="مراجعة" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-bold">مراجعة</option>
                      </select>
                    </td>

                    {/* جنب اللوح (Allwa) */}
                    <td className="p-1 border border-slate-400 dark:border-slate-700 text-center text-xs">
                      <input 
                        type="text" 
                        value={row.allwa} 
                        onChange={(e) => handleCellChange(row.id, "allwa", e.target.value)}
                        className="w-full text-center bg-transparent font-semibold outline-none"
                      />
                    </td>

                    {/* جنب اللوح : الحفظ (Évaluation Allwa) */}
                    <td className="p-1 border border-slate-400 dark:border-slate-700 text-center font-bold">
                      <select 
                        value={row.evalAllwa} 
                        onChange={(e) => handleCellChange(row.id, "evalAllwa", e.target.value)}
                        className="bg-transparent text-center font-bold outline-none cursor-pointer text-emerald-800 dark:text-emerald-300"
                      >
                        <option value="ممتاز" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-bold">ممتاز</option>
                        <option value="جيد جداً" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-bold">جيد جداً</option>
                        <option value="جيد" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-bold">جيد</option>
                        <option value="مراجعة" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-bold">مراجعة</option>
                      </select>
                    </td>

                    {/* المراجعات (Murajaa) */}
                    <td className="p-1 border border-slate-400 dark:border-slate-700 text-center text-xs">
                      <input 
                        type="text" 
                        value={row.murajaa} 
                        onChange={(e) => handleCellChange(row.id, "murajaa", e.target.value)}
                        className="w-full text-center bg-transparent font-semibold outline-none"
                      />
                    </td>

                    {/* عدد الأحزاب (Total Hizb) */}
                    <td className="p-1 border border-slate-400 dark:border-slate-700 text-center font-black font-sans bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300">
                      <input 
                        type="number" 
                        value={row.totalHizb} 
                        onChange={(e) => handleCellChange(row.id, "totalHizb", Number(e.target.value))}
                        className="w-full text-center bg-transparent font-black outline-none"
                      />
                    </td>

                    {/* المراجعة : الحفظ (Évaluation Murajaa) */}
                    <td className="p-1 border border-slate-400 dark:border-slate-700 text-center font-bold">
                      <select 
                        value={row.evalMurajaa} 
                        onChange={(e) => handleCellChange(row.id, "evalMurajaa", e.target.value)}
                        className="bg-transparent text-center font-bold outline-none cursor-pointer text-emerald-800 dark:text-emerald-300"
                      >
                        <option value="ممتاز" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-bold">ممتاز</option>
                        <option value="جيد جداً" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-bold">جيد جداً</option>
                        <option value="جيد" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-bold">جيد</option>
                        <option value="مراجعة" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-bold">مراجعة</option>
                      </select>
                    </td>

                  </tr>
                ))}
              </tbody>

              {/* PIED DE LA FICHE WORD DE SUIVI */}
              <tfoot>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-sans text-xs">
                  <td colSpan={6} className="p-3 border border-slate-400 dark:border-slate-700 font-bold text-left dir-ltr">
                    Effectif enregistré : {tableRows.length} Apprenants • {currentHalqa.name}
                  </td>
                  <td colSpan={5} className="p-3 border border-slate-400 dark:border-slate-700 font-arabic font-bold text-right">
                    توقيع الأستاذ المشرف : .................................. • Daara Ibnoul Khayim Al Diawziya
                  </td>
                </tr>
              </tfoot>

            </table>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VUE 2 : GRILLE DE PROGRESSION DES 60 HIZB (INDIVIDUELLE) */}
      {/* ========================================================================= */}
      {activeTab === "grid" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          
          {/* Liste des Élèves */}
          <Card className="lg:col-span-1 border-border/50 shadow-md">
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>Effectif ({talibeList.length})</span>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                  {currentHalqa.name}
                </Badge>
              </CardTitle>
              <div className="relative mt-2">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher par nom..." 
                  className="pl-9 h-9 text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-2 space-y-1 max-h-[600px] overflow-y-auto">
              {talibeList.map((talibe) => {
                const isSelected = selectedTalibe?.id === talibe.id;
                const percentage = Math.round(((talibe.hizbValidated || 0) / 60) * 100);
                return (
                  <button
                    key={talibe.id}
                    onClick={() => {
                      setSelectedTalibe(talibe);
                      setCurrentHizb(talibe.lastHizb || 1);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between border ${
                      isSelected 
                        ? "bg-emerald-500/10 border-emerald-500/40 text-foreground shadow-sm" 
                        : "hover:bg-accent/50 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                        {talibe.hizbValidated || 0}H
                      </div>
                      <div>
                        <p className="text-sm font-bold truncate max-w-[140px]">{talibe.name}</p>
                        <p className="text-[11px] text-muted-foreground">{talibe.halqa}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{percentage}%</span>
                      <p className="text-[10px] text-muted-foreground">Progression</p>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Grille 60 Hizb du Talibé sélectionné */}
          <Card className="lg:col-span-2 border-border/50 shadow-md">
            <CardHeader className="p-6 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold">{selectedTalibe?.name}</h2>
                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                    {selectedTalibe?.status || "INTERNE"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Matricule: <span className="font-mono font-bold text-foreground">{selectedTalibe?.matricule}</span> • {selectedTalibe?.halqa}
                </p>
              </div>
              
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-lg shadow-emerald-600/20">
                    <PenTool className="w-4 h-4" /> Saisir la Séance
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-500" /> Saisie Hifz — {selectedTalibe?.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-3">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase">Hizb Évalué (1 à 60)</label>
                      <Input 
                        type="number" 
                        min={1} 
                        max={60} 
                        value={currentHizb} 
                        onChange={(e) => setCurrentHizb(Number(e.target.value))}
                        className="mt-1 font-mono text-lg font-bold"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase">Catégorie d'Évaluation</label>
                      <select 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full mt-1 p-2 bg-background border rounded-lg text-sm font-semibold"
                      >
                        <option value="SABI">Sabi (Nouveau verset sur l'Allwa / لوح)</option>
                        <option value="MURAJAA_QARIBA">Muraja'a Qariba (Révision récents Hizbs)</option>
                        <option value="MURAJAA_BAIDA">Muraja'a Ba'ida (Tillawa générale)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase">Évaluation Oustaz</label>
                      <select 
                        value={evaluation} 
                        onChange={(e: any) => setEvaluation(e.target.value)}
                        className="w-full mt-1 p-2 bg-background border rounded-lg text-sm font-semibold"
                      >
                        <option value="MUMTAZ">Mumtaz (ممتاز - Excellent / Parfait)</option>
                        <option value="JAYYID_JIDDAN">Jayyid Jiddan (جيد جداً - Très Bien)</option>
                        <option value="JAYYID">Jayyid (جيد - Bien)</option>
                        <option value="A_REVISER">A Réviser (يحتاج مراجعة)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase">Notes Allwa / Sourate (لوح)</label>
                      <Input 
                        placeholder="Ex: Sourate Al-Kahf versets 1 à 25" 
                        value={allwaNotes} 
                        onChange={(e) => setAllwaNotes(e.target.value)}
                        className="mt-1 text-xs"
                      />
                    </div>

                    <Button onClick={handleSaveHifz} disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
                      <Save className="w-4 h-4" /> {isSubmitting ? "Enregistrement..." : "Enregistrer la Récitation"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Grille Visuelle des 60 Hizb */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" /> Grille de Progression Coranique (60 Hizb)
                  </h3>
                  <span className="text-xs text-muted-foreground font-mono font-bold">
                    {selectedTalibe?.hizbValidated || 0} / 60 Hizb Mémorisés
                  </span>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
                  {Array.from({ length: 60 }, (_, i) => i + 1).map((hizbNum) => {
                    const isValidated = hizbNum <= (selectedTalibe?.hizbValidated || 0);
                    const isCurrent = hizbNum === selectedTalibe?.lastHizb;

                    return (
                      <div
                        key={hizbNum}
                        className={`h-11 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer relative group ${
                          isValidated 
                            ? "bg-emerald-600 text-white border-emerald-500 font-extrabold shadow-sm" 
                            : isCurrent 
                              ? "bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400 font-bold animate-pulse" 
                              : "bg-background border-border/60 text-muted-foreground hover:border-emerald-500/50"
                        }`}
                      >
                        <span className="text-xs">{hizbNum}</span>
                        <span className="text-[8px] opacity-75 font-mono">Hizb</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

    </div>
  );
}
