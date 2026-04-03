"use client";

import { useState } from "react";
import { 
    TrendingUp, TrendingDown, 
    DollarSign, Package, 
    ArrowUpRight, ArrowDownRight, 
    Filter, RefreshCcw, 
    ChevronRight, CreditCard,
    PieChart, Activity,
    Calendar,
    Target
} from "lucide-react";
import { 
    LineChart, Line, XAxis, YAxis, 
    CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area 
} from "recharts";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ReportsClientProps {
    initialData: {
        summary: {
            totalRevenue: number;
            grossProfit: number;
            totalExpenses: number;
            netProfit: number;
            inventoryValue: number;
        };
        chartData: { name: string; total: number }[];
        success: boolean;
        error?: string;
    }
}

export function ReportsClient({ initialData }: ReportsClientProps) {
    const { summary, chartData } = initialData;

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('fr-FR').format(amount || 0);
    };

    const cards = [
        { 
            label: "Chiffre d'Affaires", 
            value: formatMoney(summary.totalRevenue), 
            sub: "Total Ventes (Mois)", 
            icon: DollarSign, 
            color: "text-emerald-500", 
            bg: "bg-emerald-500/5",
            trend: "+15.2%"
        },
        { 
            label: "Bénéfice Net", 
            value: formatMoney(summary.netProfit), 
            sub: "Revenu - Coût - Frais", 
            icon: Target, 
            color: summary.netProfit >= 0 ? "text-primary" : "text-red-500", 
            bg: "bg-primary/5",
            trend: "En Temps Réel"
        },
        { 
            label: "Valeur du Stock", 
            value: formatMoney(summary.inventoryValue), 
            sub: "Au Prix d'Achat", 
            icon: Package, 
            color: "text-blue-500", 
            bg: "bg-blue-500/5",
            trend: "Immobilisé"
        },
        { 
            label: "Total Dépenses", 
            value: formatMoney(summary.totalExpenses), 
            sub: "Salaires & Charges", 
            icon: CreditCard, 
            color: "text-red-500", 
            bg: "bg-red-500/5",
            trend: "Opérationnel"
        }
    ];

    return (
        <div className="p-6 md:p-10 space-y-10 bg-background min-h-screen overflow-y-auto custom-scrollbar">
            
            {/* Header Strategy */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-10">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                        <Activity className="w-3 h-3 text-primary" />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary">Alpha Analytics Protocol • v2.0</span>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
                            Intelligence <span className="text-primary italic">Financière.</span>
                        </h1>
                        <p className="text-[10px] text-muted-foreground/40 font-black tracking-[0.2em] uppercase">Diagnostic global du cycle d&apos;exploitation Alpha</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-card border border-border/50 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all active:scale-95 shadow-sm">
                        <Calendar className="w-4 h-4 text-primary" /> Mois En Cours
                    </button>
                    <button onClick={() => window.location.reload()} className="p-3 bg-primary text-black rounded-2xl hover:scale-110 active:scale-90 transition-all shadow-xl shadow-primary/20">
                        <RefreshCcw className="w-5 h-5 stroke-[2.5]" />
                    </button>
                </div>
            </header>

            {/* Matrix KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative bg-card border border-border/50 p-6 rounded-[2rem] hover:border-primary/30 hover:shadow-2xl transition-all overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -translate-y-1/2 translate-x-1/2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn("p-4 rounded-2xl border border-border/40 shadow-sm transition-all group-hover:scale-110", card.bg, card.color)}>
                                <card.icon className="w-6 h-6" />
                            </div>
                            <span className={cn("px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border border-border pb-1.5", card.color)}>
                                {card.trend}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <p className="text-[9px] font-black text-muted-foreground uppercase opacity-40 tracking-[0.2em] leading-none">{card.label}</p>
                            <h2 className="text-3xl font-black text-foreground tracking-tighter italic">{card.value} <span className="text-xs opacity-20 ml-0.5 uppercase">F</span></h2>
                            <p className="text-[9px] font-bold text-muted-foreground/60 italic uppercase tracking-wider">{card.sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Central Chart & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                
                {/* Main Trend Chart */}
                <div className="lg:col-span-2 bg-card border border-border/50 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground italic flex items-center gap-3">
                                Courbe de Flux <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[8px]">Direct 7J</span>
                            </h3>
                            <p className="text-[9px] text-muted-foreground uppercase tracking-widest opacity-40">Analyse de la fréquentation transactionnelle</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-primary rounded-full blur-[4px] animate-pulse" />
                            <span className="text-[10px] font-black text-primary uppercase">Alpha Live</span>
                        </div>
                    </div>

                    <div className="h-[350px] w-full mt-4 -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.2} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="hsl(var(--muted-foreground))" 
                                    fontSize={9} 
                                    fontWeight={900} 
                                    tickLine={false} 
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="hsl(var(--muted-foreground))" 
                                    fontSize={9} 
                                    fontWeight={900} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--card))', 
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '16px',
                                        fontSize: '10px',
                                        fontFamily: 'inherit',
                                        fontWeight: 900,
                                        textTransform: 'uppercase'
                                    }} 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="total" 
                                    stroke="hsl(var(--primary))" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorTotal)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profit Analysis Block (Static Mock Data for Viz) */}
                <div className="bg-muted/10 border border-border/50 rounded-[2.5rem] p-8 flex flex-col justify-between overflow-hidden relative group">
                    <div className="space-y-8 relative z-10">
                        <div className="space-y-1">
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground italic flex items-center gap-3">
                                Structure Rentabilité
                            </h3>
                            <p className="text-[9px] text-muted-foreground uppercase opacity-40">Marge vs Opérations</p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: "Marge brute", val: Math.round((summary.grossProfit / summary.totalRevenue || 0) * 100), color: "bg-primary" },
                                { label: "Taux Dépenses", val: Math.round((summary.totalExpenses / summary.totalRevenue || 0) * 100), color: "bg-red-500" },
                                { label: "Marge Nette", val: Math.round((summary.netProfit / summary.totalRevenue || 0) * 100), color: "bg-emerald-500" }
                            ].map(item => (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                        <span className="text-muted-foreground">{item.label}</span>
                                        <span className="text-foreground">{item.val}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.val}%` }}
                                            transition={{ duration: 1, ease: "easeOut" }}
                                            className={cn("h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]", item.color)} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 bg-card/60 p-6 rounded-3xl border border-border/50 shadow-sm relative z-10 backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase text-foreground italic">Point Mort Alpha</span>
                        </div>
                        <p className="text-[8px] text-muted-foreground font-medium uppercase tracking-widest leading-loose">
                            Le cycle actuel suggère une rentabilité stabilisée à <span className="text-foreground font-black">{Math.round((summary.netProfit / summary.totalRevenue || 0) * 100)}%</span> du volume global traité.
                        </p>
                    </div>

                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 blur-[60px] rounded-full pointer-events-none" />
                </div>

            </div>
        </div>
    );
}
