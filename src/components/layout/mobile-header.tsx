"use client";

import { LogOut, User, Home } from "lucide-react";
import { Link, usePathname } from "@/i18n/routing";
import { useSession, signOut } from "next-auth/react";
import { SafeImage } from "@/components/ui/safe-image";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export function MobileHeader() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const userRole = session?.user?.role || "DIRECTEUR";

    const isVisible = pathname !== "/login" && session?.user?.id;

    if (!isVisible) return null;

    return (
        <header className="fixed top-0 inset-x-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-50 flex items-center justify-between px-4 sm:px-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                <img src="/logo-daara-ibnoul-khayim.png" alt="Daara Ibnoul Khayim Al Diawziya" className="h-10 w-auto object-contain shrink-0" />
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
                <LanguageSwitcher />

                <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-bold text-[#0A192F]">
                        {session?.user?.name?.split(' ')[0] || "Directeur"}
                    </span>
                    <span className="text-[10px] text-[#0C5A34] font-bold uppercase tracking-wider">
                        {userRole}
                    </span>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                    {session?.user?.image ? (
                        <SafeImage src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-4 h-4 text-[#0C5A34]" />
                    )}
                </div>

                <div className="w-px h-5 bg-slate-200 mx-0.5 hidden sm:block" />

                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Déconnexion"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
}
