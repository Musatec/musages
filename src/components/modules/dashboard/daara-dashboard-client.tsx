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
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

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
  const tDash = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");

  return (
    <div className="space-y-6 py-2">
      {/* Bannière d'Accueil Épurée */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/20 p-6 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> {isAr ? "منصة المحضرة الرقمية" : "E-Daara — Ibnoul Khayim Al Diawziya"}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-arabic">
              {daaraName}
            </h1>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
              {isAr 
                ? "لوحة التحكم الشاملة: متابعة حفظ الـ 60 حزباً، إدارة الطلاب وتأكيد الحضور اليومي."
                : "Tableau de bord de pilotage du Daara : Suivi des 60 Hizbs, gestion des apprenants et présences quotidiennes."
              }
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link href="/hifz">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 shadow-xs rounded-xl px-4 py-2.5">
                <BookOpen className="w-4 h-4 text-emerald-200" /> {isAr ? "متابعة ٦٠ حزباً" : "Suivi des 60 Hizbs"}
              </Button>
            </Link>
            <Link href="/attendance">
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-200 font-semibold text-xs gap-2 rounded-xl px-4 py-2.5">
                <CalendarCheck className="w-4 h-4 text-emerald-400" /> {isAr ? "سجل الحضور" : "Présences"}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Cartes KPI Essentielles — Traduction 100% */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Effectif Talibés */}
        <Card className="border border-border/60 shadow-xs bg-card hover:border-emerald-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {isAr ? "عدد طلاب المحضرة" : "Effectif Talibés"}
              </p>
              <h3 className="text-2xl font-black text-foreground">{totalTalibes}</h3>
              <p className="text-[11px] text-emerald-500 font-semibold">
                {totalInternes} {isAr ? "طلاب مقيمون (داخلي)" : "Pensionnaires Internes"}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Récitations du Jour */}
        <Card className="border border-border/60 shadow-xs bg-card hover:border-amber-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {isAr ? "الأحزاب المنجزة اليوم" : "Récitations du Jour"}
              </p>
              <h3 className="text-2xl font-black text-amber-500">{hifzRecordsToday}</h3>
              <p className="text-[11px] text-muted-foreground">
                {isAr ? "عرض السبق والمراجعة" : "Sabi & Muraja'a validés"}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Halqas d'Étude */}
        <Card className="border border-border/60 shadow-xs bg-card hover:border-blue-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {isAr ? "الحلقات القرآنيّة" : "Halqas d'Étude"}
              </p>
              <h3 className="text-2xl font-black text-foreground">{totalHalqas}</h3>
              <p className="text-[11px] text-muted-foreground">
                {isAr ? "مشايخ الإقراء" : "Cercles & Maîtres Oustazs"}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Cas Sociaux & Exonérés */}
        <Card className="border border-border/60 shadow-xs bg-card hover:border-emerald-500/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {isAr ? "الحالات الاجتماعية" : "Cas Sociaux"}
              </p>
              <h3 className="text-2xl font-black text-emerald-500">{totalSponsorships}</h3>
              <p className="text-[11px] text-muted-foreground">
                {isAr ? "معفون من الرسوم" : "Exonérés & Pris en charge"}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2 Panneaux Principaux : Activités Récentes & Accès Rapides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Panneau Gauche : Dernières Récitations des 60 Hizbs (Live Feed) */}
        <Card className="lg:col-span-2 border border-border/60 shadow-xs bg-card">
          <CardHeader className="p-5 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2 font-arabic">
                <BookOpen className="w-4 h-4 text-emerald-500" /> 
                {isAr ? "سجل التسميع اليومي (٦٠ حزباً)" : "Récitations Récentes (60 Hizbs)"}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {isAr ? "متابعة فورية للسبق والمراجعة على اللوح الخشبي." : "Suivi en direct des récitations validées sur l'Allwa et la Muraja'a."}
              </CardDescription>
            </div>
            <Link href="/hifz">
              <Button variant="ghost" size="sm" className="text-xs text-emerald-600 hover:text-emerald-700 gap-1 font-semibold">
                {isAr ? "عرض الكل" : "Voir tout"} <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y">
            {recentHifz.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
                <Clock className="w-6 h-6 mx-auto text-muted-foreground/40" />
                <p>{isAr ? "لا توجد تسميعات مسجلة حالياً." : "Aucune récitation enregistrée récemment."}</p>
              </div>
            ) : (
              recentHifz.map((record) => (
                <div key={record.id} className="p-4 flex items-center justify-between gap-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-xs font-bold shrink-0">
                      H{record.hizbNumber}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        {record.talibe?.firstName} {record.talibe?.lastName}
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        {isAr ? `الحزب ${record.hizbNumber}` : `Hizb ${record.hizbNumber}`} {record.surahName ? `• Sourate ${record.surahName}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-bold">
                      {record.evaluation || "MUMTAZ"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Panneau Droit : Accès Rapides aux Modules */}
        <Card className="border border-border/60 shadow-xs bg-card flex flex-col">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2 font-arabic">
              <Sparkles className="w-4 h-4 text-amber-500" /> 
              {isAr ? "اختصارات سريعة" : "Actions & Modules Rapides"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 flex-1">
            
            <Link href="/hifz" className="block">
              <div className="p-3.5 rounded-xl border border-border/60 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                      {isAr ? "جدول الـ ٦٠ حزباً" : "Grille des 60 Hizbs"}
                    </h5>
                    <p className="text-[10px] text-muted-foreground">
                      {isAr ? "تسجيل السبق والمراجعة" : "Saisie du Sabi & Muraja'a"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
              </div>
            </Link>

            <Link href="/students" className="block">
              <div className="p-3.5 rounded-xl border border-border/60 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground group-hover:text-blue-500 transition-colors">
                      {isAr ? "سجل الطلاب" : "Registre des Talibés"}
                    </h5>
                    <p className="text-[10px] text-muted-foreground">
                      {isAr ? "إدارة الطلاب والداخليين" : "Pensionnaires & Inscriptions"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
              </div>
            </Link>

            <Link href="/attendance" className="block">
              <div className="p-3.5 rounded-xl border border-border/60 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground group-hover:text-amber-500 transition-colors">
                      {isAr ? "تسجيل الحضور" : "Présences & WhatsApp"}
                    </h5>
                    <p className="text-[10px] text-muted-foreground">
                      {isAr ? "حضور الفجر والصباح والمساء" : "Appel de Halqa Subh & Soir"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
              </div>
            </Link>

            <Link href="/tuition" className="block">
              <div className="p-3.5 rounded-xl border border-border/60 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-foreground group-hover:text-purple-500 transition-colors">
                      {isAr ? "سجل الاشتراكات" : "Paiements (12 Mois)"}
                    </h5>
                    <p className="text-[10px] text-muted-foreground">
                      {isAr ? "إيصالات تحصيل الرسوم" : "Wave, OM & Reçus"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
              </div>
            </Link>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
