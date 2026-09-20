"use client";

import { 
  BookOpen, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  Flame, 
  ChevronRight,
  ArrowRight,
  UserCheck,
  HeartHandshake,
  Sparkles,
  Clock,
  Table as TableIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useLocale } from "next-intl";

interface DaaraDashboardClientProps {
  daaraName: string;
  totalTalibes: number;
  totalInternes: number;
  totalHalqas: number;
  totalSponsorships: number;
  hifzRecordsToday: number;
  recentHifz: any[];
  userRole: string;
}

export function DaaraDashboardClient({
  daaraName,
  totalTalibes,
  totalInternes,
  totalHalqas,
  totalSponsorships,
  hifzRecordsToday,
  recentHifz,
  userRole,
}: DaaraDashboardClientProps) {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="space-y-6 py-4 max-w-7xl mx-auto font-sans">
      
      {/* En-tête de Bienvenue Épuré */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            {isAr ? "منصة المحضرة الرقمية" : "E-Daara • Ibnoul Khayim"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-arabic">
            {daaraName}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            {isAr 
              ? "جدول المتابعة الشامل: متابعة حفظ الـ 60 حزباً، سجل الطلاب والطلاب المقيمين."
              : "Tableau récapitulatif de gestion du Daara : Suivi des 60 Hizbs, registre des apprenants et présences."
            }
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link href="/hifz">
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-2 rounded-xl px-4 py-2.5 shadow-xs">
              <BookOpen className="w-4 h-4" /> {isAr ? "متابعة ٦٠ حزباً" : "Suivi 60 Hizbs"}
            </Button>
          </Link>
          <Link href="/attendance">
            <Button variant="outline" className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs gap-2 rounded-xl px-4 py-2.5">
              <CalendarCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" /> {isAr ? "سجل الحضور" : "Présences"}
            </Button>
          </Link>
        </div>
      </div>

      {/* TABLEAU RÉCAPITULATIF DES MÉTRIQUES (STYLE TABLEAU WORD / EXCEL ÉPURÉ - PAS DE GRANDES CARTES BOUFFIES) */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b-2 border-slate-700">
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-arabic">
              {isAr ? "جدول الإحصائيات العامة للمحضرة" : "Tableau Général des Métriques du Daara"}
            </h2>
          </div>
          <span className="text-[10px] sm:text-xs text-slate-400 font-medium">{isAr ? "إسحب أفقيًا ↔" : "Faire défiler →"}</span>
        </div>

        <div className="overflow-x-auto touch-pan-x">
          <table className="w-full min-w-[650px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-200 text-xs font-black uppercase tracking-wider border-b border-slate-300 dark:border-slate-700">
                <th className="py-3 px-5 border-r border-slate-300 dark:border-slate-700">Indicateur / Métrique</th>
                <th className="py-3 px-5 border-r border-slate-300 dark:border-slate-700 text-center w-32">Valeur</th>
                <th className="py-3 px-5 border-r border-slate-300 dark:border-slate-700">Détails & Précisions</th>
                <th className="py-3 px-5 text-center w-40">Accès Direct</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
              
              {/* Ligne 1: Effectif Talibés */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0">
                    <Users className="w-4 h-4" />
                  </div>
                  <span>{isAr ? "عدد طلاب المحضرة" : "Effectif Général des Talibés"}</span>
                </td>
                <td className="py-3.5 px-5 font-black text-lg text-slate-900 dark:text-white text-center border-r border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-950/20">
                  {totalTalibes}
                </td>
                <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 font-medium">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{totalInternes}</span> pensionnaires internes résidant au Daara
                </td>
                <td className="py-3.5 px-5 text-center">
                  <Link href="/students">
                    <Button size="sm" variant="outline" className="border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all rounded-lg">
                      Voir Registre <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </td>
              </tr>

              {/* Ligne 2: Récitations du Jour */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-bold shrink-0">
                    <Flame className="w-4 h-4" />
                  </div>
                  <span>{isAr ? "الأحزاب المنجزة اليوم" : "Récitations Validées du Jour"}</span>
                </td>
                <td className="py-3.5 px-5 font-black text-lg text-amber-700 dark:text-amber-400 text-center border-r border-slate-200 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-950/20">
                  {hifzRecordsToday}
                </td>
                <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 font-medium">
                  Récitations enregistrées aujourd'hui (Sabi & Muraja'a sur Allwa)
                </td>
                <td className="py-3.5 px-5 text-center">
                  <Link href="/hifz">
                    <Button size="sm" variant="outline" className="border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-amber-600 hover:text-white hover:border-amber-600 transition-all rounded-lg">
                      Grille 60 Hizbs <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </td>
              </tr>

              {/* Ligne 3: Halqas d'Étude */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold shrink-0">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span>{isAr ? "الحلقات القرآنيّة" : "Cercles d'Étude (Halqas) & Oustazs"}</span>
                </td>
                <td className="py-3.5 px-5 font-black text-lg text-slate-900 dark:text-white text-center border-r border-slate-200 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-950/20">
                  {totalHalqas}
                </td>
                <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 font-medium">
                  Cercles d'études coraniques sous la direction des Maîtres Oustazs
                </td>
                <td className="py-3.5 px-5 text-center">
                  <Link href="/classes">
                    <Button size="sm" variant="outline" className="border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all rounded-lg">
                      Voir Halqas <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </td>
              </tr>

              {/* Ligne 4: Cas Sociaux & Exonérés */}
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center font-bold shrink-0">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <span>{isAr ? "الحالات الاجتماعية" : "Cas Sociaux & Exonérés"}</span>
                </td>
                <td className="py-3.5 px-5 font-black text-lg text-purple-700 dark:text-purple-400 text-center border-r border-slate-200 dark:border-slate-800 bg-purple-50/50 dark:bg-purple-950/20">
                  {totalSponsorships}
                </td>
                <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 font-medium">
                  Apprenants exonérés ou bénéficiant du parrainage Ndeyi Daara
                </td>
                <td className="py-3.5 px-5 text-center">
                  <Link href="/cas-sociaux">
                    <Button size="sm" variant="outline" className="border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all rounded-lg">
                      Cas Sociaux <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* TABLEAU DES RÉCITATIONS RÉCENTES DES 60 HIZBS */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b-2 border-slate-700">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-arabic">
              {isAr ? "سجل التسميع اليومي (٦٠ حزباً)" : "Registre des Récitations Récentes (60 Hizbs)"}
            </h2>
          </div>
          <Link href="/hifz">
            <Button size="sm" variant="ghost" className="text-xs text-emerald-400 hover:text-emerald-300 font-bold gap-1">
              {isAr ? "عرض الكل" : "Voir tout"} <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto touch-pan-x">
          <table className="w-full min-w-[650px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-200 text-xs font-black uppercase tracking-wider border-b border-slate-300 dark:border-slate-700">
                <th className="py-3 px-5 border-r border-slate-300 dark:border-slate-700">Hizb N°</th>
                <th className="py-3 px-5 border-r border-slate-300 dark:border-slate-700">Nom & Prénom du Talibé</th>
                <th className="py-3 px-5 border-r border-slate-300 dark:border-slate-700">Sourate & Versets</th>
                <th className="py-3 px-5 text-center w-36">Évaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm font-arabic">
              {recentHifz.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-sans">
                    Aucune récitation enregistrée aujourd'hui.
                  </td>
                </tr>
              ) : (
                recentHifz.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-black text-emerald-700 dark:text-emerald-400 border-r border-slate-200 dark:border-slate-800">
                      Hizb {record.hizbNumber}
                    </td>
                    <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white border-r border-slate-200 dark:border-slate-800">
                      {record.talibe?.firstName} {record.talibe?.lastName}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 font-medium">
                      {record.surahName ? `Sourate ${record.surahName}` : "Récitation générale"}
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <Badge variant="outline" className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-bold px-3 py-1 rounded-full text-xs">
                        {record.evaluation || "MUMTAZ ممتاز"}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
