"use client";

import { cn } from "@/lib/utils";
import { VisualAnalytics } from "./visual-analytics";
import { EliteMetricCard } from "@/components/ui/metric-card";
import { ElitePageHeader } from "@/components/ui/page-header";
import { OnboardingWizard } from "./onboarding-wizard";
import Link from "next/link";
import React from "react";
import { 
    ShoppingCart, Package, AlertTriangle, Zap,
    ArrowUpRight, ArrowDownRight, Activity
} from "lucide-react";
import { DashboardMetrics } from "@/types/dashboard";
import { useEffect } from "react";
import { toast } from "sonner";

export function DashboardClient({ 
    metrics, 
    recentSales, 
    metadata,
    userRole
}: { 
    metrics: DashboardMetrics, 
    recentSales: any[], 
    metadata?: { userName: string, enterpriseName: string, topProducts?: any[] },
    userRole: string
}) {
    const isManager = userRole === "MANAGER";
    const topProducts = metadata?.topProducts || [];

    useEffect(() => {
        // Toast de bienvenue pour les nouveaux Empires (Cas Google Auto-create)
        const isNewEmpire = metrics.activeInventory === 0 && metrics.totalSales === 0;
        if (isNewEmpire) {
            const hasToasted = sessionStorage.getItem("new_empire_toast_shown");
            if (!hasToasted) {
                toast.success(`Empire de ${metadata?.userName?.split(' ')[0] || "Commandant"} Initialisé ! 🏰`, {
                    description: "Votre espace de travail a été configuré automatiquement. Commençons par structurer votre stock.",
                    duration: 6000,
                });
                sessionStorage.setItem("new_empire_toast_shown", "true");
            }
        }
    }, [metrics, metadata]);
    
    return (
        <div className="flex-1 flex flex-col transition-all duration-300 p-4 md:p-8 pt-6 md:pt-10 pb-40 text-foreground">
            <OnboardingWizard metrics={metrics} />

            <ElitePageHeader 
                title="Performance & Analytiques."
                subtitle={isManager ? "Point de Vente Actif" : "Supervision Réseau"}
                description={isManager 
                    ? `Bonjour ${metadata?.userName}, voici la performance en temps réel de votre point de vente.`
                    : `Bienvenue, ${metadata?.userName}. Supervision globale de votre réseau commercial.`
                }
                actions={
                    isManager && (
                        <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-primary">{metadata?.enterpriseName || "Boutique Opérationnelle"}</span>
                        </div>
                    )
                }
            />

            {/* STRATEGIC METRICS HUB - Elite SaaS Design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EliteMetricCard 
                    label="Chiffre d'Affaires" 
                    value={`${new Intl.NumberFormat('fr-FR').format(metrics?.totalSales || 0)} F`} 
                    icon={ShoppingCart} 
                    variant="blue"
                    sub="Performance mensuelle"
                />
                <EliteMetricCard 
                    label="Trésorerie Nette" 
                    value={`${new Intl.NumberFormat('fr-FR').format(metrics?.netCashflow || 0)} F`} 
                    icon={Zap} 
                    variant="purple"
                    sub="Liquidités disponibles"
                />
                <EliteMetricCard 
                    label="Stock Actif" 
                    value={metrics?.activeInventory || 0} 
                    icon={Package} 
                    variant="orange"
                    sub="Références en stock"
                />
                <EliteMetricCard 
                    label="Alertes Stock" 
                    value={metrics?.stockAlerts || 0} 
                    icon={AlertTriangle} 
                    variant="red"
                    sub="Actions requises"
                />
            </div>

            {/* ANALYTICS VISUALIZATION */}
            <VisualAnalytics products={topProducts} />

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
                    {/* --- REGISTRE EXCEL PRO DES VENTES RÉCENTES --- */}
                    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none">
                        {/* Barre de Titre Feuille Excel */}
                        <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs select-none">
                            <div className="flex items-center gap-2">
                                <span className="bg-[#107c41] text-white px-2 py-0.5 rounded font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
                                    <span>XLSX</span>
                                </span>
                                <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                                    Feuille : Ventes & Encaissements Récents
                                </span>
                            </div>
                            <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {recentSales.length} opérations
                            </span>
                        </div>

                        {/* Grille Excel */}
                        <div className="w-full overflow-x-auto touch-pan-x">
                            <table className="w-full min-w-[500px] border-collapse text-left text-xs">
                                <thead>
                                    <tr className="bg-[#107c41] text-white select-none">
                                        <th className="w-10 text-center px-2 py-2 text-[10px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50">N°</th>
                                        <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[90px] text-center">Réf</th>
                                        <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[140px]">Client</th>
                                        <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 text-right min-w-[110px]">Montant</th>
                                        <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 text-center min-w-[80px]">Statut</th>
                                        <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-b border-emerald-600/50 text-center min-w-[100px]">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentSales.length === 0 ? (
                                        <tr><td colSpan={6} className="py-8 text-center text-muted-foreground border-b border-slate-200 dark:border-slate-700/80 italic bg-white dark:bg-slate-900">Aucune vente enregistrée.</td></tr>
                                    ) : recentSales.map((sale, idx) => (
                                        <tr 
                                            key={sale.id} 
                                            className={cn(
                                                "transition-colors hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                                                idx % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-900/60" : "bg-white dark:bg-slate-900"
                                            )}
                                        >
                                            <td className="w-10 text-center bg-[#f1f3f5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold border-r border-b border-slate-200 dark:border-slate-700/80 select-none">{idx + 1}</td>
                                            <td className="px-3 py-2 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400 text-[11px] border-r border-b border-slate-200 dark:border-slate-700/80">#{sale.id.slice(-6).toUpperCase()}</td>
                                            <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">{sale.customerName || "Client Comptoir"}</td>
                                            <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">{new Intl.NumberFormat('fr-FR').format(sale.totalAmount)} F</td>
                                            <td className="px-3 py-2 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                                                <span className={cn(
                                                    "inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase border",
                                                    sale.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300" : "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950 dark:text-orange-300"
                                                )}>
                                                    {sale.status === 'COMPLETED' ? 'Payé' : 'Attente'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center font-mono text-[10px] text-muted-foreground border-b border-slate-200 dark:border-slate-700/80">
                                                {new Date(sale.createdAt).toLocaleDateString('fr-FR')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Barre d'état Excel */}
                        <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-1.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium select-none">
                            <span className="font-bold text-emerald-800 dark:text-emerald-400">PRÊT • {recentSales.length} lignes</span>
                            <span className="font-mono font-bold">Total Ventes : {new Intl.NumberFormat('fr-FR').format(recentSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0))} FCFA</span>
                        </div>
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
