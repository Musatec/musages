"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { cn, formatMoney } from "@/lib/utils";
import { 
    ChevronLeft, ChevronRight, Plus, 
    TrendingDown, Tag,
    RefreshCcw, ShieldCheck,
    Trash2,
    Calendar,
    Filter
} from "lucide-react";
import { getDailyExpenses, deleteExpense } from "@/lib/actions/expenses";
import { TopLoader } from "@/components/ui/top-loader";
import { NewExpenseSheet } from "@/components/modules/expenses/new-expense-sheet";
import { toast } from "sonner";
import { EliteMetricCard } from "@/components/ui/metric-card";
import { ElitePageHeader } from "@/components/ui/page-header";

export default function ExpensesPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const isToday = useMemo(() => date === new Date().toISOString().split('T')[0], [date]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getDailyExpenses(date);
            setData(res);
        } catch (error) {
            console.error(error);
            toast.error("Erreur de récupération");
        } finally {
            setLoading(false);
        }
    }, [date]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDelete = async (id: string) => {
        if (!isToday) return toast.error("Action possible sur les dates antérieures");
        if (!confirm("⚠️ Annuler cette dépense ?")) return;
        
        try {
            const res = await deleteExpense(id);
            if (res.success) {
                toast.success("Dépense annulée !");
                fetchData();
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Erreur technique");
        }
    };

    const changeDate = (days: number) => {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        const newD = d.toISOString().split('T')[0];
        if (newD > new Date().toISOString().split('T')[0]) return;
        setDate(newD);
    };

    return (
        <div className="flex-1 flex flex-col transition-all duration-300 p-4 md:p-8 pt-6 md:pt-10 pb-40 text-foreground">
            {loading && <TopLoader />}

            <div className="max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* --- PROFESSIONAL HEADER --- */}
                <ElitePageHeader 
                    title="Flux & Charges Opérationnelles."
                    subtitle="Gestion de Caisse"
                    description="Contrôlez vos dépenses quotidiennes, gérez les justificatifs et analysez l'impact des charges sur votre trésorerie."
                    actions={
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                            <div className="flex items-center justify-between bg-card border border-border/50 rounded-xl p-1 shadow-sm flex-1 sm:flex-none">
                                <button onClick={() => changeDate(-1)} className="p-2.5 hover:bg-muted rounded-lg transition-colors active:scale-90">
                                    <ChevronLeft className="w-5 h-5 text-muted-foreground hover:text-primary" />
                                </button>
                                <div className="px-4 flex flex-col items-center min-w-[120px]">
                                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-none mb-1 opacity-60">Date Audit</span>
                                    <span className="text-xs font-black italic tracking-tight">{data?.dateLabel ? data.dateLabel : "..."}</span>
                                </div>
                                <button 
                                    onClick={() => changeDate(1)} 
                                    className={cn("p-2.5 hover:bg-muted rounded-lg transition-colors active:scale-90", isToday && "opacity-10 pointer-events-none")} 
                                    disabled={isToday}
                                >
                                    <ChevronRight className="w-5 h-5 text-muted-foreground hover:text-primary" />
                                </button>
                            </div>
                            
                             <div className="flex items-center gap-2 w-full sm:w-auto">
                                <NewExpenseSheet 
                                    trigger={
                                        <button className="flex-1 sm:flex-none bg-foreground text-background h-12 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                                            <Plus className="w-4 h-4" /> Nouvelle Dépense
                                        </button>
                                    }
                                />
                                <button onClick={fetchData} className="p-3.5 bg-card border border-border/50 rounded-xl hover:bg-muted transition-all shadow-sm active:scale-90">
                                    <RefreshCcw className={cn("w-4 h-4 text-muted-foreground", loading && "animate-spin")} />
                                </button>
                            </div>
                        </div>
                    }
                />

                {/* --- FINANCIAL HIGHLIGHTS (Elite SaaS) --- */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <EliteMetricCard 
                        label="Sorties" 
                        value={`${formatMoney(data?.total || 0)} F`} 
                        icon={TrendingDown} 
                        variant="red"
                        sub="Flux sortant"
                    />
                    <EliteMetricCard 
                        label="Tickets" 
                        value={data?.expenses?.length || 0} 
                        icon={Tag} 
                        variant="blue"
                        sub="Opérations"
                    />
                    <EliteMetricCard 
                        label="Caisse" 
                        value="SÉCURISÉ" 
                        icon={ShieldCheck} 
                        variant="emerald"
                        sub="Audit actif"
                    />
                    <EliteMetricCard 
                        label="Status" 
                        value="STABLE" 
                        icon={RefreshCcw} 
                        variant="purple"
                        sub="Sync Cloud"
                    />
                </div>

                {/* --- EXPENSES MASTER LIST --- */}
                <div className="bg-card border border-border/50 shadow-2xl rounded-[2rem] overflow-hidden flex-1 flex flex-col min-h-[300px] md:min-h-[600px]">
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto no-scrollbar">
                        <table className="w-full text-left text-sm border-separate border-spacing-0">
                            <thead className="bg-muted/10 text-muted-foreground text-[10px] font-black uppercase tracking-widest border-b border-border">
                                <tr>
                                    <th className="px-8 py-5">Heure / Enregistrement</th>
                                    <th className="px-8 py-5">Motif / Description</th>
                                    <th className="px-8 py-5 text-center">Catégorie</th>
                                    <th className="px-8 py-5">Opérateur</th>
                                    <th className="px-8 py-5 text-right italic text-primary">Montant Brut</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {loading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse"><td colSpan={5} className="h-24 px-8"><div className="w-full h-12 bg-muted/20 rounded-xl" /></td></tr>
                                    ))
                                ) : data?.expenses?.length === 0 ? (
                                    <tr><td colSpan={5} className="py-24 text-center text-muted-foreground italic font-black uppercase tracking-widest text-xs opacity-40">Aucune dépense identifiée.</td></tr>
                                ) : data?.expenses?.map((exp: any) => {
                                    const author = exp.user?.name || "Système";
                                    return (
                                        <tr key={exp.id} className="group hover:bg-muted/20 transition-all">
                                            <td className="px-8 py-6">
                                                <span className="block font-black text-foreground font-mono text-xs mb-1">{new Date(exp.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40">{new Date(exp.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                                            </td>
                                            <td className="px-8 py-6 max-w-[400px]">
                                                <span className="block font-black text-foreground text-xs uppercase tracking-tight italic group-hover:text-primary transition-colors leading-relaxed">{exp.description || exp.category}</span>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <span className="px-3 py-1 bg-muted/30 border border-border/50 rounded-lg text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary shadow-inner">{author.slice(0,2).toUpperCase()}</div>
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider truncate max-w-[120px]">{author}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-6">
                                                    <span className="text-sm font-black text-red-500 tabular-nums italic">
                                                        -{formatMoney(exp.amount)} F
                                                    </span>
                                                    
                                                    {isToday && (
                                                        <div className="opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                            <button 
                                                                onClick={() => handleDelete(exp.id)}
                                                                className="p-3 border border-border/50 rounded-xl bg-card hover:bg-red-500 hover:text-white text-red-500 transition-all shadow-lg active:scale-90"
                                                                title="Annuler dépense"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-border/20">
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="p-6 animate-pulse space-y-4">
                                    <div className="h-4 w-1/3 bg-muted/20 rounded" />
                                    <div className="h-10 w-full bg-muted/20 rounded-xl" />
                                </div>
                            ))
                        ) : data?.expenses?.length === 0 ? (
                            <div className="py-24 text-center text-muted-foreground italic font-black uppercase tracking-widest text-[10px] opacity-30">Aucun flux sortant.</div>
                        ) : data?.expenses?.map((exp: any) => (
                            <div key={exp.id} className="p-6 space-y-5 group active:bg-muted/10 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-red-500 font-mono italic">{new Date(exp.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="px-2 py-0.5 bg-muted/30 border border-border/50 rounded text-[8px] font-black uppercase text-muted-foreground tracking-widest">{exp.category}</span>
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-tight text-foreground italic leading-tight">{exp.description || exp.category}</h4>
                                    </div>
                                    <span className="text-base font-black text-red-500 tabular-nums italic">-{formatMoney(exp.amount)} F</span>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary">{(exp.user?.name || "S").slice(0,2).toUpperCase()}</div>
                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{exp.user?.name || "Système"}</span>
                                    </div>
                                    {isToday && (
                                        <button 
                                            onClick={() => handleDelete(exp.id)} 
                                            className="p-3.5 bg-red-500/5 text-red-500 border border-red-500/10 rounded-xl active:scale-90 transition-all shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
