"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
    ChevronLeft, 
    LogOut,
    User as UserIcon,
    Menu,
    X
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useSpace } from "@/components/providers/space-provider";
import { NAV_SECTIONS, SCHOOL_NAV_SECTIONS, SUPER_ADMIN_NAV } from "@/config/nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SafeImage } from "@/components/ui/safe-image";

export function Sidebar() {
    const locale = useLocale();
    const tSidebar = useTranslations("Sidebar");
    const { data: session } = useSession();
    const { activeSpace, setActiveSpace } = useSpace();

    const userRole = session?.user?.role || "SERIGNE_DAARA";
    const userName = session?.user?.name || "Responsable Établissement";
    const userImage = session?.user?.image;
    const pathname = usePathname();
    const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

    const isAr = locale === "ar";
    const isSchool = activeSpace === "school";

    // Sélection du menu de navigation dédié à l'espace actif (Daara vs École Franco-Arabe)
    const currentNav = userRole === "SUPER_ADMIN" 
      ? SUPER_ADMIN_NAV 
      : isSchool 
        ? SCHOOL_NAV_SECTIONS 
        : NAV_SECTIONS;

    return (
        <>
            {/* Overlay Mobile avec flou d'arrière-plan et fermeture au clic */}
            {mobileOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-[60] transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar Dédiée à l'Espace Actif - Positionnée à DROITE (RTL Daara) */}
            <aside 
                dir="rtl"
                className={cn(
                    "fixed top-0 h-screen transition-all duration-300 ease-in-out flex flex-col z-[70] bg-gradient-to-b from-[#091020] via-[#0F172A] to-[#0A0F1D] text-slate-100 shadow-2xl right-0 border-l border-emerald-500/20 font-arabic text-right select-none",
                    mobileOpen ? "translate-x-0 w-72" : "translate-x-full md:translate-x-0",
                    collapsed ? "md:w-20" : "md:w-64"
                )}
            >
                {/* En-tête Sidebar — Logo & Nom de l'Établissement */}
                <div dir="rtl" className="p-3.5 flex items-center justify-between overflow-hidden relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md text-right">
                    <Link 
                        dir="rtl"
                        href={userRole === "SUPER_ADMIN" ? "/admin" : "/dashboard"} 
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 text-right"
                    >
                        <img 
                            src={isSchool ? "/logo-pathe-pogne.png" : "/logo-daara-ibnoul-khayim.png"} 
                            alt={isSchool ? "École Pathé Pogne Logo" : "Daara Ibnoul Khayim Logo"} 
                            className="h-9 w-auto object-contain shrink-0 rounded-lg shadow-sm border border-emerald-500/30" 
                        />
                        {(!collapsed || mobileOpen) && (
                            <div dir="rtl" className="flex flex-col leading-tight overflow-hidden text-right font-arabic">
                                <span className="text-sm font-black text-emerald-300 tracking-wide truncate drop-shadow-sm text-right">
                                    {isSchool ? "المدرسة العربية الفرنسية" : "مدرسة ابن القيم الجوزية"}
                                </span>
                                <span className="text-[11px] text-slate-300 font-sans font-medium truncate text-right">
                                    {isSchool ? "École Pathé Pogne" : "Daara Ibnoul Khayim"}
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Bouton fermer Mobile */}
                    <button 
                        onClick={() => setMobileOpen(false)}
                        className="md:hidden p-1.5 text-slate-300 hover:text-white rounded-lg bg-slate-800/50"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Toggle Collapse Desktop */}
                    <button 
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden md:flex p-1.5 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-lg transition-all border border-slate-700/50"
                        aria-label="Toggle Sidebar"
                    >
                        <ChevronLeft 
                          className={cn(
                            "w-4 h-4 transition-transform duration-300 text-emerald-400", 
                            collapsed ? "rotate-0" : "rotate-180"
                          )} 
                        />
                    </button>
                </div>

                {/* Profil Utilisateur */}
                {(!collapsed || mobileOpen) && (
                    <div dir="rtl" className="p-3 border-b border-slate-800/60 space-y-2 bg-slate-950/40 text-right">
                        <div dir="rtl" className="flex items-center gap-3 text-right">
                            <div className="w-8 h-8 rounded-full bg-emerald-950 border-2 border-emerald-400/50 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                                {userImage ? (
                                    <SafeImage src={userImage} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-4 h-4 text-emerald-300" />
                                )}
                            </div>
                            <div dir="rtl" className="flex flex-col overflow-hidden text-right font-arabic">
                                <span className="text-xs font-black text-white truncate drop-shadow-xs text-right">
                                    {userName}
                                </span>
                                <span className="text-[10px] text-amber-300 font-sans font-medium uppercase tracking-wider truncate text-right">
                                    {isSchool ? "Directeur École Franco-Arabe" : userRole}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Principale — Titres Principaux en Arabe (Droites vers Gauche RTL) */}
                <nav dir="rtl" className="flex-1 px-2.5 space-y-4 py-4 overflow-y-auto no-scrollbar relative z-10 text-right">
                    {currentNav.map((section) => {
                        const visibleItems = section.items.filter(item => {
                            const hasRole = !item.roles || item.roles.includes(userRole);
                            return hasRole;
                        });

                        if (visibleItems.length === 0) return null;

                        const arabicTitle = section.titleAr || section.title;
                        const frenchTitle = section.title;

                        return (
                            <div key={section.title} dir="rtl" className="space-y-1.5 text-right">
                                {(!collapsed || mobileOpen) && (
                                    <div dir="rtl" className="px-3 py-1 mb-1 text-right bg-emerald-950/40 border-r-4 border-emerald-400 rounded-l-md">
                                        <p className="font-arabic text-emerald-300 text-xs font-black leading-tight tracking-wide drop-shadow-xs text-right">
                                            {arabicTitle}
                                        </p>
                                        <p className="text-[10px] text-emerald-200/80 font-sans font-medium tracking-wider uppercase text-right">
                                            {frenchTitle}
                                        </p>
                                    </div>
                                )}
                                <div dir="rtl" className="space-y-1 text-right">
                                    {visibleItems.map((item) => {
                                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                        const mainArabicLabel = item.labelAr || item.label;
                                        const subFrenchLabel = item.label;

                                        return (
                                            <Link 
                                                dir="rtl"
                                                key={item.href} 
                                                href={item.href}
                                                onClick={() => setMobileOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-3 px-3.5 py-2 rounded-xl transition-all relative overflow-hidden text-right cursor-pointer w-full",
                                                    isActive 
                                                        ? (isSchool 
                                                            ? "bg-gradient-to-l from-amber-600 to-amber-700 text-white shadow-md border-r-4 border-amber-300 font-black" 
                                                            : "bg-gradient-to-l from-emerald-600 to-emerald-800 text-white shadow-md shadow-emerald-950/80 border-r-4 border-emerald-300 font-black")
                                                        : "text-slate-200 hover:text-white hover:bg-slate-800/70 border-r-2 border-transparent hover:border-emerald-500/40"
                                                )}
                                            >
                                                {/* Icône sur le bord droit en RTL */}
                                                <item.icon className={cn(
                                                    "w-4 h-4 shrink-0 transition-all", 
                                                    isActive ? "text-amber-300 scale-110" : "text-emerald-400"
                                                )} />

                                                {(!collapsed || mobileOpen) && (
                                                    <div dir="rtl" className="flex flex-col leading-tight truncate text-right font-arabic flex-1">
                                                        <span className={cn(
                                                            "text-xs sm:text-sm font-black truncate tracking-wide text-right",
                                                            isActive ? "text-white" : "text-slate-100"
                                                        )}>
                                                            {mainArabicLabel}
                                                        </span>
                                                        <span className={cn(
                                                            "text-[11px] font-sans font-medium truncate text-right tracking-normal mt-0.5",
                                                            isActive ? "text-emerald-100 font-semibold" : "text-slate-300"
                                                        )}>
                                                            {subFrenchLabel}
                                                        </span>
                                                    </div>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* Pied de Sidebar — Déconnexion */}
                <div dir="rtl" className="p-2.5 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-right">
                    <button
                        dir="rtl"
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-300 hover:text-red-400 hover:bg-red-500/15 text-xs font-bold transition-all text-right border border-transparent hover:border-red-500/30",
                            (collapsed && !mobileOpen) ? "justify-center" : "justify-start"
                        )}
                        title="تسجيل الخروج / Déconnexion"
                    >
                        <LogOut className="w-4 h-4 text-rose-400 shrink-0" />
                        {(!collapsed || mobileOpen) && (
                          <div dir="rtl" className="flex flex-col text-right font-arabic leading-tight flex-1">
                            <span className="text-xs font-black text-rose-200 hover:text-red-300 text-right">تسجيل الخروج</span>
                            <span className="text-[10px] text-rose-300 font-sans font-medium text-right">Déconnexion</span>
                          </div>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}
