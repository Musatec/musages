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
    LogOut,
    PlusCircle,
    FileText,
    CreditCard
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Journal Ventes", icon: ArrowLeftRight, href: "/sales/journal" },
    { label: "Studio Facture", icon: FileText, href: "/sales/invoices" },
    { label: "Suivi des Dettes", icon: CreditCard, href: "/sales/debts", highlight: true },
    { label: "Inventaire", icon: Package, href: "/inventory" },
    { label: "Dépenses", icon: TrendingUp, href: "/expenses" },
    { label: "Gestion Équipe", icon: Users, href: "/hr" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { collapsed, setCollapsed } = useSidebar();

    return (
        <aside 
            className={cn(
                "fixed left-0 top-0 h-screen transition-all duration-500 ease-in-out flex flex-col z-50 bg-background border-r border-border shadow-sm",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo Section */}
            <div className="p-4 flex items-center justify-between overflow-hidden">
                <Link href="/dashboard" className="flex items-center">
                    <div className={cn("transition-all duration-500 flex items-center gap-3", collapsed ? "w-10 overflow-hidden" : "w-40")}>
                        <div className={cn(
                            "relative transition-all duration-500",
                            collapsed ? "w-10 h-10 min-w-10" : "w-40 h-10 min-w-40"
                        )}>
                            <Image 
                                src="/logo.svg" 
                                alt="Mindos Logo" 
                                fill
                                className={cn(
                                    "object-contain transition-all duration-500",
                                    collapsed ? "scale-[2.5] translate-x-[-12px]" : "scale-100"
                                )} 
                                priority
                            />
                        </div>
                    </div>
                </Link>
                {/* Collapse Control */}
                <button 
                  onClick={() => setCollapsed(!collapsed)}
                  className="p-1.5 bg-muted/10 border border-border/30 rounded-lg hover:bg-primary hover:text-black transition-all shadow-sm active:scale-90"
                >
                    <ChevronLeft className={cn("w-3.5 h-3.5 transition-transform duration-500 text-muted-foreground", collapsed ? "rotate-180" : "rotate-0")} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1.5 py-4 overflow-y-auto no-scrollbar">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.includes(item.href);
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 p-3.5 rounded-2xl transition-all group relative overflow-hidden",
                                isActive 
                                    ? "bg-primary text-black shadow-lg shadow-primary/20 translate-x-1" 
                                    : item.highlight 
                                        ? "bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                                        : "text-muted-foreground hover:bg-muted/40 hover:text-foreground hover:translate-x-1"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 transition-all", isActive ? "scale-110" : "group-hover:scale-110")} />
                            {!collapsed && (
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap",
                                    isActive ? "opacity-100 italic" : "opacity-60"
                                )}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Actions */}
            <div className="p-4 border-t border-border/50 space-y-4">
                <div className="flex items-center justify-center">
                    <ThemeToggle />
                </div>

                <button 
                    onClick={() => window.location.href = '/login'}
                    className={cn(
                        "w-full flex items-center gap-4 p-3 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all group border border-transparent hover:border-red-500/20 active:scale-95",
                        collapsed && "justify-center px-0"
                    )}
                >
                    <div className="w-8 h-8 rounded-lg bg-red-500/5 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
                        <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                    </div>
                    {!collapsed && (
                        <div className="text-left">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] block leading-none">Déconnexion</span>
                            <span className="text-[7px] font-bold text-red-500/30 uppercase tracking-widest mt-0.5 group-hover:text-red-500/50 transition-colors">Terminer Session</span>
                        </div>
                    )}
                </button>
            </div>
        </aside>
    );
}
