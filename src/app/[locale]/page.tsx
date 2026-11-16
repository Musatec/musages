"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Lock,
  ShieldCheck,
  Sparkles,
  FileSpreadsheet,
  Users,
  Wallet,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default function BureauPortalHomePage() {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950 via-slate-950 to-slate-950 text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-white overflow-x-hidden"
    >
      {/* 1. EN-TÊTE INSTITUTIONNEL ÉPURÉ */}
      <header className="w-full border-b border-white/10 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white/10 border border-white/15 p-1.5 flex items-center justify-center shrink-0">
              <img
                src="/logo-daara-ibnoul-khayim.png"
                alt="Logo Ibnoul Khayim"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-white truncate">
                {isAr ? "مدرسة ابن القيم الجوزية" : "École Ibnoul Khayim Al Jawziya"}
              </p>
              <p className="text-[10px] sm:text-xs font-semibold text-emerald-300/90 truncate">
                {isAr
                  ? "بوابة الإدارة — دار القرآن ومدرسة باتيه بوغني"
                  : "Portail de Gestion • Daara & École Pathé Pogne"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-900/40 transition-all active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isAr ? "تسجيل الدخول" : "Connexion"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. CORPS CENTRAL : PORTAIL PRIVÉ DU BUREAU */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 sm:py-16">
        <div className="max-w-5xl w-full space-y-8 sm:space-y-10">
          {/* Badge de sécurité Bureau */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[11px] sm:text-xs font-bold tracking-wide shadow-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                {isAr
                  ? "نظام خاص بالإدارة — الدخول مقتصر على أعضاء المكتب"
                  : "Application Privée • Accès réservé exclusivement au Bureau"}
              </span>
            </div>
          </div>

          {/* Titre Principal & Bouton Commencer */}
          <div className="text-center space-y-5 max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.12] text-white">
              {isAr ? (
                <>
                  الإدارة الشاملة لـ{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">
                    مدرسة ابن القيم الجوزية
                  </span>
                </>
              ) : (
                <>
                  Gestion de l&apos;École{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                    Ibnoul Khayim Al Jawziya
                  </span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              {isAr
                ? "المنصة الرسمية للمكتب لإدارة فضاء القرآن (الحفظ، الختمات، الحلقات) والمدرسة الفرنسية العربية باتيه بوغني (التقييمات، كشوف الدرجات، ورواتب المعلمين)."
                : "Plateforme interne du bureau dédiée au pilotage complet du Daara (Hifz, Khatms, Halqas, Finances) et de l'École Franco-Arabe Pathé Pogne (Évaluations, Bulletins bilingues et Salaires)."}
            </p>

            {/* Bouton Principal COMMENCER -> /login */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black uppercase tracking-wider text-sm sm:text-base px-8 py-4 rounded-2xl shadow-xl shadow-emerald-950/60 transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>{isAr ? "ابدأ الآن" : "Commencer"}</span>
                <ArrowRight className={`w-5 h-5 ${isAr ? "rotate-180" : ""}`} />
              </Link>
            </div>
          </div>

          {/* 2 Cartes des Espaces Gérés */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
            {/* Carte 1 : Espace Daara */}
            <div className="rounded-3xl border border-emerald-500/25 bg-white/[0.04] backdrop-blur-md p-6 sm:p-7 space-y-4 hover:border-emerald-400/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-emerald-300" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">
                  {isAr ? "فضاء القرآن" : "Espace Daara"}
                </span>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {isAr ? "دار ابن القيم الجوزية" : "Daara Ibnoul Khayim Al Diawziya"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  {isAr
                    ? "متابعة حفظ 60 حزباً، تسجيل الختمات، الحلقات، الكفالات، وإدارة المصاريف."
                    : "Suivi des 60 Hizbs, Khatms, gestion des Halqas, Talibés, Parrainages et Trésorerie."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold text-emerald-200/90">
                <span className="inline-flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  {isAr ? "60 حزباً" : "Hifz & Khatm"}
                </span>
                <span className="inline-flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <Users className="w-3 h-3 text-emerald-400" />
                  {isAr ? "الطلاب والمشايخ" : "Talibés & Oustazs"}
                </span>
              </div>
            </div>

            {/* Carte 2 : École Franco-Arabe Pathé Pogne */}
            <div className="rounded-3xl border border-amber-400/25 bg-white/[0.04] backdrop-blur-md p-6 sm:p-7 space-y-4 hover:border-amber-300/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-amber-300" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-400/15 text-amber-200 border border-amber-300/20">
                  {isAr ? "المدرسة الفرنسية العربية" : "École Pathé Pogne"}
                </span>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {isAr ? "المدرسة الفرنسية العربية باتيه بوغني" : "École Franco-Arabe Pathé Pogne"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  {isAr
                    ? "الأقسام المدمجة (التحضيري، الابتدائي، المتوسط)، كشوف الدرجات، وحساب رواتب الأساتذة."
                    : "Cycle 3 ans (CI–CP, CE1–CE2, CM1–CM2), évaluations GEC, bulletins bilingues et paie (TH × CH)."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-semibold text-amber-100/90">
                <span className="inline-flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <FileSpreadsheet className="w-3 h-3 text-amber-300" />
                  {isAr ? "كشوف الدرجات" : "Bulletins Bilingues"}
                </span>
                <span className="inline-flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                  <Wallet className="w-3 h-3 text-amber-300" />
                  {isAr ? "رواتب المعلمين" : "Salaires Auto"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. PIED DE PAGE PRIVÉ MINIMALISTE */}
      <footer className="w-full border-t border-white/10 py-4 px-4 text-center text-[11px] sm:text-xs text-slate-400">
        © {new Date().getFullYear()} {isAr ? "مدرسة ابن القيم الجوزية · مدرسة باتيه بوغني — نظام الإدارة الداخلي" : "Daara Ibnoul Khayim Al Diawziya · École Pathé Pogne — Portail Interne du Bureau"}
      </footer>
    </div>
  );
}
