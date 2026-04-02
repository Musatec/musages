"use client";

import { useState } from "react";
import { 
    TrendingUp, ArrowUpRight, ArrowDownRight, 
    ShoppingCart, Users, Package, CreditCard,
    Calendar, Filter, RefreshCcw, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardMetric {
    label: string;
    value: string;
    subValue: string;
    icon: any;
    color: string;
    trend: string;
}

export function DashboardClient({ metrics, recentSales }: { metrics: any, recentSales: any[] }) {
    const [loading, setLoading] = useState(false);

    const cards: DashboardMetric[] = [
        { 
            label: "Chiffre d'Affaires (CA)", 
            value: `${new Intl.NumberFormat('fr-FR').format(metrics?.totalSales || 0)} F`, 
            subValue: "Total Ventes Enregistrées", 
            icon: ShoppingCart, 
            color: "text-emerald-500", 
            trend: "+12.5%" 
        },
        { 
            label: "Flux de Trésorerie", 
            value: `${new Intl.NumberFormat('fr-FR').format(metrics?.netCashflow || 0)} F`, 
            subValue: "Entrées - Sorties", 
            icon: ArrowDownRight, 
            color: metrics?.netCashflow >= 0 ? "text-emerald-500" : "text-red-500", 
            trend: "En Direct" 
        },
        { 
            label: "Produits en Stock", 
            value: `${metrics?.activeInventory || 0}`, 
            subValue: "Références Actives", 
            icon: Package, 
            color: "text-primary", 
            trend: "Optimal" 
        },
        { 
            label: "Alertes Stocks", 
            value: `${metrics?.stockAlerts || 0}`, 
            subValue: "Seuils Critiques", 
            icon: AlertTriangle, 
            color: "text-amber-500", 
            trend: "Action Requise" 
        }
    ];

    return (
        <div className="p-6 md:p-8 space-y-8 bg-background transition-colors duration-500 overflow-y-auto custom-scrollbar">
            
            {/* Header Compact */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-foreground uppercase italic">MINDOS <span className="text-primary italic">DASHBOARD</span></h1>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                        <Calendar className="w-3 h-3" />
                        <span>SYNCHRONISATION EN DIRECT : {new Date().toLocaleDateString('fr-FR')}</span>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-muted/20 border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all flex items-center gap-2">
                        <Filter className="w-3 h-3" /> Filtrer
                    </button>
                    <button onClick={() => window.location.reload()} className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm">
                        <RefreshCcw className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Metrics Row - Real Sized Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                    >
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className={cn("p-2.5 rounded-xl bg-muted/20 border border-border group-hover:bg-primary group-hover:text-white transition-all", card.color)}>
                                <card.icon className="w-5 h-5" />
                            </div>
                            <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border", card.color === 'text-emerald-500' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-muted/30 border-border')}>
                                {card.trend}
                            </span>
                        </div>
                        <div className="space-y-1 relative z-10">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{card.label}</p>
                            <h2 className="text-2xl font-black text-foreground tracking-tight">{card.value}</h2>
                            <p className="text-[9px] font-medium text-muted-foreground/60">{card.subValue}</p>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-primary/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                ))}
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity Table */}
                <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground italic">Flux de Ventes Récent</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Temps réel | Top 10</p>
                        </div>
                        <button className="text-[9px] font-black uppercase text-primary hover:underline underline-offset-4">Voir Tout</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-border/50 text-muted-foreground opacity-60 uppercase font-black tracking-widest">
                                    <th className="pb-4 pt-2">ID Facture</th>
                                    <th className="pb-4 pt-2">Client</th>
                                    <th className="pb-4 pt-2">Montant</th>
                                    <th className="pb-4 pt-2">Statut</th>
                                    <th className="pb-4 pt-2 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentSales.length === 0 ? (
                                    <tr><td colSpan={5} className="py-12 text-center text-muted-foreground italic opacity-50">Aucune activité enregistrée</td></tr>
                                ) : recentSales.map(sale => (
                                    <tr key={sale.id} className="border-b border-border/10 hover:bg-muted/10 transition-colors group">
                                        <td className="py-4 font-black">#INV-{sale.id.slice(-6).toUpperCase()}</td>
                                        <td className="py-4 text-muted-foreground font-medium">{sale.customerName || "Inconnu"}</td>
                                        <td className="py-4 font-black text-foreground">{new Intl.NumberFormat('fr-FR').format(sale.totalAmount)} F</td>
                                        <td className="py-4">
                                            <span className={cn(
                                                "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                                                sale.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                            )}>
                                                {sale.status === 'COMPLETED' ? 'SOLDE' : 'PARTIEL'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right text-muted-foreground opacity-40 font-mono text-[9px]">{new Date(sale.createdAt).toLocaleTimeString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Audit & Logs Area */}
                <div className="bg-muted/10 border border-border rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <ShieldCheckIcon className="w-5 h-5 text-primary" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground italic">Système d'Audit</h3>
                    </div>

                    <div className="space-y-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex gap-4 relative">
                                {i !== 4 && <div className="absolute left-3 top-8 bottom-[-8px] w-[1px] bg-border" />}
                                <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-foreground uppercase leading-none">Connexion Établie</p>
                                    <p className="text-[9px] text-muted-foreground/60 leading-tight">L'utilisateur Admin s'est connecté au système central.</p>
                                    <p className="text-[8px] font-mono text-muted-foreground opacity-30 mt-1 uppercase">Il y a 10 minutes</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button className="w-full mt-10 py-3 bg-muted/20 border border-border rounded-xl text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm">
                        Consulter Tout le Journal
                    </button>
                </div>
            </div>
        </div>
    );
}

function ShieldCheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
