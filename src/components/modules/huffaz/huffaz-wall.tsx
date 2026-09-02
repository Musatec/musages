"use client";

import React, { useState } from "react";
import { Award, BookOpen, Search, Star, Calendar, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

import { useTranslations } from "next-intl";

interface Hafiz {
  id: string;
  name: string;
  arabicName: string;
  graduationYear: number;
  hizbCount: number;
  mention: string;
  oustaz: string;
  currentRole?: string;
  photoUrl?: string;
}

const DUMMY_HUFFAZ: Hafiz[] = [
  {
    id: "hafiz-1",
    name: "Ibrahima Diallo",
    arabicName: "إبراهيم ديالو",
    graduationYear: 2024,
    hizbCount: 60,
    mention: "Mention Très Bien (Imtiaz)",
    oustaz: "Oustaz Thierno Alassane",
    currentRole: "Enseignant de Tajweed & Étudiant en Théologie",
  },
  {
    id: "hafiz-2",
    name: "Mouhamed Sall",
    arabicName: "محمد صال",
    graduationYear: 2024,
    hizbCount: 60,
    mention: "Mention Excellent avec Félicitations",
    oustaz: "Oustaz Cheikh Ndiaye",
    currentRole: "Récitateur & Imam",
  },
  {
    id: "hafiz-3",
    name: "Aïssatou Ba",
    arabicName: "عائشة با",
    graduationYear: 2023,
    hizbCount: 60,
    mention: "Mention Très Bien",
    oustaz: "Oustaz Thierno Alassane",
    currentRole: "Étudiante en Médecine & Hafiza",
  },
  {
    id: "hafiz-4",
    name: "Ousmane Kane",
    arabicName: "عثمان كان",
    graduationYear: 2023,
    hizbCount: 60,
    mention: "Mention Excellent",
    oustaz: "Oustaz Mamadou Sow",
    currentRole: "Ingénieur & Hafiz",
  },
  {
    id: "hafiz-5",
    name: "Cheikh Tidiane Wade",
    arabicName: "الشيخ تجان واد",
    graduationYear: 2022,
    hizbCount: 60,
    mention: "Mention Très Bien",
    oustaz: "Oustaz Cheikh Ndiaye",
    currentRole: "Oustaz au Daara Ibnoul Khayim",
  },
  {
    id: "hafiz-6",
    name: "Fatoumata Binetou Sy",
    arabicName: "فاطمة بينتو سي",
    graduationYear: 2022,
    hizbCount: 60,
    mention: "Mention Excellent avec Félicitations",
    oustaz: "Oustaz Thierno Alassane",
    currentRole: "Monitrice de Halqa Coranique",
  },
];

export function HuffazWall() {
  const t = useTranslations("Huffaz");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("ALL");

  const filteredHuffaz = DUMMY_HUFFAZ.filter((hafiz) => {
    const matchesSearch =
      hafiz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hafiz.arabicName.includes(searchTerm) ||
      hafiz.oustaz.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === "ALL" || hafiz.graduationYear.toString() === selectedYear;
    return matchesSearch && matchesYear;
  });

  return (
    <section id="huffaz" className="w-full py-16 px-4 md:px-8 bg-gradient-to-b from-[#FAFAF7] via-emerald-950/5 to-[#FAFAF7]">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#D4AF37]">
            {t("tag")}
          </p>

          <h2 className="text-3xl md:text-5xl font-extrabold text-[#0C5A34] tracking-tight font-classic">
            {t("title")}
          </h2>

          <p className="text-slate-600 font-normal text-sm md:text-base leading-relaxed font-arabic">
            {t("hadith")}
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-emerald-900/10 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {["ALL", "2024", "2023", "2022"].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedYear === year
                    ? "bg-[#0C5A34] text-white shadow-md shadow-[#0C5A34]/20"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {year === "ALL" ? t("all_years") : `${t("promo")} ${year}`}
              </button>
            ))}
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHuffaz.map((hafiz) => (
            <div
              key={hafiz.id}
              className="group relative bg-white border border-emerald-900/10 rounded-2xl p-6 space-y-4 hover:border-[#D4AF37] hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              {/* Header Profile Info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0C5A34] to-[#127844] text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-[#D4AF37]/50 shrink-0">
                  <Award className="w-7 h-7 text-[#FFE57F]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#0A192F] group-hover:text-[#0C5A34] transition-colors">
                    {hafiz.name}
                  </h3>
                  <p className="font-serif text-sm font-bold text-[#0C5A34] dir-rtl">
                    {hafiz.arabicName}
                  </p>
                </div>
              </div>

              {/* Details Badges */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {t("promo")} :
                  </span>
                  <span className="font-bold text-[#0A192F]">{hafiz.graduationYear}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <BookOpen className="w-3.5 h-3.5 text-[#0C5A34]" />
                    {t("encadrant")} :
                  </span>
                  <span className="font-semibold text-slate-800">{hafiz.oustaz}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Star className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {t("distinction")} :
                  </span>
                  <span className="font-bold text-[#0C5A34] text-[11px]">{hafiz.mention}</span>
                </div>
              </div>

              {hafiz.currentRole && (
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5 text-[11px] font-semibold text-emerald-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0C5A34] shrink-0" />
                  <span>{hafiz.currentRole}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footnote */}
        <div className="bg-white border border-[#D4AF37]/30 rounded-2xl p-6 text-center space-y-2 shadow-sm">
          <div className="flex items-center justify-center gap-2 text-[#0C5A34] font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            <span>{t("cert_footnote")}</span>
          </div>
          <p className="text-xs text-slate-500 max-w-xl mx-auto">
            {t("cert_desc")}
          </p>
        </div>
      </div>
    </section>
  );
}
