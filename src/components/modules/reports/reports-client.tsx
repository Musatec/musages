"use client";

import { useState } from "react";
import { 
    DollarSign,
    RefreshCcw, 
    CreditCard,
    Activity,
    Calendar,
    Target,
    Brain,
    Sparkles,
    Zap,
    Loader2,
    Lightbulb
} from "lucide-react";
import { getMindInsights } from "@/lib/actions/ai-insights";
import { 
    XAxis, YAxis, 
    CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area 
} from "recharts";
import { motion } from "framer-motion";
import { cn, formatMoney } from "@/lib/utils";
import { EliteMetricCard } from "@/components/ui/metric-card";
import { ElitePageHeader } from "@/components/ui/page-header";

interface ReportsClientProps {
    initialData: {
        summary: {
            totalRevenue: number;
            totalExpenses: number;
            netProfit: number;
        };
        chartData: { name: string; total: number }[];
        success: boolean;
        error?: string;
    }
}

export function ReportsClient({ initialData }: ReportsClientProps) {
    const { summary, chartData } = initialData;
    const [loadingAI, setLoadingAI] = useState(false);
    const [insights, setInsights] = useState<string[]>([]);
    const [aiError, setAiError] = useState<string | null>(null);
    const expenseRate = summary.totalRevenue > 0
        ? Math.min(100, Math.max(0, Math.round((summary.totalExpenses / summary.totalRevenue) * 100)))
        : 0;
    const netRate = summary.totalRevenue > 0
        ? Math.min(100, Math.max(0, Math.round((summary.netProfit / summary.totalRevenue) * 100)))
        : 0;

    const handleFetchAI = async () => {
        setLoadingAI(true);
        setAiError(null);
        try {
            const res = await getMindInsights();
            if (res.success && res.insights) {
                setInsights(res.insights);
            } else {
                setAiError(res.error || "Erreur de connexion");
            }
        } catch (error) {
            setAiError("Système IA temporairement indisponible");
        } finally {
            setLoadingAI(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-4 text-foreground">
            
            <ElitePageHeader 
                title="Analyse & Rentabilité."
                subtitle="Supervision Financière"
                description="Analyse approfondie de la performance financière et opérationnelle de votre établissement."
                actions={
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-xs font-bold shadow-sm uppercase tracking-wider">
                            <Calendar className="w-4 h-4 text-primary" /> 
                            <span className="hidden sm:inline">Période :</span> Mois en cours
                        </div>
                        <button onClick={() => window.location.reload()} className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm">
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                    </div>
                }
            />

            {/* --- PRIMARY METRICS GRID (Elite SaaS) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <EliteMetricCard 
                    label="Recettes du mois" 
                    value={`${formatMoney(summary.totalRevenue)} F`} 
                    icon={DollarSign} 
                    variant="blue"
                    sub="Entrées enregistrées"
                />
                <EliteMetricCard 
                    label="Solde net du mois" 
                    value={`${formatMoney(summary.netProfit)} F`} 
                    icon={Target} 
                    variant="emerald"
                    sub="Recettes moins dépenses"
                />
                <EliteMetricCard 
                    label="Dépenses du mois" 
                    value={`${formatMoney(summary.totalExpenses)} F`} 
                    icon={CreditCard} 
                    variant="red"
                    sub="Sorties enregistrées"
                />
            </div>

            {/* --- AI INSIGHTS ENGINE --- */}
            <div className="bg-card border border-primary/20 rounded-2xl p-8 relative overflow-hidden shadow-sm group/ai transition-all hover:border-primary/40">
                <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4 max-w-2xl text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                            <Brain className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Analyse Prédictive IA</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            Intelligence Stratégique
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            L'IA analyse vos transactions pour identifier les leviers de croissance, optimiser vos flux de trésorerie et prévenir les ruptures de stock.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4">
                        <button 
                            onClick={handleFetchAI}
                            disabled={loadingAI}
                            className={cn(
                                "group relative px-8 py-4 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 flex items-center gap-3",
                                insights.length > 0 ? "bg-foreground text-background" : "bg-primary text-primary-foreground"
                            )}
                        >
                            {loadingAI ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                            {insights.length > 0 ? "Actualiser l'analyse" : "Générer les Insights"}
                        </button>
                        {aiError && <p className="text-[10px] font-bold text-red-500">{aiError}</p>}
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {insights.length > 0 ? (
                        insights.map((insight, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx} 
                                className="bg-muted/30 border border-border p-6 rounded-xl space-y-4 hover:border-primary/30 transition-all relative group/card"
                            >
                                <div className="absolute top-4 right-4 text-primary/10 group-hover/card:text-primary/30 transition-colors">
                                    <Lightbulb className="w-8 h-8" />
                                </div>
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Zap className="w-4 h-4 text-primary" />
                                </div>
                                <p className="text-xs font-semibold text-foreground leading-relaxed uppercase tracking-tight">
                                    {insight}
                                </p>
                            </motion.div>
                        ))
                    ) : !loadingAI && (
                        <div className="col-span-3 py-12 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl opacity-30">
                             <Activity className="w-8 h-8 mb-3 text-muted-foreground animate-pulse" />
                             <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">En attente de commande analytique</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- VISUALIZATIONS SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
                
                {/* Main Trend Chart */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                                Recettes journalières
                            </h3>
                            <p className="text-[10px] text-muted-foreground mt-0.5 uppercase font-medium opacity-60">Entrées consignées ce mois</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.3} />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="hsl(var(--muted-foreground))" 
                                    fontSize={10} 
                                    fontWeight={700} 
                                    tickLine={false} 
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="hsl(var(--muted-foreground))" 
                                    fontSize={10} 
                                    fontWeight={700} 
                                    tickLine={false} 
                                    axisLine={false}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: 'hsl(var(--card))', 
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '12px',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        textTransform: 'uppercase'
                                    }} 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="total" 
                                    stroke="hsl(var(--primary))" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorTotal)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profit Structure */}
                <div className="bg-muted/10 border border-border rounded-xl p-6 flex flex-col justify-between shadow-sm">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground italic">Répartition financière</h3>
                            <p className="text-[10px] text-muted-foreground uppercase font-medium opacity-50">Part des recettes du mois</p>
                        </div>

                        <div className="space-y-5">
                            {[
                                { label: "Dépenses / recettes", val: expenseRate, color: "bg-orange-500" },
                                { label: "Solde net / recettes", val: netRate, color: "bg-emerald-500" }
                            ].map(item => (
                                <div key={item.label} className="space-y-1.5">
                                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-tight">
                                        <span className="text-muted-foreground">{item.label}</span>
                                        <span className="text-foreground">{item.val}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted border border-border/50 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${item.val}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className={cn("h-full rounded-full", item.color)} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 bg-card border border-border/50 p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-bold uppercase text-foreground">Solde du mois</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase leading-relaxed opacity-70">
                            Les recettes moins les dépenses donnent un solde de <span className="font-bold text-foreground">{formatMoney(summary.netProfit)} F</span> pour ce mois.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
