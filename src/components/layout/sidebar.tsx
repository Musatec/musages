"use client";

import { cn } from "@/lib/utils";
import { 
    ChevronLeft, 
    Crown,
    Zap,
    LogOut
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "@/i18n/routing";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { NAV_SECTIONS, SUPER_ADMIN_NAV } from "@/config/nav";

export function Sidebar() {
    const { data: session } = useSession();
    const userRole = session?.user?.role || "DIRECTEUR";
    const pathname = usePathname();
    const { collapsed, setCollapsed } = useSidebar();
    const currentNav = userRole === "SUPER_ADMIN" ? SUPER_ADMIN_NAV : NAV_SECTIONS;

    return (
        <aside 
            className={cn(
                "fixed left-0 top-0 h-screen transition-all duration-300 ease-in-out hidden md:flex flex-col z-[70] border-r border-[#1A2CA3] bg-[#0D1A63] text-white shadow-xl",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Header Sidebar - Brand Logo */}
            <div className="p-4 flex items-center justify-between overflow-hidden relative z-10 border-b border-[#1A2CA3]">
                <Link href={userRole === "SUPER_ADMIN" ? "/admin" : "/dashboard"} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#2845D6] text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        T
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col">
                            <span className="font-extrabold text-xl tracking-tight text-white leading-none">
                                Tahfiz<span className="text-[#F68048]">.sn</span>
                            </span>
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest pt-0.5">Espace Daara</span>
                        </div>
                    )}
                </Link>

                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 bg-[#1A2CA3] border border-[#2845D6]/40 rounded-lg hover:bg-[#2845D6] text-white transition-all shadow-sm active:scale-90"
                    aria-label="Toggle Sidebar"
                >
                    <ChevronLeft className={cn("w-4 h-4 transition-transform duration-300 text-white", collapsed ? "rotate-180" : "rotate-0")} />
                </button>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 px-3 space-y-6 py-5 overflow-y-auto no-scrollbar relative z-10">
                {currentNav.map((section) => {
                    const visibleItems = section.items.filter(item => {
                        const hasRole = !item.roles || item.roles.includes(userRole);
                        return hasRole;
                    });

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={section.title} className="space-y-1">
                            {!collapsed && (
                                <p className="px-3 text-[9px] font-extrabold uppercase tracking-widest text-[#F68048] mb-2.5">
                                    {section.title}
                                </p>
                            )}
                            <div className="space-y-1">
                                {visibleItems.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                    return (
                                        <Link 
                                            key={item.href} 
                                            href={item.href}
                                            className={cn(
                                                 "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium text-xs relative overflow-hidden",
                                                 isActive 
                                                     ? "bg-[#2845D6] text-white shadow-md shadow-[#2845D6]/30 font-bold" 
                                                     : "text-slate-200 hover:text-white hover:bg-[#1A2CA3]"
                                             )}
                                         >
                                            <item.icon className={cn("w-4 h-4 shrink-0 transition-transform", isActive ? "scale-110 text-white" : "text-slate-300")} />
                                            {!collapsed && (
                                                <span className="truncate">
                                                    {item.label}
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

            {/* Footer Sidebar - Profil & Deconnexion */}
            <div className="p-3 border-t border-[#1A2CA3] space-y-2 relative z-10">
                <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1A2CA3] border border-[#2845D6]/40 text-slate-200 text-xs font-semibold",
                    collapsed ? "justify-center" : "justify-between"
                )}>
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Crown className="w-3.5 h-3.5 text-[#F68048] shrink-0" />
                        {!collapsed && (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F68048] truncate">
                                PLAN {session?.user?.plan || "STARTER"}
                            </span>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-[#1A2CA3] text-xs font-semibold transition-colors",
                        collapsed ? "justify-center" : "justify-start"
                    )}
                >
                    <LogOut className="w-4 h-4 text-slate-300 shrink-0" />
                    {!collapsed && <span>Déconnexion</span>}
                </button>
            </div>
        </aside>
    );
}
