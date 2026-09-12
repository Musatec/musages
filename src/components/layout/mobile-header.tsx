"use client";

import { LogOut, User, Menu } from "lucide-react";
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
        <header className="md:hidden sticky top-0 inset-x-0 h-14 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 z-50 flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setMobileOpen(true)}
                    className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-white shadow-xs active:scale-95 transition-all flex items-center gap-1.5"
                    aria-label="Ouvrir le menu"
                >
                    <Menu className="w-4 h-4 text-emerald-400" />
                </button>

                <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <img 
                        src={isSchool ? "/logo-pathe-pogne.png" : "/logo-daara-ibnoul-khayim.png"} 
                        alt={isSchool ? "École Pathé Pogne" : "Daara Ibnoul Khayim"} 
                        className="h-8 w-auto object-contain shrink-0 rounded-md" 
                    />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-white tracking-wide truncate max-w-[130px]">
                            {isSchool ? "Pathé Pogne" : "Ibnoul Khayim"}
                        </span>
                    </div>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                <LanguageSwitcher />

                <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    {session?.user?.image ? (
                        <SafeImage src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                </div>
            </div>
        </header>
    );
}
