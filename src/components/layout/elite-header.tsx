"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { UserMenu } from "./user-menu";
import { SearchCenter } from "./search-center";
import { SpaceSwitcher } from "./space-switcher";
import { useSpace } from "@/components/providers/space-provider";
import { useSession } from "next-auth/react";

export function EliteHeader() {
    const { setMobileOpen } = useSidebar();
    const { data: session } = useSession();
    const { activeSpace } = useSpace();
    
    const isDaara = activeSpace === "daara";

    return (
        <header className="sticky top-0 z-40 w-full bg-black/90 backdrop-blur-md border-b border-white/10 px-3 md:px-8 py-2 md:py-3 transition-all duration-300">
            <div className="flex items-center justify-between gap-2 md:gap-8 h-full max-w-[1600px] mx-auto">
                
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                    {/* --- DYNAMIC BRANDING LOGO & TITLE --- */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="h-10 md:h-12 flex items-center overflow-hidden">
                            <img 
                                src={isDaara ? "/logo-daara-ibnoul-khayim.png" : "/logo-pathe-pogne.png"} 
                                alt={isDaara ? "Daara Ibnoul Khayim Al Diawziya" : "École Franco-Arabe Pathé Pogne"} 
                                className="h-10 md:h-12 w-auto object-contain rounded-lg drop-shadow-md transition-all duration-300" 
                            />
                        </div>
                        <div className="hidden lg:flex flex-col border-l border-white/20 pl-3">
                            <span className="text-xs font-black uppercase tracking-tight text-[#D4AF37] leading-tight">
                                {isDaara ? "École Ibnoul Khayim Al Jawziya" : "École Franco-Arabe Pathé Pogne"}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-400 font-serif dir-rtl leading-tight">
                                {isDaara ? "مدرسة ابن القيم الجوزية" : "المدرسة العربية الفرنسية PATHÉ POGNE"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* --- READ-ONLY SPACE BADGE (SELECTION FAITE A LA CONNEXION) --- */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold shrink-0">
                    <span className={isDaara ? "text-emerald-400" : "text-amber-400"}>
                        {isDaara ? "🕌 Espace Daara Ibnoul Khayim" : "🎓 Espace École Pathé Pogne"}
                    </span>
                </div>

                {/* --- GLOBAL SEARCH (⌘K) --- */}
                <div className="flex-1 min-w-0 max-w-md hidden md:block">
                    <SearchCenter />
                </div>

                {/* --- PROFILE & MENU --- */}
                <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
                    <UserMenu />

                    {/* --- MOBILE MENU TRIGGER --- */}
                    <button 
                        onClick={() => setMobileOpen(true)}
                        className="md:hidden p-2.5 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-emerald-400 transition-all active:scale-95 shrink-0 ml-1"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

            </div>
        </header>
    );
}
