"use client";

import { 
    User, 
    Settings, 
    LogOut, 
    CreditCard, 
    ShieldCheck, 
    Building2,
    Crown,
    Zap,
    ExternalLink
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
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

    if (!user) return null;

    const planLabel = user.plan || "STARTER";
    const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

    return (
        <div className="relative" ref={menuRef}>
            {/* Trigger Button */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-all active:scale-95"
            >
                <div className="text-right hidden lg:block">
                    <p className="text-[11px] font-black leading-none uppercase tracking-tighter italic">
                        {user.name || "Propriétaire"}
                    </p>
                </div>
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm border",
                    isOpen ? "bg-primary text-black border-primary" : "bg-primary/5 border-primary/10 text-primary group-hover:bg-primary/10"
                )}>
                    <User className="w-5 h-5" />
                </div>
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-72 bg-background border border-border rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden z-50 backdrop-blur-2xl"
                    >
                        {/* Profile Header */}
                        <div className="p-6 border-b border-border bg-primary/5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary text-black flex items-center justify-center relative shadow-lg shadow-primary/20">
                                    <User className="w-6 h-6" />
                                    {planLabel === "BUSINESS" && (
                                        <div className="absolute -top-1 -right-1 bg-white text-black p-0.5 rounded shadow-lg">
                                            <Crown className="w-2.5 h-2.5" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-black uppercase tracking-tighter italic truncate text-foreground">
                                        {user.name}
                                    </h4>
                                    <p className="text-[9px] font-bold text-primary truncate uppercase tracking-widest opacity-80">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-3">
                            <div className="space-y-1">
                                <DropdownLink href="/settings" icon={Settings} label="Mon Profil" onClick={() => setIsOpen(false)} />
                                <DropdownLink href="/settings/stores" icon={Building2} label="Mes Boutiques" onClick={() => setIsOpen(false)} />
                                <DropdownLink href="/settings/billing" icon={CreditCard} label="Abonnement" onClick={() => setIsOpen(false)} />
                                
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
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/80 group-hover:text-foreground transition-colors italic">
                {label}
            </span>
        </Link>
    );
}


