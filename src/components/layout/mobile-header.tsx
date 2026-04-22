"use client";

import { Settings2, Menu, X, Rocket, Zap, LogOut, User, Bell } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { NAV_SECTIONS, SUPER_ADMIN_NAV } from "@/config/nav";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { motion, AnimatePresence } from "framer-motion";
import { SafeImage } from "@/components/ui/safe-image";

export function MobileHeader() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const { theme } = useTheme();
    const { mobileOpen: isOpen, setMobileOpen: setIsOpen } = useSidebar();
    
    const userRole = session?.user?.role || "SELLER";
    const currentNav = userRole === "SUPER_ADMIN" ? SUPER_ADMIN_NAV : NAV_SECTIONS;
    const currentTheme = theme === "dark" ? "dark" : "light"; // Simplifié pour test
    const logoSrc = currentTheme === "dark" ? "/logo-black.svg" : "/logo.svg";

    const isVisible = pathname !== "/login" && session?.user?.storeId;

    if (!isVisible) return null;

    return (
        <div>
            {/* --- OVERLAY --- */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* --- SIDE DRAWER --- */}
            <div className={cn(
                "fixed inset-y-0 right-0 z-[110] w-[280px] sm:w-[320px] bg-[#0A0A0B] border-l border-white/10 shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden flex flex-col overflow-hidden",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Decorative Background Glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600/5 blur-[80px] pointer-events-none rounded-full" />

                {/* Header Profile Section */}
                <div className="relative px-6 pt-10 pb-8 border-b border-white/5 bg-[#0D0D0E]/50">
                    <div className="flex items-center justify-between mb-8">
                        <div className="relative w-24 h-6">
                            <img src={logoSrc} alt="MINDOS" className="w-full h-full object-contain" />
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-orange-400 rounded-2xl blur opacity-25" />
                            <div className="relative w-14 h-14 rounded-2xl bg-[#151516] border border-white/10 flex items-center justify-center overflow-hidden shadow-inner">
                                {session?.user?.image ? (
                                    <SafeImage src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-primary" />
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-white font-black tracking-tight text-lg leading-none uppercase italic">
                                {session?.user?.name?.split(' ')[0] || "Propriétaire"}
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1.5 opacity-40 leading-none">{userRole}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Scroll Area */}
                <div className="flex-1 overflow-y-auto py-8 px-4 space-y-10 custom-scrollbar relative z-10 no-scrollbar">
                    {currentNav.map((section) => {
                        const visibleItems = section.items.filter(item => {
                            const hasRole = !item.roles || item.roles.includes(userRole);
                            return hasRole;
                        });

                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={section.title} className="space-y-3">
                                <p className="px-4 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic mb-4">
                                    {section.title}
                                </p>
                                <div className="space-y-1.5">
                                    {visibleItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = pathname === item.href;

                                        return (
                                            <button
                                                key={item.href}
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    router.push(item.href);
                                                }}
                                                className={cn(
                                                    "group w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 relative",
                                                    isActive
                                                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]"
                                                        : "text-muted-foreground hover:text-white hover:bg-white/[0.05]"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border",
                                                    isActive
                                                        ? "bg-white/20 border-white/30 text-white"
                                                        : "bg-white/5 border-white/5 text-muted-foreground group-hover:bg-white/10 group-hover:border-white/10"
                                                )}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <span className="text-[11px] font-black tracking-widest uppercase italic">{item.label}</span>
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="mobile-indicator"
                                                        className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
                                                    />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Section - Multi-tiered */}
                <div className="p-6 pb-10 border-t border-white/5 bg-[#0D0D0E]/80 backdrop-blur-md space-y-3 z-20">
                        <Link
                            href="/settings"
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all group col-span-2"
                        >
                            <Settings2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-white uppercase">Paramètres</span>
                        </Link>

                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all text-red-500 font-black tracking-widest uppercase text-[10px] group shadow-inner"
                    >
                        <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        <span>Déconnexion Système</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
