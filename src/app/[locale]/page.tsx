"use client";

import { Link } from "@/i18n/routing";
import { 
  BookOpen, 
  Users, 
  CreditCard
} from "lucide-react";

export default function LandingPage() {
    return (
        <div className="w-full min-h-screen bg-[#F8FAFC] text-[#0D1A63] font-sans selection:bg-[#2845D6] selection:text-white flex flex-col justify-between">
            
            {/* EN-TÊTE ULTRA ÉPURÉ */}
            <header className="w-full bg-white border-b border-slate-200/80 h-16 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#2845D6] text-white flex items-center justify-center font-black text-base">
                        T
                    </div>
                    <span className="font-extrabold text-xl tracking-tight text-[#0D1A63] leading-none">
                        Tahfiz<span className="text-[#F68048]">.sn</span>
                    </span>
                </Link>

                <div className="flex items-center gap-3">
                    <Link
                        href="/login"
                        className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#0D1A63] px-3 py-1.5 transition-colors"
                    >
                        Connexion
                    </Link>
                    <Link
                        href="/login?mode=signup"
                        className="text-xs font-semibold px-4 py-2 bg-[#2845D6] hover:bg-[#1A2CA3] text-white rounded-lg transition-colors shadow-xs active:scale-95"
                    >
                        Créer un Daara
                    </Link>
                </div>
            </header>

            {/* CONTENU PRINCIPAL */}
            <main className="w-full flex-1 max-w-4xl mx-auto px-6 py-12 sm:py-20 space-y-12 sm:space-y-16">
                
                {/* HERO SECTION */}
                <div className="w-full text-center space-y-6 max-w-2xl mx-auto">
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#0D1A63] leading-[1.15] tracking-tight">
                        La gestion simple et moderne des <span className="text-[#2845D6]">Daaras</span>.
                    </h1>

                    <p className="text-slate-700 text-sm sm:text-base font-semibold leading-relaxed max-w-lg mx-auto">
                        Suivi du Coran (60 Hizbs), pointage des présences et paiement de la scolarité par Wave & Orange Money.
                    </p>

                    {/* BOUTONS TEXTE PUR (SANS ICÔNES DÉCORDATIVES) */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
                        <Link
                            href="/login?mode=signup"
                            className="w-full sm:w-auto px-7 py-3 bg-[#2845D6] hover:bg-[#1A2CA3] text-white font-semibold text-sm rounded-lg transition-colors shadow-sm active:scale-95 text-center"
                        >
                            Accéder à la plateforme
                        </Link>
                        <Link
                            href="/daaras"
                            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-[#0D1A63] font-semibold text-sm rounded-lg transition-colors text-center"
                        >
                            Annuaire des Daaras
                        </Link>
                    </div>
                </div>

                {/* LES 3 CARTES AVEC DESIGN MINIMALISTE */}
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* 1. Tahfiz */}
                    <Link 
                        href="/hifz"
                        className="bg-white border border-slate-200 p-6 rounded-xl space-y-3 hover:border-[#2845D6] transition-all group"
                    >
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2845D6] flex items-center justify-center font-bold">
                            <BookOpen className="w-4 h-4" />
                        </div>
                        <h2 className="text-base font-bold text-[#0D1A63] group-hover:text-[#2845D6] transition-colors">
                            1. Tahfiz & Allwa (لوح)
                        </h2>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Suivi des 60 Hizbs, Sabi (leçon du jour) et Muraja'a (révisions) pour chaque Talibé.
                        </p>
                    </Link>

                    {/* 2. Présences */}
                    <Link 
                        href="/attendance"
                        className="bg-white border border-slate-200 p-6 rounded-xl space-y-3 hover:border-[#2845D6] transition-all group"
                    >
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2845D6] flex items-center justify-center font-bold">
                            <Users className="w-4 h-4" />
                        </div>
                        <h2 className="text-base font-bold text-[#0D1A63] group-hover:text-[#2845D6] transition-colors">
                            2. Présences WhatsApp
                        </h2>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Pointage rapide aux sessions de Halqa et notification instantanée des parents.
                        </p>
                    </Link>

                    {/* 3. Scolarité */}
                    <Link 
                        href="/tuition"
                        className="bg-white border border-slate-200 p-6 rounded-xl space-y-3 hover:border-[#2845D6] transition-all group"
                    >
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2845D6] flex items-center justify-center font-bold">
                            <CreditCard className="w-4 h-4" />
                        </div>
                        <h2 className="text-base font-bold text-[#0D1A63] group-hover:text-[#2845D6] transition-colors">
                            3. Cotisations Wave & OM
                        </h2>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Paiement direct des scolarités mensuelles avec reçus PDF automatiques.
                        </p>
                    </Link>

                </div>

                {/* BANNIÈRE SOS ÉPURÉE */}
                <div className="w-full bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#F68048] shrink-0" />
                        <span className="text-xs font-bold text-[#0D1A63]">Réseau SOS Talibés Disparus</span>
                    </div>
                    <Link 
                        href="/sos-disparus" 
                        className="text-xs font-semibold text-[#2845D6] hover:underline"
                    >
                        Signaler ou rechercher un enfant
                    </Link>
                </div>

            </main>

            {/* PIED DE PAGE */}
            <footer className="w-full bg-white border-t border-slate-200 py-6 px-6 text-center text-xs text-slate-400 font-medium">
                © {new Date().getFullYear()} Tahfiz.sn • Plateforme de gestion des Daaras au Sénégal.
            </footer>

        </div>
    );
}
