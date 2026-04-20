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
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-4">
            {loading && <TopLoader />}

            <div className="max-w-[1600px] mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                
                {/* --- PROFESSIONAL HEADER --- */}
                <ElitePageHeader 
                    title="Flux & Charges Opérationnelles."
                    subtitle="Gestion de Caisse"
                    description="Contrôlez vos dépenses quotidiennes, gérez les justificatifs et analysez l'impact des charges sur votre trésorerie."
                    actions={
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-sm">
                                <button onClick={() => changeDate(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                                    <ChevronLeft className="w-5 h-5 text-muted-foreground hover:text-primary" />
                                </button>
                                <div className="px-4 flex flex-col items-center min-w-[140px]">
                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-none mb-1">Date Audit</span>
                                    <span className="text-xs font-bold italic">{data?.dateLabel ? data.dateLabel : "..."}</span>
                                </div>
                                <button 
                                    onClick={() => changeDate(1)} 
                                    className={cn("p-2 hover:bg-muted rounded-lg transition-colors", isToday && "opacity-10 pointer-events-none")} 
                                    disabled={isToday}
                                >
                                    <ChevronRight className="w-5 h-5 text-muted-foreground hover:text-primary" />
                                </button>
                            </div>
                            <NewExpenseSheet 
                                trigger={
                                    <button className="bg-primary text-primary-foreground h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20">
                                        <Plus className="w-4 h-4" /> Nouvelle Dépense
                                    </button>
                                }
                            />
                            <button onClick={fetchData} className="p-3 bg-card border border-border rounded-xl hover:bg-muted transition-all shadow-sm">
                                <RefreshCcw className={cn("w-5 h-5 text-muted-foreground", loading && "animate-spin")} />
                            </button>
                        </div>
                    }
                />

                {/* --- FINANCIAL HIGHLIGHTS (Elite SaaS) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <EliteMetricCard 
                        label="Total des Sorties" 
                        value={`${formatMoney(data?.total || 0)} F`} 
                        icon={TrendingDown} 
                        variant="red"
                        sub="Flux monétaire sortant"
                    />
                    <EliteMetricCard 
                        label="Opérations du jour" 
                        value={data?.expenses?.length || 0} 
                        icon={Tag} 
                        variant="blue"
                        sub="Nombre de tickets"
                    />
                    <EliteMetricCard 
                        label="État Trésorerie" 
                        value="SÉCURISÉ" 
                        icon={ShieldCheck} 
                        variant="emerald"
                        sub="Contrôle actif"
                    />
                    <EliteMetricCard 
                        label="Dernière Synchro" 
                        value="STABLE" 
                        icon={RefreshCcw} 
                        variant="purple"
                        sub="Cloud vérifié"
                    />
                </div>

                {/* --- EXPENSES MASTER LIST --- */}
                <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden flex-1 flex flex-col min-h-[500px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-separate border-spacing-0">
                            <thead className="bg-muted/10 text-muted-foreground text-xs font-semibold border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 uppercase tracking-wider">Heure / Enregistrement</th>
                                    <th className="px-6 py-4 uppercase tracking-wider">Motif / Description</th>
                                    <th className="px-6 py-4 uppercase tracking-wider text-center">Catégorie</th>
                                    <th className="px-6 py-4 uppercase tracking-wider">Opérateur</th>
                                    <th className="px-6 py-4 uppercase tracking-wider text-right">Montant</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {loading ? (
                                    Array(6).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse"><td colSpan={5} className="h-20 px-6"><div className="w-full h-10 bg-muted/30 rounded-lg" /></td></tr>
                                    ))
                                ) : data?.expenses?.length === 0 ? (
                                    <tr><td colSpan={5} className="py-24 text-center text-muted-foreground italic">Aucune dépense enregistrée pour ce jour.</td></tr>
                                ) : data?.expenses?.map((exp: any) => {
                                    const author = exp.user?.name || "Système";
                                    return (
                                        <tr key={exp.id} className="group hover:bg-muted/20 transition-all">
                                            <td className="px-6 py-5">
                                                <span className="block font-bold text-foreground font-mono text-xs">{new Date(exp.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span className="text-[10px] text-muted-foreground font-medium uppercase">{new Date(exp.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                                            </td>
                                            <td className="px-6 py-5 max-w-[400px]">
                                                <span className="block font-bold text-foreground text-sm uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">{exp.description || exp.category}</span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="px-2.5 py-1 bg-muted/40 border border-border rounded text-[10px] font-bold text-muted-foreground uppercase shadow-sm">
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">{author.slice(0,2).toUpperCase()}</div>
                                                    <span className="text-xs font-bold text-muted-foreground uppercase truncate max-w-[120px]">{author}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-5">
                                                    <span className="text-base font-bold text-red-500 font-mono">
                                                        -{formatMoney(exp.amount)} F
                                                    </span>
                                                    
                                                    {isToday && (
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => handleDelete(exp.id)}
                                                                className="p-2 border border-border rounded-lg bg-background hover:bg-red-500 hover:text-white text-red-500 transition-colors shadow-sm"
                                                                title="Annuler dépense"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
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
                </div>
            </div>
        </div>
    );
}
