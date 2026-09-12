"use client";

import { Menu } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { useSession, signOut } from "next-auth/react";
import { SafeImage } from "@/components/ui/safe-image";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useSpace } from "@/components/providers/space-provider";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { useLocale } from "next-intl";

export function MobileHeader() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const locale = useLocale();
    const isAr = locale === "ar";
    const { activeSpace } = useSpace();
    const { setMobileOpen } = useSidebar();

    const isSchool = activeSpace === "school";
    const isVisible = pathname !== "/login";

    if (!isVisible) return null;

    return (
        <header className="md:hidden sticky top-0 inset-x-0 h-13 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 z-50 flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
                <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="p-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white shadow-xs active:scale-95 transition-all flex items-center shrink-0"
                    aria-label="Ouvrir le menu"
                >
                    <Menu className="w-4 h-4 text-emerald-400" />
                </button>

                <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity min-w-0">
                    <img 
                        src={isSchool ? "/logo-pathe-pogne.png" : "/logo-daara-ibnoul-khayim.png"} 
                        alt={isSchool ? "École Pathé Pogne" : "Daara Ibnoul Khayim"} 
                        className="h-7 w-auto object-contain shrink-0 rounded-md" 
                    />
                    <span className="text-xs font-bold text-white tracking-tight truncate max-w-[130px]">
                        {isSchool ? "Pathé Pogne" : "Ibnoul Khayim"}
                    </span>
                </Link>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <LanguageSwitcher />
            </div>
        </header>
    );
}
