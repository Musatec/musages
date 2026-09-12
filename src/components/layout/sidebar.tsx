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
    const { activeSpace } = useSpace();

    const userRole = session?.user?.role || "SERIGNE_DAARA";
    const userName = session?.user?.name || "Responsable Établissement";
    const userImage = session?.user?.image;
    const pathname = usePathname();
    const { collapsed, setCollapsed } = useSidebar();
    const [mobileOpen, setMobileOpen] = useState(false);

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

            {/* Sidebar Dédiée à l'Espace Actif (Pas de mélange d'espaces) */}
            <aside 
                className={cn(
                    "fixed top-0 h-screen transition-all duration-300 ease-in-out flex flex-col z-[70] bg-[#0F172A] text-slate-200 shadow-xl",
                    isAr ? "right-0 border-l border-r-0 border-slate-800/80" : "left-0 border-r border-l-0 border-slate-800/80",
                    isAr 
                      ? (mobileOpen ? "translate-x-0 w-72" : "translate-x-full md:translate-x-0")
                      : (mobileOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0"),
                    collapsed ? "md:w-20" : "md:w-64"
                )}
            >
                {/* En-tête Sidebar — Logo & Nom de l'Établissement (Daara vs École Franco-Arabe Pathé Pogne) */}
                <div className="p-3.5 flex items-center justify-between overflow-hidden relative z-10 border-b border-slate-800/70 bg-slate-950/40">
                    <Link 
                        href={userRole === "SUPER_ADMIN" ? "/admin" : "/dashboard"} 
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2.5"
                    >
                        <img 
                            src={isSchool ? "/logo-pathe-pogne.png" : "/logo-daara-ibnoul-khayim.png"} 
                            alt={isSchool ? "École Pathé Pogne Logo" : "Daara Ibnoul Khayim Logo"} 
                            className="h-8 w-auto object-contain shrink-0 rounded-md" 
                        />
                        {(!collapsed || mobileOpen) && (
                            <div className="flex flex-col leading-tight overflow-hidden">
                                <span className="text-xs font-bold text-white tracking-wide truncate">
                                    {isSchool ? "École Pathé Pogne" : "Ibnoul Khayim"}
                                </span>
                                <span className="text-[10px] text-emerald-400 font-medium font-arabic dir-rtl truncate">
                                    {isSchool ? "المدرسة العربية الفرنسية" : "مدرسة ابن القيم"}
                                </span>
                            </div>
                        )}
                    </Link>

                    {/* Bouton fermer Mobile */}
                    <button 
                        onClick={() => setMobileOpen(false)}
                        className="md:hidden p-1 text-slate-400 hover:text-white rounded-lg"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Toggle Collapse Desktop */}
                    <button 
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden md:flex p-1 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all"
                        aria-label="Toggle Sidebar"
                    >
                        <ChevronLeft 
                          className={cn(
                            "w-4 h-4 transition-transform duration-300", 
                            isAr 
                              ? (collapsed ? "rotate-0" : "rotate-180")
                              : (collapsed ? "rotate-180" : "rotate-0")
                          )} 
                        />
                    </button>
                </div>

                {/* Profil Utilisateur & Sélecteur de Langue */}
                {(!collapsed || mobileOpen) && (
                    <div className="p-3 border-b border-slate-800/50 space-y-2.5 bg-slate-950/20">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-emerald-900/50 border border-emerald-500/30 flex items-center justify-center overflow-hidden shrink-0">
                                {userImage ? (
                                    <SafeImage src={userImage} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                                )}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-xs font-semibold text-white truncate">
                                    {userName}
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium uppercase tracking-wider truncate">
                                    {isSchool ? "Directeur École Franco-Arabe" : userRole}
                                </span>
                            </div>
                        </div>

                        {/* Sélecteur de Langue (Français vs Arabe) */}
                        <div className="flex justify-center pt-0.5">
                            <LanguageSwitcher />
                        </div>
                    </div>
                )}

                {/* Navigation Principale Traduite & Spécifique à l'Espace Actif */}
                <nav className="flex-1 px-2.5 space-y-4 py-3 overflow-y-auto no-scrollbar relative z-10">
                    {currentNav.map((section) => {
                        const visibleItems = section.items.filter(item => {
                            const hasRole = !item.roles || item.roles.includes(userRole);
                            return hasRole;
                        });

                        if (visibleItems.length === 0) return null;

                        const sectionTitle = isAr ? (section.titleAr || section.title) : section.title;

                        return (
                            <div key={section.title} className="space-y-0.5">
                                {(!collapsed || mobileOpen) && (
                                    <p className={cn(
                                      "px-2.5 mb-1",
                                      isAr ? "font-arabic text-emerald-400 text-[11px] font-bold" : "text-[9px] font-bold uppercase tracking-wider text-slate-400"
                                    )}>
                                        {sectionTitle}
                                    </p>
                                )}
                                <div className="space-y-0.5">
                                    {visibleItems.map((item) => {
                                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                        const itemLabel = isAr ? (item.labelAr || item.label) : item.label;

                                        return (
                                            <Link 
                                                key={item.href} 
                                                href={item.href}
                                                onClick={() => setMobileOpen(false)}
                                                className={cn(
                                                    "flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all font-medium relative overflow-hidden",
                                                    isAr ? "text-xs" : "text-xs",
                                                    isActive 
                                                        ? (isSchool ? "bg-amber-600 text-white font-bold shadow-xs" : "bg-emerald-600/90 text-white font-bold shadow-xs")
                                                        : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                                                )}
                                            >
                                                <item.icon className={cn("w-4 h-4 shrink-0 transition-transform", isActive ? (isSchool ? "text-amber-200" : "text-emerald-200") : "text-slate-400")} />
                                                {(!collapsed || mobileOpen) && (
                                                    <span className={cn("truncate", isAr && "font-arabic font-medium")}>
                                                        {itemLabel}
                                                    </span>
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
                <div className="p-2.5 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className={cn(
                            "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors",
                            (collapsed && !mobileOpen) ? "justify-center" : "justify-start"
                        )}
                        title={tSidebar("logout")}
                    >
                        <LogOut className="w-4 h-4 text-slate-400 hover:text-red-400 shrink-0" />
                        {(!collapsed || mobileOpen) && (
                          <span className={cn(isAr && "font-arabic text-xs font-medium")}>
                            {tSidebar("logout")}
                          </span>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}
