"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
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

    const formatMoney = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount);

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
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-8">
            {loading && <TopLoader />}

            <div className="max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                
                {/* --- PROFESSIONAL HEADER --- */}
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/50 text-foreground">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-sm">
                            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-muted rounded-lg transition-colors"><ChevronLeft className="w-5 h-5 text-muted-foreground hover:text-primary" /></button>
                            <div className="px-4 flex flex-col items-center min-w-[140px]">
                                <span className="text-xs font-bold text-red-500 uppercase tracking-tight">Caisse du jour</span>
                                <span className="text-sm font-semibold">{data?.dateLabel ? data.dateLabel : "..."}</span>
                            </div>
                            <button 
                                onClick={() => changeDate(1)} 
                                className={cn("p-2 hover:bg-muted rounded-lg transition-colors", isToday && "opacity-10 pointer-events-none")} 
                                disabled={isToday}
                            >
                                <ChevronRight className="w-5 h-5 text-muted-foreground hover:text-primary" />
                            </button>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Sorties de Caisse</h1>
                            <p className="text-xs text-muted-foreground">Suivi quotidien des charges opérationnelles.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                         <NewExpenseSheet 
                            trigger={
                                <button className="bg-primary text-primary-foreground h-10 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/10">
                                    <Plus className="w-4 h-4" /> Nouvelle Dépense
                                </button>
                            }
                        />
                        <button onClick={fetchData} className="p-2.5 bg-card border border-border rounded-xl hover:bg-muted transition-colors shadow-sm">
                            <RefreshCcw className={cn("w-4 h-4 text-muted-foreground", loading && "animate-spin")} />
                        </button>
                    </div>
                </header>

                {/* --- FINANCIAL HIGHLIGHTS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total des Sorties", value: data?.total || 0, icon: TrendingDown, color: "text-red-500", sub: "Flux monétaire sortant" },
                        { label: "Opérations du jour", value: data?.expenses?.length || 0, icon: Tag, color: "text-primary", sub: "Nombre de tickets" },
                        { label: "État de la Trésorerie", value: "SÉCURISÉ", icon: ShieldCheck, color: "text-emerald-500", sub: "Contrôle d'accès actif" },
                        { label: "Dernière Synchronisation", value: "STABLE", icon: RefreshCcw, color: "text-indigo-500", sub: "Vérification cloud ok" }
                    ].map((m, i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={cn("p-2 rounded-lg bg-muted/50 border border-border shadow-sm", m.color)}>
                                    <m.icon className="w-4 h-4" />
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{m.label}</span>
                            </div>
                            <h2 className={cn("text-2xl font-bold", m.color === 'text-red-500' ? 'text-red-500' : 'text-foreground')}>
                                {typeof m.value === 'number' ? formatMoney(m.value) : m.value} 
                                <span className="text-xs font-medium ml-1 opacity-40">{typeof m.value === 'number' ? ' FCFA' : ''}</span>
                            </h2>
                            <p className="text-[11px] text-muted-foreground mt-1">{m.sub}</p>
                        </div>
                    ))}
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
