"use client";

import { 
    User, 
    Settings, 
    LogOut, 
    ShieldCheck, 
    Building2,
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";

export function UserMenu() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const user = session?.user;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) {
        return (
            <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary/40 animate-pulse" />
        );
    }

    const isAdmin = user.role === "SERIGNE_DAARA" || user.role === "SUPER_ADMIN";

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={user.name || "Mon compte"}
                aria-expanded={isOpen}
                className="flex items-center gap-2.5 rounded-xl p-1.5 transition hover:bg-muted/70 active:scale-[0.98]"
            >
                <div className="hidden text-right lg:block">
                    <p className="text-xs font-semibold leading-none">
                        {user.name || "Propriétaire"}
                    </p>
                </div>
                <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border transition-all",
                    isOpen ? "border-primary bg-primary text-primary-foreground" : "border-primary/10 bg-primary/5 text-primary"
                )}>
                    <User className="w-5 h-5" />
                </div>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute end-0 mt-3 w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_50px_-28px_rgba(12,48,34,0.55)] z-50"
                    >
                        {/* Profile Header */}
                        <div className="border-b border-border bg-muted/45 p-4">
                            <div className="flex items-center gap-3">
                                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                                    <User className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="truncate text-sm font-semibold text-foreground">
                                        {user.name}
                                    </h4>
                                    <p className="truncate text-[11px] font-medium text-muted-foreground">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-3">
                            <div className="space-y-1">
                                <DropdownLink href="/settings" icon={Settings} label="Mon Profil" onClick={() => setIsOpen(false)} />
                                <DropdownLink href="/daaras" icon={Building2} label="Mon Daara" onClick={() => setIsOpen(false)} />
                                {isAdmin && (
                                    <>
                                        <div className="h-[1px] bg-border my-2 mx-3 opacity-50" />
                                        <DropdownLink href="/admin" icon={ShieldCheck} label="Pilotage SaaS" onClick={() => setIsOpen(false)} />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer / Logout */}
                        <div className="p-3 bg-muted/30 border-t border-border">
                            <button 
                                onClick={() => {
                                    setIsOpen(false);
                                    signOut({ callbackUrl: '/login' });
                                }}
                                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-red-500 hover:text-white text-red-500 transition-all group active:scale-95 border border-transparent hover:border-red-500/20"
                            >
                                <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                                    <LogOut className="w-4 h-4" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">
                                    Déconnexion
                                </span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function DropdownLink({ href, icon: Icon, label, onClick }: { href: string; icon: any; label: string; onClick: () => void }) {
    return (
        <Link 
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group"
        >
            <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                <Icon className="w-4 h-4" />
            </div>
                                <span className="text-xs font-medium text-foreground/80 transition-colors group-hover:text-foreground">
                {label}
            </span>
        </Link>
    );
}


