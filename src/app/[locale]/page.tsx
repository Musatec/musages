"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { 
  BookOpen, 
  Award, 
  CheckCircle2, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight, 
  UserCheck, 
  ShieldCheck,
  Send,
  HeartHandshake
} from "lucide-react";
import { HuffazWall } from "@/components/modules/huffaz/huffaz-wall";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export default function LandingPage() {
  const tNav = useTranslations("Nav");
  const tLanding = useTranslations("Landing");
  const tHistory = useTranslations("History");
  const tPrograms = useTranslations("Programs");
  const tEnrollment = useTranslations("Enrollment");
  const tPortal = useTranslations("Portal");
  const tFooter = useTranslations("Footer");

  const [enrollForm, setEnrollForm] = useState({
    studentName: "",
    age: "",
    hizbLevel: "0",
    program: "TAHFIZ_FULL",
    parentName: "",
    phone: "",
    email: "",
    comments: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitEnrollment = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAF7] text-[#0A192F] font-sans selection:bg-[#0C5A34] selection:text-white flex flex-col justify-between">
      
      {/* 1. EN-TÊTE ÉPURÉ & NOBLE - FIXE (STICKY) */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 sm:h-20 md:h-24 px-3 sm:px-6 md:px-12 flex items-center justify-between sticky top-0 z-50 shadow-xs">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
          <img 
            src="/logo-daara-ibnoul-khayim.png" 
            alt="Logo Daara Ibnoul Khayim Al Diawziya" 
            className="h-12 sm:h-16 md:h-20 w-auto object-contain shrink-0" 
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-xs md:text-sm font-black text-[#0C5A34] uppercase tracking-wider">
              École Ibnoul Khayim Al Jawziya
            </span>
            <span className="text-[11px] md:text-xs font-bold text-[#D4AF37] font-serif dir-rtl">
              مدرسة ابن القيم الجوزية
            </span>
          </div>
        </Link>

        {/* Menu Navigation Desktop - Lisible & Clé */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-4 text-sm md:text-base font-bold text-slate-800">
          <a href="#histoire" className="hover:text-[#0C5A34] hover:bg-emerald-50/70 px-3.5 py-2 rounded-xl transition-all">{tNav("histoire")}</a>
          <a href="#programmes" className="hover:text-[#0C5A34] hover:bg-emerald-50/70 px-3.5 py-2 rounded-xl transition-all">{tNav("programmes")}</a>
          <a href="#huffaz" className="hover:text-[#0C5A34] hover:bg-emerald-50/70 px-3.5 py-2 rounded-xl transition-all">{tNav("huffaz")}</a>
          <a href="#inscription" className="hover:text-[#0C5A34] hover:bg-emerald-50/70 px-3.5 py-2 rounded-xl transition-all">{tNav("inscription")}</a>
          <a href="#portail" className="hover:text-[#0C5A34] hover:bg-emerald-50/70 px-3.5 py-2 rounded-xl transition-all">{tNav("portail")}</a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          
          <Link
            href="/login"
            className="text-xs sm:text-sm font-bold px-3.5 sm:px-5 py-2 sm:py-2.5 bg-[#0C5A34] hover:bg-[#06381F] text-white rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>{tLanding("cta_portal")}</span>
          </Link>
        </div>
      </header>

      {/* Barre d'Onglets Mobile Rapides */}
      <div className="flex lg:hidden items-center justify-start overflow-x-auto bg-white border-b border-slate-200 px-3 py-2 gap-2 text-xs font-bold text-slate-700 sticky top-16 z-40 no-scrollbar shadow-2xs">
        <a href="#histoire" className="px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-emerald-50 hover:text-[#0C5A34] shrink-0">{tNav("histoire")}</a>
        <a href="#programmes" className="px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-emerald-50 hover:text-[#0C5A34] shrink-0">{tNav("programmes")}</a>
        <a href="#huffaz" className="px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-emerald-50 hover:text-[#0C5A34] shrink-0">{tNav("huffaz")}</a>
        <a href="#inscription" className="px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-emerald-50 hover:text-[#0C5A34] shrink-0">{tNav("inscription")}</a>
        <a href="#portail" className="px-3 py-1.5 bg-slate-100 rounded-lg hover:bg-emerald-50 hover:text-[#0C5A34] shrink-0">{tNav("portail")}</a>
      </div>

      {/* 2. HERO SECTION MAJESTUEUSE */}
      <section className="w-full bg-[#FAFAF7] py-16 md:py-24 px-4 md:px-12 border-b border-slate-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Texte Hero */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <p className="text-xl md:text-2xl font-bold text-[#D4AF37] font-arabic dir-rtl tracking-wide">
              {tLanding("verse")}
            </p>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0A192F] leading-[1.15] tracking-tight font-classic">
              {tLanding("title")}
            </h1>

            <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed max-w-xl mx-auto lg:mx-0 tracking-normal">
              {tLanding("subtitle")}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#inscription"
                className="w-full sm:w-auto px-8 py-3.5 bg-[#0C5A34] hover:bg-[#06381F] text-white font-semibold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 text-center flex items-center justify-center gap-2"
              >
                <span>{tLanding("cta_enroll")}</span>
              </a>
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-3.5 bg-white border border-[#D4AF37] hover:bg-slate-50 text-[#0A192F] font-semibold text-xs uppercase tracking-widest rounded-xl transition-all text-center flex items-center justify-center gap-2"
              >
                <span>{tLanding("cta_portal")}</span>
              </Link>
            </div>

            {/* Statistiques Clés */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200 text-center sm:text-left">
              <div>
                <p className="text-2xl md:text-3xl font-bold text-[#0C5A34] font-classic">{tLanding("stat_huffaz")}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{tLanding("stat_huffaz_label")}</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-[#D4AF37] font-classic">{tLanding("stat_hizb")}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{tLanding("stat_hizb_label")}</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-[#0C5A34] font-classic">{tLanding("stat_mastery")}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{tLanding("stat_mastery_label")}</p>
              </div>
            </div>
          </div>

          {/* Logo Grand Format Officiel */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-lg text-center">
              <img
                src="/logo-daara-ibnoul-khayim.png"
                alt="Logo Daara Ibnoul Khayim Al Diawziya"
                className="w-72 h-72 sm:w-80 sm:h-80 object-contain mx-auto"
              />
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-xs font-bold text-[#0C5A34] uppercase tracking-widest font-arabic block">
                  مدرسة ابن القيم الجوزية
                </span>
                <span className="text-[11px] font-medium text-slate-500 block">
                  {tLanding("school_subtitle")}
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. NOTRE HISTOIRE & VALEURS PÉDAGOGIQUES */}
      <section id="histoire" className="w-full py-16 px-4 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#0C5A34]">
              {tHistory("tag")}
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A192F] font-classic">
              {tHistory("title")}
            </h2>
            <p className="text-slate-600 text-sm md:text-base font-normal leading-relaxed">
              {tHistory("description")}
            </p>
          </div>

          {/* Les 4 Piliers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pilier 1 */}
            <div className="bg-[#FAFAF7] border border-slate-200 p-6 rounded-2xl space-y-3 hover:border-[#0C5A34] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#0C5A34] flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0A192F] group-hover:text-[#0C5A34] transition-colors font-classic">
                {tHistory("pillar1_title")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {tHistory("pillar1_desc")}
              </p>
            </div>

            {/* Pilier 2 */}
            <div className="bg-[#FAFAF7] border border-slate-200 p-6 rounded-2xl space-y-3 hover:border-[#0C5A34] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-[#D4AF37] flex items-center justify-center font-bold">
                <Award className="w-6 h-6 text-[#B8860B]" />
              </div>
              <h3 className="text-base font-bold text-[#0A192F] group-hover:text-[#0C5A34] transition-colors font-classic">
                {tHistory("pillar2_title")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {tHistory("pillar2_desc")}
              </p>
            </div>

            {/* Pilier 3 */}
            <div className="bg-[#FAFAF7] border border-slate-200 p-6 rounded-2xl space-y-3 hover:border-[#0C5A34] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#0C5A34] flex items-center justify-center font-bold">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#0A192F] group-hover:text-[#0C5A34] transition-colors font-classic">
                {tHistory("pillar3_title")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {tHistory("pillar3_desc")}
              </p>
            </div>

            {/* Pilier 4 */}
            <div className="bg-[#FAFAF7] border border-slate-200 p-6 rounded-2xl space-y-3 hover:border-[#0C5A34] transition-all group">
              <div className="w-12 h-12 rounded-xl bg-slate-200 text-[#0A192F] flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6 text-[#0C5A34]" />
              </div>
              <h3 className="text-base font-bold text-[#0A192F] group-hover:text-[#0C5A34] transition-colors font-classic">
                {tHistory("pillar4_title")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {tHistory("pillar4_desc")}
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. TABLEAU D'HONNEUR DES HUFFAZ */}
      <HuffazWall />

      {/* 5. NOS PROGRAMMES DE FORMATION */}
      <section id="programmes" className="w-full py-16 px-4 md:px-12 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#0C5A34]">
              {tPrograms("tag")}
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A192F] font-classic">
              {tPrograms("title")}
            </h2>
            <p className="text-slate-600 text-sm font-normal">
              {tPrograms("subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Programme 1 */}
            <div className="bg-[#FAFAF7] border border-slate-200 hover:border-[#0C5A34] rounded-2xl p-6 space-y-4 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0C5A34] text-white flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-lg font-bold text-[#0A192F] font-classic">
                {tPrograms("prog1_title")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {tPrograms("prog1_desc")}
              </p>
              <ul className="space-y-2 text-xs font-medium text-slate-700 border-t border-slate-200 pt-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0C5A34]" />
                  <span>{tPrograms("prog1_feat1")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0C5A34]" />
                  <span>{tPrograms("prog1_feat2")}</span>
                </li>
              </ul>
            </div>

            {/* Programme 2 */}
            <div className="bg-[#FAFAF7] border border-slate-200 hover:border-[#D4AF37] rounded-2xl p-6 space-y-4 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-white flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-lg font-bold text-[#0A192F] font-classic">
                {tPrograms("prog2_title")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {tPrograms("prog2_desc")}
              </p>
              <ul className="space-y-2 text-xs font-medium text-slate-700 border-t border-slate-200 pt-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>{tPrograms("prog2_feat1")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>{tPrograms("prog2_feat2")}</span>
                </li>
              </ul>
            </div>

            {/* Programme 3 */}
            <div className="bg-[#FAFAF7] border border-slate-200 hover:border-[#0C5A34] rounded-2xl p-6 space-y-4 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#0C5A34] text-white flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-lg font-bold text-[#0A192F] font-classic">
                {tPrograms("prog3_title")}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {tPrograms("prog3_desc")}
              </p>
              <ul className="space-y-2 text-xs font-medium text-slate-700 border-t border-slate-200 pt-3">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0C5A34]" />
                  <span>{tPrograms("prog3_feat1")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0C5A34]" />
                  <span>{tPrograms("prog3_feat2")}</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 6. FORMULAIRE DE PRÉ-INSCRIPTION */}
      <section id="inscription" className="w-full py-16 px-4 md:px-12 bg-[#FAFAF7]">
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-lg space-y-8">
          
          <div className="text-center space-y-3">
            <p className="text-xs font-extrabold uppercase tracking-widest text-[#0C5A34]">
              {tEnrollment("tag")}
            </p>
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#0A192F] font-classic">
              {tEnrollment("title")}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 font-normal">
              {tEnrollment("subtitle")}
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-[#0C5A34] rounded-2xl p-8 text-center space-y-4">
              <div className="w-14 h-14 bg-[#0C5A34] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8 text-[#FFE57F]" />
              </div>
              <h3 className="text-xl font-extrabold text-[#0C5A34]">
                {tEnrollment("success_title")}
              </h3>
              <p className="text-xs text-slate-700 max-w-md mx-auto font-medium">
                {tEnrollment("success_desc")}
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2.5 bg-[#0C5A34] text-white font-bold text-xs rounded-xl hover:bg-[#06381F] transition-colors"
              >
                {tEnrollment("submit_another")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitEnrollment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#0A192F] uppercase tracking-wider">
                    {tEnrollment("label_name")}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={tEnrollment("placeholder_name")}
                    value={enrollForm.studentName}
                    onChange={(e) => setEnrollForm({ ...enrollForm, studentName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#0A192F] uppercase tracking-wider">
                    {tEnrollment("label_age")}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder={tEnrollment("placeholder_age")}
                    value={enrollForm.age}
                    onChange={(e) => setEnrollForm({ ...enrollForm, age: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#0A192F] uppercase tracking-wider">
                    {tEnrollment("label_program")}
                  </label>
                  <select
                    value={enrollForm.program}
                    onChange={(e) => setEnrollForm({ ...enrollForm, program: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
                  >
                    <option value="TAHFIZ_FULL">{tEnrollment("option_full")}</option>
                    <option value="COURS_SOIR">{tEnrollment("option_evening")}</option>
                    <option value="FEMMES">{tEnrollment("option_women")}</option>
                    <option value="ENFANTS">{tEnrollment("option_kids")}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#0A192F] uppercase tracking-wider">
                    {tEnrollment("label_hizb")}
                  </label>
                  <input
                    type="number"
                    placeholder={tEnrollment("placeholder_hizb")}
                    value={enrollForm.hizbLevel}
                    onChange={(e) => setEnrollForm({ ...enrollForm, hizbLevel: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#0A192F] uppercase tracking-wider">
                    {tEnrollment("label_parent")}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={tEnrollment("placeholder_parent")}
                    value={enrollForm.parentName}
                    onChange={(e) => setEnrollForm({ ...enrollForm, parentName: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#0A192F] uppercase tracking-wider">
                    {tEnrollment("label_phone")}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder={tEnrollment("placeholder_phone")}
                    value={enrollForm.phone}
                    onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
                  />
                </div>

              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#0A192F] uppercase tracking-wider">
                  {tEnrollment("label_comments")}
                </label>
                <textarea
                  rows={3}
                  placeholder={tEnrollment("placeholder_comments")}
                  value={enrollForm.comments}
                  onChange={(e) => setEnrollForm({ ...enrollForm, comments: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C5A34]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-[#0C5A34] hover:bg-[#06381F] text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-[#FFE57F]" />
                <span>{tEnrollment("submit_btn")}</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 7. PORTAIL D'ACCÈS INTERNE E-DAARA */}
      <section id="portail" className="w-full py-16 px-4 md:px-12 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <p className="text-xs font-black uppercase tracking-widest text-[#0C5A34]">
              {tPortal("tag")}
            </p>
            <h2 className="text-3xl font-black text-[#0A192F]">
              {tPortal("title")}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 font-medium">
              {tPortal("subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Portail Directeur */}
            <Link
              href="/login?role=DIRECTEUR"
              className="bg-[#FAFAF7] border border-slate-200 p-6 rounded-2xl space-y-3 hover:border-[#0C5A34] hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0C5A34] text-white flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#FFE57F]" />
              </div>
              <h3 className="text-base font-extrabold text-[#0A192F] group-hover:text-[#0C5A34]">
                {tPortal("dir_title")}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {tPortal("dir_desc")}
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0C5A34] pt-2">
                <span>{tPortal("login_link")}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Portail Oustaz */}
            <Link
              href="/login?role=TEACHER"
              className="bg-[#FAFAF7] border border-slate-200 p-6 rounded-2xl space-y-3 hover:border-[#0C5A34] hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-white flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-[#0A192F] group-hover:text-[#0C5A34]">
                {tPortal("teacher_title")}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {tPortal("teacher_desc")}
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0C5A34] pt-2">
                <span>{tPortal("login_link")}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Portail Parents */}
            <Link
              href="/login?role=PARENT"
              className="bg-[#FAFAF7] border border-slate-200 p-6 rounded-2xl space-y-3 hover:border-[#0C5A34] hover:shadow-md transition-all group sm:col-span-2 lg:col-span-1"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-[#FFE57F]" />
              </div>
              <h3 className="text-base font-extrabold text-[#0A192F] group-hover:text-[#0C5A34]">
                {tPortal("parent_title")}
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {tPortal("parent_desc")}
              </p>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0C5A34] pt-2">
                <span>{tPortal("login_link")}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* PIED DE PAGE ET COORDONNÉES */}
      <footer className="w-full bg-[#0A192F] text-white py-12 px-4 md:px-12 border-t-4 border-[#D4AF37]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <img src="/logo-daara-ibnoul-khayim.png" alt="Daara Logo" className="h-14 w-auto object-contain" />
              <div>
                <span className="text-sm font-black text-white uppercase tracking-wider block">
                  École Ibnoul Khayim Al Jawziya
                </span>
                <span className="text-xs font-bold text-[#D4AF37] font-serif dir-rtl block">
                  مدرسة ابن القيم الجوزية
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-md font-medium leading-relaxed">
              {tFooter("school_desc")}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-[#D4AF37] tracking-wider">{tFooter("nav_title")}</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li><a href="#histoire" className="hover:text-white transition-colors">{tNav("histoire")}</a></li>
              <li><a href="#programmes" className="hover:text-white transition-colors">{tNav("programmes")}</a></li>
              <li><a href="#huffaz" className="hover:text-white transition-colors">{tNav("huffaz")}</a></li>
              <li><a href="#inscription" className="hover:text-white transition-colors">{tNav("inscription")}</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-[#D4AF37] tracking-wider">{tFooter("contact_title")}</h4>
            <div className="space-y-2 text-xs font-medium text-slate-300">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{tFooter("headquarters")}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{tFooter("secretariat")}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{tFooter("email")}</span>
              </p>
            </div>
          </div>

        </div>

        <div className="max-w-6xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-semibold gap-3">
          <p>© {new Date().getFullYear()} Daara Ibnoul Khayim Al Diawziya. {tFooter("rights")}</p>
          <p className="text-[#D4AF37] font-serif dir-rtl">مدرسة ابن القيم الجوزية — لتحفيظ القرآن الكريم والدراسات الإسلامية</p>
        </div>
      </footer>

    </div>
  );
}
