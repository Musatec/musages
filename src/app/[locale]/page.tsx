"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { ArrowRight, BookOpen, GraduationCap, Lock } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default function BureauPortalHomePage() {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen w-full bg-[#F8FAF9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between overflow-x-hidden"
    >
      {/* En-tête simple et institutionnel */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/logo-daara-ibnoul-khayim.png"
              alt="Logo Ibnoul Khayim"
              className="h-8 w-8 sm:h-9 sm:w-9 object-contain shrink-0"
            />
            <div className="min-w-0 leading-tight">
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {isAr ? "مدرسة ابن القيم الجوزية" : "École Ibnoul Khayim Al Jawziya"}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                {isAr ? "إدارة الدار والمدرسة" : "Daara & École Pathé Pogne"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 bg-[#0C5A34] hover:bg-[#094728] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isAr ? "دخول" : "Connexion"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenu principal compact et responsive */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-xl space-y-6">
          <div className="space-y-3 text-center sm:text-start">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#0C5A34] dark:text-emerald-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>
                {isAr ? "بوابة الإدارة الداخلية" : "Portail interne du bureau"}
              </span>
            </p>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
              {isAr
                ? "إدارة مدرسة ابن القيم الجوزية"
                : "Gestion de l'École Ibnoul Khayim Al Jawziya"}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {isAr
                ? "تطبيق خاص بالمكتب لمتابعة شؤون الدار والمدرسة الفرنسية العربية باتيه بوغني."
                : "Application réservée au bureau pour la gestion administrative, pédagogique et financière du Daara et de l'École Pathé Pogne."}
            </p>
          </div>

          {/* Liste compacte des 2 espaces (sans grandes cartes) */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
            <div className="p-3.5 sm:p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#0C5A34] dark:text-emerald-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {isAr ? "فضاء القرآن (الدار)" : "Espace Daara"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr
                    ? "الحفظ، الختمات، الحلقات، الطلاب، المشايخ والمالية"
                    : "Suivi Hifz, Khatms, Halqas, Talibés, Oustazs et Trésorerie"}
                </p>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {isAr ? "مدرسة باتيه بوغني" : "École Pathé Pogne"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr
                    ? "الأقسام (CI–CP، CE1–CE2، CM1–CM2)، كشوف الدرجات والرواتب"
                    : "Classes (CI–CP, CE1–CE2, CM1–CM2), Bulletins bilingues et Salaires"}
                </p>
              </div>
            </div>
          </div>

          {/* Bouton principal Commencer */}
          <div>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#0C5A34] hover:bg-[#094728] text-white font-bold text-sm px-6 py-3 rounded-lg shadow-sm transition-colors"
            >
              <span>{isAr ? "ابدأ الآن" : "Commencer"}</span>
              <ArrowRight className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
            </Link>
          </div>
        </div>
      </main>

      {/* Pied de page minimal */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-3.5 px-4 text-center text-[11px] text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} {isAr ? "مدرسة ابن القيم الجوزية · باتيه بوغني" : "Daara Ibnoul Khayim · École Pathé Pogne"}
      </footer>
    </div>
  );
}
