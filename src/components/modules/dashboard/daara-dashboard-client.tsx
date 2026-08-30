"use client";

import { 
  BookOpen, 
  Users, 
  CalendarCheck, 
  CreditCard, 
  Flame, 
  ChevronRight,
  ArrowRight
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
      {/* Header Banner - Color Hunt Deep Navy */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0D1A63] border border-[#1A2CA3] p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1A2CA3] border border-[#2845D6]/40 text-[#F68048] text-xs font-bold uppercase tracking-wider">
              Espace de Gestion Daara
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-heading">
              {daaraName}
            </h1>
            <p className="text-slate-200 text-xs sm:text-sm font-medium">
              Plateforme souveraine de suivi des 60 Hizbs, présences WhatsApp et scolarités.
            </p>
          </div>

          <Link href="/hifz">
            <Button className="bg-[#2845D6] hover:bg-[#1A2CA3] text-white font-bold text-xs sm:text-sm gap-2 shadow-md rounded-xl px-5 py-2.5">
              <BookOpen className="w-4 h-4" /> Suivi 60 Hizbs <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Cartes KPI Principales - Contrastes Soignés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Effectif Talibes */}
        <Card className="border border-slate-200 shadow-sm bg-white hover:border-[#2845D6]/40 transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Effectif Talibés</p>
              <h3 className="text-3xl font-black text-[#0D1A63] mt-1">{totalTalibes}</h3>
              <p className="text-[11px] text-[#2845D6] font-bold mt-0.5">{totalInternes} Pensionnaires Internes</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2845D6] flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Recitations du Jour */}
        <Card className="border border-slate-200 shadow-sm bg-white hover:border-[#2845D6]/40 transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Récitations du Jour</p>
              <h3 className="text-3xl font-black text-[#F68048] mt-1">{hifzRecordsToday}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Sabi & Muraja'a validés</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#F68048] flex items-center justify-center font-bold">
              <Flame className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Halqas */}
        <Card className="border border-slate-200 shadow-sm bg-white hover:border-[#2845D6]/40 transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Halqas d'Étude</p>
              <h3 className="text-3xl font-black text-[#0D1A63] mt-1">{totalHalqas}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Cercles de ritation</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2845D6] flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Presences */}
        <Card className="border border-slate-200 shadow-sm bg-white hover:border-[#2845D6]/40 transition-all">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pointages Halqas</p>
              <h3 className="text-3xl font-black text-[#2845D6] mt-1">100%</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Alertes WhatsApp actives</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2845D6] flex items-center justify-center font-bold">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cartes d'accès direct aux 3 piliers indispensables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Pilier 1: Tahfiz */}
        <Card className="border border-slate-200 shadow-sm bg-white hover:border-[#2845D6] transition-all group">
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#0D1A63] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#2845D6]" /> 1. Tahfiz & Allwa (لوح)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Suivi de la mémorisation (Sabi, Muraja'a) sur les 60 Hizbs pour chaque Talibé.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/hifz">
              <Button className="w-full bg-[#2845D6] hover:bg-[#1A2CA3] text-white font-bold text-xs rounded-xl shadow-xs">
                Ouvrir la Grille des 60 Hizbs <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Pilier 2: Presences */}
        <Card className="border border-slate-200 shadow-sm bg-white hover:border-[#2845D6] transition-all group">
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#0D1A63] flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[#2845D6]" /> 2. Présences WhatsApp
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Pointage des présences par session (Fajr, Matin, Soir) et relance des parents.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/attendance">
              <Button className="w-full bg-white hover:bg-slate-50 text-[#0D1A63] font-bold text-xs border border-slate-300 rounded-xl shadow-xs">
                Gérer les Présences <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Pilier 3: Scolarite */}
        <Card className="border border-slate-200 shadow-sm bg-white hover:border-[#2845D6] transition-all group">
          <CardHeader>
            <CardTitle className="text-base font-bold text-[#0D1A63] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#2845D6]" /> 3. Scolarité Wave & OM
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Encaissement des mensualités par Wave / Orange Money et reçus PDF.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/tuition">
              <Button className="w-full bg-white hover:bg-slate-50 text-[#0D1A63] font-bold text-xs border border-slate-300 rounded-xl shadow-xs">
                Gérer les Mensualités <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
