"use client";

import { Settings2, Menu, X, Rocket, Zap, LogOut, User, Bell } from "lucide-react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/config/nav";
import { useSupabase } from "@/components/providers/supabase-provider";
import { useTranslations } from "next-intl";
import { SafeImage } from "@/components/ui/safe-image";
import { LanguageSwitcher } from "./language-switcher";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

export function MobileHeader() {
    const { isAdmin, user } = useSupabase();
    const pathname = usePathname();
    const router = useRouter();
    const t = useTranslations("Sidebar");
    const [isOpen, setIsOpen] = useState(false);

    const [prevPathname, setPrevPathname] = useState(pathname);

    // Fermer le menu si la route change
    if (pathname !== prevPathname) {
        setPrevPathname(pathname);
        if (isOpen) setIsOpen(false);
    }

    // Bloquer le scroll quand le menu est ouvert
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (pathname === "/login") return null;

    return (
        <header>
            {/* --- TOP BAR --- */}
            <div className="md:hidden flex items-center justify-between px-5 py-4 fixed top-0 left-0 right-0 z-[50] bg-background/80 backdrop-blur-xl border-b border-white/5">
                <Link href="/dashboard" className="flex items-center gap-2 active:scale-95 transition-transform">
                    <div className="relative">
                        <SafeImage src="/logo.svg?v=6" alt="MINDOS Logo" width={100} height={32} className="h-8 w-auto" priority />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_var(--primary)]" />
                    </div>
                </Link>

                <div className="flex items-center gap-2">
                    <button className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-muted-foreground hover:text-primary transition-all active:scale-95">
                        <Bell className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="p-2.5 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* --- OVERLAY --- */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md md:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* --- SIDE DRAWER --- */}
            <div className={cn(
                "fixed inset-y-0 right-0 z-[70] w-[320px] bg-[#0A0A0B] border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden flex flex-col overflow-hidden",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Decorative Background Glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-600/5 blur-[80px] pointer-events-none rounded-full" />

                {/* Header Profile Section */}
                <div className="relative px-6 pt-10 pb-8 border-b border-white/5">
                    <div className="flex items-center justify-between mb-8">
                        <SafeImage src="/logo.svg?v=6" alt="MINDOS" width={80} height={20} className="h-5 w-auto" />
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-orange-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
                            <div className="relative w-14 h-14 rounded-2xl bg-[#151516] border border-white/10 flex items-center justify-center overflow-hidden">
                                {user?.user_metadata?.avatar_url ? (
                                    <SafeImage src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6 text-primary" />
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <h3 className="text-white font-black tracking-tight text-lg leading-none">
                                {user?.user_metadata?.full_name?.split(' ')[0] || "Explorateur"}
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-60">System Operator</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Scroll Area */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 custom-scrollbar relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 px-4 mb-4">
                            <div className="w-1 h-1 rounded-full bg-primary" />
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Navigation Principale</p>
                        </div>

                        {NAV_ITEMS.map((item, idx) => {
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
                                        "group w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 relative",
                                        isActive
                                            ? "bg-white/[0.03] text-white border border-white/10 shadow-xl"
                                            : "text-muted-foreground hover:text-white hover:bg-white/[0.02]"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-indicator"
                                            className="absolute left-0 w-1 h-6 bg-primary rounded-full"
                                        />
                                    )}
                                    <div className={cn(
                                        "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 border",
                                        isActive
                                            ? "bg-primary/20 border-primary/30 text-primary shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                                            : "bg-white/5 border-white/5 text-muted-foreground group-hover:bg-white/10 group-hover:border-white/10"
                                    )}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex flex-col items-start">
                                        <span className="text-xs font-black tracking-widest uppercase">{t(item.key)}</span>
                                        {isActive && <span className="text-[8px] font-medium text-primary/60 uppercase tracking-tighter mt-0.5 animate-pulse italic">Active Segment</span>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* ADMIN SECTION */}
                    {isAdmin && (
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 px-4 mb-4 mt-4">
                                <div className="w-1 h-1 rounded-full bg-orange-500" />
                                <p className="text-[9px] font-black text-orange-500/40 uppercase tracking-[0.4em]">Zone Alpha</p>
                            </div>
                            <Link
                                href="/admin"
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 border shadow-sm",
                                    pathname === "/admin"
                                        ? "bg-orange-500/10 text-white border-orange-500/20"
                                        : "bg-white/5 border-white/5 text-muted-foreground hover:bg-orange-500/5 hover:border-orange-500/10 hover:text-white"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-xl flex items-center justify-center border transition-all",
                                    pathname === "/admin" ? "bg-orange-500 text-white border-orange-500" : "bg-white/5 border-white/5"
                                )}>
                                    <Zap className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-black tracking-widest uppercase">{t('admin')}</span>
                            </Link>
                        </div>
                    )}

                    {/* System OS Info */}
                    <div className="px-2 mt-4">
                        <div className="relative overflow-hidden bg-gradient-to-br from-[#1C1C1E] to-[#0A0A0B] rounded-3xl p-5 border border-white/5 shadow-2xl">
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 blur-2xl rounded-full" />
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Rocket className="w-3 h-3 text-primary animate-bounce-subtle" />
                                </div>
                                <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">MindOS Core</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[11px] text-white/80 font-mono font-bold tracking-tighter">v1.3.4-prod_ascension</span>
                                    <div className="flex items-center gap-1.5 mt-1.5">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest">Service Actif</span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-1 h-3 rounded-full bg-primary/20" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Section - Multi-tiered */}
                <div className="p-6 pb-10 border-t border-white/5 bg-[#0D0D0E]/80 backdrop-blur-md space-y-3 z-20">
                    <div className="grid grid-cols-2 gap-3">
                        <Link
                            href="/settings"
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all group"
                        >
                            <Settings2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-white uppercase">{t('settings')}</span>
                        </Link>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                router.push('/dashboard');
                            }}
                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all group"
                        >
                            <LanguageSwitcher />
                        </button>
                    </div>

                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = "/";
                        }}
                        className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-red-500/5 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all text-red-500/60 font-black tracking-widest uppercase text-[10px] group shadow-inner"
                    >
                        <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        <span>Déconnexion Système</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
