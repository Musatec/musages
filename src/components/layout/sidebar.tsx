"use client";

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
    LogOut,
    PlusCircle,
    FileText,
    CreditCard,
    Server,
    Truck
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

interface NavItem {
    label: string;
    icon: any;
    href: string;
    roles?: string[];
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
    {
        title: "OPÉRATIONS",
        items: [
            { label: "Tableau de Bord", icon: LayoutDashboard, href: "/dashboard" },
            { label: "Journal des Ventes", icon: ArrowLeftRight, href: "/sales/journal" },
            { label: "Factures & Devis", icon: FileText, href: "/sales/invoices" },
            { label: "Suivi des Dettes", icon: CreditCard, href: "/sales/debts" },
        ]
    },
    {
        title: "LOGISTIQUE",
        items: [
            { label: "Inventaire Global", icon: Package, href: "/inventory" },
            { label: "Nouvel Arrivage", icon: ShoppingCart, href: "/logistics/purchases" },
            { label: "Mouvements & Audit", icon: PlusCircle, href: "/inventory/movements" },
            { label: "Gestion Fournisseurs", icon: Truck, href: "/logistics/suppliers" },
        ]
    },
    {
        title: "DIRECTION",
        items: [
            { label: "Moniteur d'Audit", icon: Activity, href: "/admin", roles: ["ADMIN"] },
            { label: "Caisse & Dépenses", icon: TrendingUp, href: "/expenses", roles: ["ADMIN", "MANAGER"] },
            { label: "Rapports & Analytics", icon: TrendingUp, href: "/reports", roles: ["ADMIN"] },
            { label: "Gestion Équipe", icon: Users, href: "/hr", roles: ["ADMIN", "MANAGER"] },
            { label: "Centrale Réseau", icon: Server, href: "/admin/stores", roles: ["ADMIN"] },
            { label: "Paramètres Globaux", icon: Settings, href: "/settings", roles: ["ADMIN"] },
        ]
    }
];

export function Sidebar() {
    const { data: session } = useSession();
    const userRole = session?.user?.role || "SELLER";
    const pathname = usePathname();
    const { collapsed, setCollapsed } = useSidebar();
    const { theme } = useTheme();

    const logoSrc = theme === "dark" ? "/logo-black.svg" : "/logo.svg";

    return (
        <aside 
            className={cn(
                "fixed left-0 top-0 h-screen transition-all duration-500 ease-in-out hidden md:flex flex-col z-50 sidebar-container bg-background border-r border-border/50",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Mesh Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
            
            {/* Logo Section */}
            <div className="p-4 flex items-center justify-between overflow-hidden relative z-10 border-b border-white/5">
                <Link href="/dashboard" className="flex items-center">
                    <div className={cn("transition-all duration-500 flex items-center gap-3", collapsed ? "w-10 overflow-hidden" : "w-40")}>
                        <div className={cn(
                            "relative transition-all duration-300",
                            collapsed ? "w-10 h-10" : "w-28 h-8"
                        )}>
                            <Image 
                                src={collapsed ? "/icon.svg" : logoSrc} 
                                alt="Mindos Logo" 
                                fill
                                className="object-contain transition-all duration-300" 
                                priority
                            />
                        </div>
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
                {NAV_SECTIONS.map((section) => {
                    // Filter items based on user role
                    const visibleItems = section.items.filter(item => {
                        const hasRole = !item.roles || item.roles.includes(userRole);
                        const isStarter = session?.user?.plan === "STARTER";
                        
                        // Hide Centrale Réseau for Starter plans
                        if (item.label === "Centrale Réseau" && isStarter) return false;
                        
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

            {/* Footer Actions */}
            <div className="p-4 border-t border-border/20 space-y-4 relative z-10">
                <div className="flex items-center justify-center">
                    <ThemeToggle collapsed={collapsed} />
                </div>

                <button 
                    onClick={() => window.location.href = '/login'}
                    className={cn(
                        "w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-500/10 transition-all group active:scale-95 border border-transparent hover:border-red-500/10",
                        collapsed && "justify-center px-0"
                    )}
                >
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500 transition-all shadow-sm">
                        <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-0.5 text-red-500 group-hover:text-white" />
                    </div>
                    {!collapsed && (
                        <div className="text-left">
                            <span className="text-[14px] font-bold opacity-80 group-hover:opacity-100 group-hover:text-red-500 transition-all">Déconnexion</span>
                        </div>
                    )}
                </button>
            </div>
        </aside>
    );
}
