"use client";

import { 
    ShoppingCart, Package, AlertTriangle, Zap,
    ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
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

export function DashboardClient({ metrics, recentSales, metadata }: { metrics: any, recentSales: any[], metadata?: { userName: string, enterpriseName: string } }) {
    
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
            
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {metadata?.enterpriseName || "Tableau de Bord"}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Bienvenue, {metadata?.userName || "Directeur"}. Voici l'aperçu de vos activités de gestion.
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
                    <div className="overflow-x-auto">
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
                                    <tr><td colSpan={5} className="py-12 text-center text-muted-foreground">Aucune vente enregistrée pour le moment.</td></tr>
                                ) : recentSales.map(sale => (
                                    <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-5 py-4 font-medium text-foreground font-mono text-xs">
                                            #{sale.id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-5 py-4 text-foreground text-sm">
                                            {sale.customerName || "Client Comptoir"}
                                        </td>
                                        <td className="px-5 py-4 font-semibold text-foreground">
                                            {new Intl.NumberFormat('fr-FR').format(sale.totalAmount)} <span className="text-xs text-muted-foreground font-normal">FCFA</span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-md text-[11px] font-medium border",
                                                sale.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                            )}>
                                                {sale.status === 'COMPLETED' ? 'Payé' : 'En attente'}
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
