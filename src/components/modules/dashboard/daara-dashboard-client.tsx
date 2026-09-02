"use client";

import { 
  BookOpen, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  Flame, 
  ChevronRight,
  ArrowRight,
  Award,
  UserCheck,
  TrendingUp,
  ShieldCheck,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
  return (
    <div className="space-y-8 py-4">
      {/* Header Banner - Color Hunt Deep Navy & Emerald */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0A192F] border border-[#0C5A34]/50 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-black uppercase tracking-widest text-[#D4AF37]">
              Centre de Gestion 360° — Daara Ibnoul Khayim Al Diawziya
            </p>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-classic">
              {daaraName}
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm font-normal max-w-xl">
              Plateforme souveraine de suivi des 60 Hizbs, gestion des talibés internes, pointage des Halqas et cotisations mensuelles.
            </p>
          </div>

          <Link href="/hifz">
            <Button className="bg-[#0C5A34] hover:bg-[#06381F] text-white font-bold text-xs sm:text-sm gap-2 shadow-md rounded-xl px-5 py-3">
              <BookOpen className="w-4 h-4 text-[#FFE57F]" /> Suivi 60 Hizbs <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Cartes KPI Principales - Gestion Totale */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Effectif Talibes */}
        <Card className="border border-slate-200 shadow-xs bg-white hover:border-[#0C5A34]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Effectif Talibés</p>
              <h3 className="text-3xl font-extrabold text-[#0A192F] font-classic mt-1">{totalTalibes}</h3>
              <p className="text-[11px] text-[#0C5A34] font-bold mt-0.5">{totalInternes} Pensionnaires Internes</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0C5A34] flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Recitations du Jour */}
        <Card className="border border-slate-200 shadow-xs bg-white hover:border-[#D4AF37]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Récitations du Jour</p>
              <h3 className="text-3xl font-extrabold text-[#B8860B] font-classic mt-1">{hifzRecordsToday}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Sabi & Muraja'a validés</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D4AF37] flex items-center justify-center font-bold">
              <Flame className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Halqas */}
        <Card className="border border-slate-200 shadow-xs bg-white hover:border-[#0C5A34]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Halqas d'Étude</p>
              <h3 className="text-3xl font-extrabold text-[#0A192F] font-classic mt-1">{totalHalqas}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Cercles de récitation & Oustazs</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0C5A34] flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Pointages WhatsApp */}
        <Card className="border border-slate-200 shadow-xs bg-white hover:border-[#0C5A34]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Pointages Halqas</p>
              <h3 className="text-3xl font-extrabold text-[#0C5A34] font-classic mt-1">100%</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Alertes WhatsApp actives</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0C5A34] flex items-center justify-center font-bold">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Diplômes Huffaz */}
        <Card className="border border-slate-200 shadow-xs bg-white hover:border-[#D4AF37]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Lauréats 60 Hizbs</p>
              <h3 className="text-3xl font-extrabold text-[#D4AF37] font-classic mt-1">100+</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Huffaz certifiés au Daara</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D4AF37] flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Cotisations Wave/OM */}
        <Card className="border border-slate-200 shadow-xs bg-white hover:border-[#0C5A34]/40 transition-all">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Scolarités & Reçus</p>
              <h3 className="text-3xl font-extrabold text-[#0A192F] font-classic mt-1">Wave / OM</h3>
              <p className="text-[11px] text-[#0C5A34] font-bold mt-0.5">Encaissements à jour</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0C5A34] flex items-center justify-center font-bold">
              <CreditCard className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cartes des 6 piliers de Gestion Totale du Daara */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-[#0A192F] font-classic border-b border-slate-200 pb-2">
          Piliers de Gestion Globale du Daara
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Pilier 1: Tahfiz & 60 Hizbs */}
          <Card className="border border-slate-200 shadow-xs bg-white hover:border-[#0C5A34] transition-all group">
            <CardHeader className="p-5">
              <CardTitle className="text-base font-bold text-[#0A192F] flex items-center gap-2 font-classic">
                <BookOpen className="w-5 h-5 text-[#0C5A34]" /> 1. Tahfiz & Allwa (لوح)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Suivi quotidien de la mémorisation (Sabi, Sabakh, Muraja'a) sur les 60 Hizbs pour chaque talibé.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Link href="/hifz">
                <Button className="w-full bg-[#0C5A34] hover:bg-[#06381F] text-white font-bold text-xs rounded-xl shadow-xs">
                  Grille des 60 Hizbs <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pilier 2: Talibes & Pensionnaires */}
          <Card className="border border-slate-200 shadow-xs bg-white hover:border-[#0C5A34] transition-all group">
            <CardHeader className="p-5">
              <CardTitle className="text-base font-bold text-[#0A192F] flex items-center gap-2 font-classic">
                <Users className="w-5 h-5 text-[#0C5A34]" /> 2. Registre des Talibés
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Gestion des effectifs, fiches individuelles, tuteurs WhatsApp et pensionnaires internes.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Link href="/students">
                <Button className="w-full bg-white hover:bg-slate-50 text-[#0A192F] font-bold text-xs border border-slate-300 rounded-xl shadow-xs">
                  Gérer les Talibés <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pilier 3: Halqas & Oustazs */}
          <Card className="border border-slate-200 shadow-xs bg-white hover:border-[#0C5A34] transition-all group">
            <CardHeader className="p-5">
              <CardTitle className="text-base font-bold text-[#0A192F] flex items-center gap-2 font-classic">
                <UserCheck className="w-5 h-5 text-[#0C5A34]" /> 3. Halqas & Oustazs
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Répartition des cercles d'études, affectation des maîtres coraniques et plannings.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Link href="/classes">
                <Button className="w-full bg-white hover:bg-slate-50 text-[#0A192F] font-bold text-xs border border-slate-300 rounded-xl shadow-xs">
                  Gérer les Halqas <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pilier 4: Presences WhatsApp */}
          <Card className="border border-slate-200 shadow-xs bg-white hover:border-[#0C5A34] transition-all group">
            <CardHeader className="p-5">
              <CardTitle className="text-base font-bold text-[#0A192F] flex items-center gap-2 font-classic">
                <CalendarCheck className="w-5 h-5 text-[#0C5A34]" /> 4. Présences & Alertes
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Pointage des présences par session (Fajr, Matin, Soir) et notification des retards aux parents.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Link href="/attendance">
                <Button className="w-full bg-white hover:bg-slate-50 text-[#0A192F] font-bold text-xs border border-slate-300 rounded-xl shadow-xs">
                  Pointer les Présences <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pilier 5: Scolarite Wave & OM */}
          <Card className="border border-slate-200 shadow-xs bg-white hover:border-[#0C5A34] transition-all group">
            <CardHeader className="p-5">
              <CardTitle className="text-base font-bold text-[#0A192F] flex items-center gap-2 font-classic">
                <CreditCard className="w-5 h-5 text-[#0C5A34]" /> 5. Scolarités Wave & OM
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Encaissement des mensualités par paiement mobile, reçu PDF instantané et relances.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Link href="/tuition">
                <Button className="w-full bg-white hover:bg-slate-50 text-[#0A192F] font-bold text-xs border border-slate-300 rounded-xl shadow-xs">
                  Gérer les Scolarités <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pilier 6: Diplomes & Khatm */}
          <Card className="border border-slate-200 shadow-xs bg-white hover:border-[#D4AF37] transition-all group">
            <CardHeader className="p-5">
              <CardTitle className="text-base font-bold text-[#0A192F] flex items-center gap-2 font-classic">
                <Award className="w-5 h-5 text-[#D4AF37]" /> 6. Diplômes des 60 Hizbs
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Attestations d'Excellence, cérémonies de Khatm Coran et mise à jour du Tableau d'Honneur.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <Link href="/khatm">
                <Button className="w-full bg-white hover:bg-slate-50 text-[#0A192F] font-bold text-xs border border border-slate-300 rounded-xl shadow-xs">
                  Diplômes & Khatm <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
