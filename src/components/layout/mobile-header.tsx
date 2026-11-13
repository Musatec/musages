"use client";

import { Menu } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useSpace } from "@/components/providers/space-provider";
import { useLocale } from "next-intl";
import { BookOpen, GraduationCap } from "lucide-react";

export function MobileHeader() {
    const pathname = usePathname();
    const locale = useLocale();
    const isAr = locale === "ar";
    const { setMobileOpen } = useSidebar();
    const { activeSpace, toggleSpace } = useSpace();
    const isSchool = activeSpace === "school";

    const isVisible = pathname !== "/login";

    if (!isVisible) return null;

    return (
        <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background/95 backdrop-blur-xl border-b border-border/80 z-50 flex items-center justify-between px-2.5 sm:px-4 py-2 gap-2 shadow-[0_5px_18px_-16px_rgba(15,45,33,0.4)]">
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="p-2 bg-card border border-border rounded-xl text-foreground shadow-sm active:scale-95 transition-all flex items-center shrink-0"
                    aria-label="Ouvrir le menu"
                >
                    <Menu className="w-4 h-4 text-primary" />
                </button>

                <Link href="/dashboard" className="flex items-center gap-1.5 hover:opacity-90 transition-opacity min-w-0">
                    <img 
                        src={isSchool ? "/logo-pathe-pogne.png" : "/logo-daara-ibnoul-khayim.png"} 
                        alt={isSchool ? "École Pathé Pogne" : "Daara Ibnoul Khayim"} 
                        className="h-7 w-auto object-contain shrink-0 rounded-md" 
                    />
                    <span className="text-[11px] sm:text-xs font-semibold text-foreground tracking-tight truncate max-w-[90px] sm:max-w-[130px]">
                        {isSchool ? "Pathé Pogne" : "Ibnoul Khayim"}
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                <button
                    type="button"
                    onClick={toggleSpace}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all active:scale-95 shadow-xs ${
                        isSchool 
                            ? "bg-[#D4AF37] text-slate-950 border-amber-500/40" 
                            : "bg-[#0C5A34] text-white border-emerald-500/40"
                    }`}
                    title={isSchool ? "Basculer vers Espace Daara" : "Basculer vers École Pathé Pogne"}
                >
                    {isSchool ? <GraduationCap className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                    <span>{isSchool ? "École" : "Daara"}</span>
                </button>
                <LanguageSwitcher />
            </div>
        </header>
    );
}
