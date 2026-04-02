"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
    ChevronLeft, ChevronRight, Plus, 
    TrendingDown, ArrowDownRight, Tag,
    RefreshCcw, ShieldCheck
} from "lucide-react";
import { getDailyExpenses } from "@/lib/actions/expenses";
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
            toast.error("Erreur de synchronisation");
        } finally {
            setLoading(false);
        }
    }, [date]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const formatMoney = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount);

    const changeDate = (days: number) => {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        const newD = d.toISOString().split('T')[0];
        if (newD > new Date().toISOString().split('T')[0]) return;
        setDate(newD);
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-background text-foreground transition-colors duration-500 overflow-y-auto custom-scrollbar min-h-screen">
            {loading && <TopLoader />}

            {/* --- COMPACT HEADER --- */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
                <div className="space-y-1">
                    <div className="space-y-0.5 text-center md:text-left">
                        <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none text-foreground">
                            Flux <span className="text-primary italic">Dépenses.</span>
                        </h1>
                        <p className="text-[8px] text-muted-foreground/30 font-black tracking-[0.3em] uppercase">Financial Registry Alpha</p>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                    <div className="flex items-center bg-card border border-border rounded-lg p-0.5 shadow-sm h-9">
                        <button onClick={() => changeDate(-1)} className="px-3 h-full border-r border-border hover:text-primary transition-colors focus:outline-none"><ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" /></button>
                        <div className="px-3 font-black text-[9px] uppercase tracking-widest text-foreground min-w-[110px] text-center">
                            {data?.dateLabel ? data.dateLabel.toUpperCase() : "..."}
                        </div>
                        <button onClick={() => changeDate(1)} className={cn("px-3 h-full hover:text-primary transition-colors focus:outline-none", isToday && "opacity-20 pointer-events-none")} disabled={isToday} title="Jour suivant"><ChevronRight className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    </div>

                    <NewExpenseSheet 
                        trigger={
                            <button className="bg-primary text-black border border-primary/20 px-4 py-2.5 rounded-lg font-black uppercase text-[9px] tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md italic">
                                <Plus className="w-3.5 h-3.5 stroke-[4]" />
                                Enregistrer
                            </button>
                        }
                    />
                    <button onClick={fetchData} className="p-2.5 bg-muted/30 border border-border rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm">
                        <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                    </button>
                </div>
            </header>

            {/* Metrics Row Compact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1 bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group flex flex-col justify-center min-h-[90px]">
                    <div className="relative z-10 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-primary">
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] leading-none opacity-50">Sortie Totale Jour</p>
                            <TrendingDown className="w-4 h-4 opacity-30" />
                        </div>
                        <h2 className="text-3xl font-black text-foreground italic tracking-tighter leading-none">
                            {loading ? "..." : formatMoney(data?.total || 0)} <span className="text-[10px] opacity-20 italic ml-1 uppercase">FCFA</span>
                        </h2>
                    </div>
                </div>

                <div className="md:col-span-2 bg-muted/5 border border-border/10 rounded-xl p-5 flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground/30">
                            <Tag className="w-3.5 h-3.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Résumé des Opérations Alpha</span>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground/40 max-w-lg leading-relaxed uppercase tracking-tight">
                            Les dépenses sont déduites du capital global et affectées au journal de caisse utilisateur.
                        </p>
                    </div>
                    <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center border border-primary/10">
                        <ShieldCheck className="w-5 h-5 text-primary opacity-20" />
                    </div>
                </div>
            </div>

            {/* --- COMPACT DAILY LOG --- */}
            <div className="bg-card rounded-xl shadow-sm overflow-hidden border border-border">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-muted/5 text-muted-foreground uppercase opacity-20 bg-muted/5">
                                <th className="px-6 py-3 text-[8px] font-black tracking-widest">Horodateur</th>
                                <th className="px-6 py-3 text-[8px] font-black tracking-widest text-left">Motif / Description</th>
                                <th className="px-6 py-3 text-[8px] font-black tracking-widest text-center">Catégorie</th>
                                <th className="px-6 py-3 text-[8px] font-black tracking-widest">Auteur</th>
                                <th className="px-6 py-3 text-[8px] font-black tracking-widest text-right">Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse border-b border-muted/5"><td colSpan={5} className="py-6" /></tr>
                                ))
                            ) : data?.expenses?.length === 0 ? (
                                <tr><td colSpan={5} className="py-16 text-center font-black text-muted-foreground uppercase tracking-[0.4em] italic opacity-10 text-[10px]">Registry Empty</td></tr>
                            ) : data?.expenses?.map((exp: any) => {
                                const author = exp.user?.name || "SYS";
                                return (
                                    <tr key={exp.id} className="group hover:bg-muted/5 transition-all border-b border-muted/5 last:border-0 italic">
                                        <td className="px-6 py-2.5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-foreground uppercase italic tracking-tighter">{new Date(exp.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                <span className="text-[7px] font-black text-muted-foreground opacity-30 uppercase">{new Date(exp.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2.5">
                                            <span className="text-[11px] font-black text-foreground tracking-tighter uppercase italic">{exp.description || exp.category}</span>
                                        </td>
                                        <td className="px-6 py-2.5">
                                            <div className="flex justify-center">
                                                <div className="px-3 py-1 bg-muted/20 border border-border/50 rounded text-[7px] font-black text-muted-foreground uppercase tracking-widest">
                                                    {exp.category}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-2.5">
                                            <span className="text-[9px] font-black uppercase text-muted-foreground/30 tracking-widest leading-none">{author}</span>
                                        </td>
                                        <td className="px-6 py-2.5 text-right">
                                            <span className="text-[12px] font-black text-red-500 italic">
                                                - {formatMoney(exp.amount)} <span className="text-[7px] opacity-40 ml-0.5 font-black uppercase">F</span>
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
