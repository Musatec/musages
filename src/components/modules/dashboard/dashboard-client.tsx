"use client";

import { 
    ShoppingCart, Package, AlertTriangle, Zap,
    ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import { OnboardingWizard } from "./onboarding-wizard";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DashboardMetric {
    label: string;
    value: string;
    subValue: string;
    icon: any;
    trend: string;
    isPositive: boolean;
}

export function DashboardClient({ 
    metrics, 
    recentSales, 
    metadata,
    userRole,
    userSubscription
}: { 
    metrics: any, 
    recentSales: any[], 
    metadata?: { userName: string, enterpriseName: string },
    userRole: string,
    userSubscription?: { status: string, daysRemaining: number, isTrialOver: boolean }
}) {
    const isManager = userRole === "MANAGER";
    
    const cards: DashboardMetric[] = [
        { 
            label: "Chiffre d'Affaires", 
            value: `${new Intl.NumberFormat('fr-FR').format(metrics?.totalSales || 0)} FCFA`, 
            subValue: "Ce mois-ci", 
            icon: ShoppingCart, 
            trend: "+12.5%",
            isPositive: true
        },
        { 
            label: "Trésorerie Nette", 
            value: `${new Intl.NumberFormat('fr-FR').format(metrics?.netCashflow || 0)} FCFA`, 
            subValue: "Entrées - Sorties", 
            icon: Zap, 
            trend: "Stable",
            isPositive: metrics?.netCashflow >= 0
        },
        { 
            label: "Produits en Stock", 
            value: `${metrics?.activeInventory || 0}`, 
            subValue: "Total des références", 
            icon: Package, 
            trend: "Optimal",
            isPositive: true
        },
        { 
            label: "Alertes Rupture", 
            value: `${metrics?.stockAlerts || 0}`, 
            subValue: "Produits sous le seuil", 
            icon: AlertTriangle, 
            trend: "À vérifier",
            isPositive: false
        }
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-8">
            
            {userSubscription && !isManager && (userSubscription.isTrialOver || userSubscription.daysRemaining <= 3) && (
                <div className={cn(
                    "p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2",
                    userSubscription.isTrialOver ? "bg-red-500/10 border-red-500/20" : "bg-primary/5 border-primary/20"
                )}>
                    <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", userSubscription.isTrialOver ? "bg-red-500 text-white" : "bg-primary text-black")}>
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-tight">
                                {userSubscription.isTrialOver 
                                    ? "Votre période d'essai a expiré." 
                                    : `Il vous reste ${userSubscription.daysRemaining} jour(s) d'essai gratuit.`
                                }
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none mt-1">
                                {userSubscription.isTrialOver 
                                    ? "Activez votre licence pour débloquer toutes les fonctionnalités." 
                                    : "MINDOS Alpha : Transition vers le plan de production d'ici peu."
                                }
                            </p>
                        </div>
                    </div>
                    <Link 
                        href="/settings"
                        className={cn(
                            "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all italic",
                            userSubscription.isTrialOver ? "bg-red-600 text-white hover:bg-red-700" : "bg-primary text-black hover:bg-primary/90"
                        )}
                    >
                        {userSubscription.isTrialOver ? "Activer l'Empire" : "Gérer mon abonnement"}
                    </Link>
                </div>
            )}

            <OnboardingWizard metrics={metrics} />

            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {metadata?.enterpriseName || "Tableau de Bord"}
                        </h1>
                        {isManager && (
                            <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Boutique Opérationnelle</span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {isManager 
                            ? `Bonjour ${metadata?.userName}, voici la performance en temps réel de votre point de vente.`
                            : `Bienvenue, ${metadata?.userName}. Supervision globale de votre réseau commercial.`
                        }
                    </p>
                </div>
            </header>

            {/* STRATEGIC METRICS HUB - Modern SaaS Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <div key={card.label} className="bg-card border border-border shadow-sm rounded-xl p-5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
                            <div className={cn(
                                "p-2 rounded-lg transition-colors", 
                                card.isPositive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400",
                                card.label === "Chiffre d'Affaires" && "bg-primary/10 text-primary"
                            )}>
                                <card.icon className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-2xl font-bold text-foreground">{card.value}</h3>
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-xs font-semibold flex items-center gap-0.5",
                                    card.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                                )}>
                                    {card.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {card.trend}
                                </span>
                                <span className="text-xs text-muted-foreground">{card.subValue}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* DATA TABLES GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* RECENT SALES */}
                <div className="xl:col-span-2 bg-card border border-border shadow-sm rounded-xl flex flex-col overflow-hidden">
                    <div className="p-5 flex items-center justify-between border-b border-border/50 bg-muted/20">
                        <div className="flex items-center gap-3">
                            <div className="p-2 border border-border/50 rounded-lg bg-background shadow-sm">
                                <Activity className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-foreground">Ventes Récentes</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5">Les 5 dernières transactions enregistrées.</p>
                                </div>
                                <Link 
                                    href="/sales/journal"
                                    className="text-[10px] font-bold text-primary hover:opacity-70 transition-all uppercase tracking-widest border-b border-primary/20 pb-0.5"
                                >
                                    Journal Complet
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/10 text-muted-foreground text-xs font-medium border-b border-border/50">
                                <tr>
                                    <th className="px-5 py-4 font-medium uppercase tracking-wider text-[11px]">Référence</th>
                                    <th className="px-5 py-4 font-medium uppercase tracking-wider text-[11px]">Client</th>
                                    <th className="px-5 py-4 font-medium uppercase tracking-wider text-[11px]">Montant</th>
                                    <th className="px-5 py-4 font-medium uppercase tracking-wider text-[11px] text-center">Statut</th>
                                    <th className="px-5 py-4 font-medium uppercase tracking-wider text-[11px] text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {recentSales.length === 0 ? (
                                    <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Aucune vente enregistrée.</td></tr>
                                ) : recentSales.map(sale => (
                                    <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-5 py-4 font-medium text-foreground font-mono text-xs">#{sale.id.slice(-6).toUpperCase()}</td>
                                        <td className="px-5 py-4 text-foreground text-sm">{sale.customerName || "Client Comptoir"}</td>
                                        <td className="px-5 py-4 font-semibold text-foreground">{new Intl.NumberFormat('fr-FR').format(sale.totalAmount)} <span className="text-xs text-muted-foreground font-normal">FCFA</span></td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-md text-[11px] font-medium border",
                                                sale.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                            )}>
                                                {sale.status === 'COMPLETED' ? 'Payé' : 'Attente'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right text-muted-foreground text-xs">
                                            {new Date(sale.createdAt).toLocaleDateString()}
                                            <span className="block text-[10px] opacity-70">{new Date(sale.createdAt).toLocaleTimeString()}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden divide-y divide-border/50">
                        {recentSales.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">Aucune vente enregistrée.</div>
                        ) : recentSales.map(sale => (
                            <div key={sale.id} className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest font-mono">#{sale.id.slice(-6).toUpperCase()}</span>
                                        <h4 className="text-sm font-bold text-foreground">{sale.customerName || "Client Comptoir"}</h4>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[8px] font-black uppercase border",
                                        sale.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                    )}>
                                        {sale.status === 'COMPLETED' ? 'Payé' : 'Attente'}
                                    </span>
                                </div>
                                <div className="flex items-end justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">Montant Total</span>
                                        <span className="text-lg font-black text-foreground italic">{new Intl.NumberFormat('fr-FR').format(sale.totalAmount)} F</span>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground tabular-nums opacity-60">
                                        {new Date(sale.createdAt).toLocaleDateString()} · {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RECENT ACTIVITY LOGS */}
                <div className="bg-card border border-border shadow-sm rounded-xl flex flex-col overflow-hidden">
                    <div className="p-5 border-b border-border/50 bg-muted/20">
                        <h3 className="font-semibold text-foreground">Activités Systèmes</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Historique des opérations</p>
                    </div>
                    <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                        <div className="text-sm text-muted-foreground text-center py-10 border border-border border-dashed rounded-lg bg-muted/10">
                            Les flux d'activités apparaîtront ici.
                        </div>
                    </div>
                    <div className="p-4 border-t border-border/50 text-center">
                        <Link 
                            href="/inventory/movements"
                            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            Voir tout l'historique
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
