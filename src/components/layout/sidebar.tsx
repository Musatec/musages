"use client";
import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";
import { 
    LayoutDashboard, 
    ShoppingCart, 
    Package, 
    ArrowLeftRight, 
    TrendingUp, 
    Users, 
    ChevronLeft, 
    Settings,
    Activity,
    PlusCircle,
    FileText,
    CreditCard,
    Server,
    Truck,
    ShieldCheck,
    Crown,
    Zap
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

import { NAV_SECTIONS, SUPER_ADMIN_NAV } from "@/config/nav";
import { SafeImage } from "../ui/safe-image";

export function Sidebar() {
    const { data: session } = useSession();
    const userRole = session?.user?.role || "SELLER";
    const pathname = usePathname();
    const { collapsed, setCollapsed } = useSidebar();
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Attendre que le composant soit monté pour éviter les erreurs d'hydratation du thème
    useEffect(() => {
        setMounted(true);
    }, []);

    const currentTheme = mounted ? (resolvedTheme || theme) : "dark";
    // Inversion de la logique car elle semble inversée à l'écran
    const logoSrc = currentTheme === "dark" ? "/logo-black.svg" : "/logo.svg";
    const currentNav = userRole === "SUPER_ADMIN" ? SUPER_ADMIN_NAV : NAV_SECTIONS;

    return (
        <aside 
            className={cn(
                "fixed left-0 top-0 h-screen transition-all duration-500 ease-in-out hidden md:flex flex-col z-[70] sidebar-container border-r border-border/50",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Mesh Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
            
            {/* Logo Section */}
            <div className="p-4 flex items-center justify-between overflow-hidden relative z-10 border-b border-white/5">
                <Link href={userRole === "SUPER_ADMIN" ? "/admin" : "/dashboard"} className="flex items-center">
                        <div className={cn(
                            "relative transition-all duration-300",
                            collapsed ? "w-10 h-10 flex items-center justify-center" : "w-32 h-10"
                        )}>
                            <img 
                                src={collapsed ? "/icon.svg" : logoSrc} 
                                alt="Mindos Logo" 
                                className="w-full h-full object-contain" 
                            />
                        </div>
                </Link>
                {/* Collapse Control */}
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-1.5 bg-white/5 border border-white/10 rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm active:scale-90"
                >
                    <ChevronLeft className={cn("w-3.5 h-3.5 transition-transform duration-500 text-muted-foreground hover:text-white", collapsed ? "rotate-180" : "rotate-0")} />
                </button>
            </div>
 
            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-6 py-6 overflow-y-auto no-scrollbar relative z-10">
                {currentNav.map((section) => {
                    // Filter items based on user role
                    const visibleItems = section.items.filter(item => {
                        const hasRole = !item.roles || item.roles.includes(userRole);
                        const isStarter = session?.user?.plan === "STARTER";
                        
                        // Only hide for non-admins on Starter plans
                        if (item.label === "Centrale Réseau" && isStarter && userRole !== "ADMIN") return false;
                        
                        return hasRole;
                    });

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={section.title} className="space-y-1">
                            {!collapsed && (
                                <p className="px-3 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-3 italic">
                                    {section.title}
                                </p>
                            )}
                            <div className="space-y-0.5">
                                {visibleItems.map((item) => {
                                    const isActive = pathname.includes(item.href);
                                    return (
                                        <Link 
                                            key={item.href} 
                                            href={item.href}
                                            id={item.label === "Inventaire Global" ? "sidebar-inventory" : item.label === "Tableau de Bord" ? "sidebar-dashboard" : item.label === "Journal des Ventes" ? "sidebar-sales" : undefined}
                                            className={cn(
                                                 "flex items-center gap-3 p-2.5 rounded-xl transition-all group relative overflow-hidden",
                                                 isActive 
                                                     ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                                                     : "opacity-80 hover:opacity-100 hover:bg-white/5"
                                             )}
                                         >
                                            <item.icon className={cn("w-4 h-4 transition-all relative z-10", isActive ? "scale-110" : "group-hover:scale-110")} />
                                            {!collapsed && (
                                                <span className={cn(
                                                    "text-[12px] font-bold transition-all whitespace-nowrap relative z-10",
                                                    isActive ? "opacity-100" : "opacity-90 group-hover:opacity-100"
                                                )}>
                                                    {item.label}
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                            {!collapsed && section.title !== "DIRECTION" && <div className="mx-3 mt-4 h-[1px] bg-white/5" />}
                        </div>
                    );
                })}
            </nav>

            {/* Minimalist Plan Footer */}
            <div className="p-3 border-t border-white/5 relative z-10">
                <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
                    collapsed ? "justify-center" : "justify-between",
                    session?.user?.plan === "BUSINESS" ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/10 text-muted-foreground"
                )}>
                    <div className="flex items-center gap-2 overflow-hidden">
                        {session?.user?.plan === "BUSINESS" ? <Crown className="w-3.5 h-3.5 shrink-0" /> : <Zap className="w-3.5 h-3.5 shrink-0" />}
                        {!collapsed && (
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] truncate italic">
                                PLAN {session?.user?.plan || "STARTER"}
                            </span>
                        )}
                    </div>
                    {!collapsed && session?.user?.plan !== "BUSINESS" && (
                        <Link href="/pricing" className="text-[8px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-4">
                            UP
                        </Link>
                    )}
                </div>
            </div>
        </aside>
    );
}
