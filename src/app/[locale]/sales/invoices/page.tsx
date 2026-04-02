"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
    FileText, Printer, Mail, Search, 
    TrendingUp, AlertCircle, CheckCircle2, 
    ArrowUpRight, Clock, Filter, MoreVertical,
    FileSpreadsheet, ShieldAlert
} from "lucide-react";
import { getInvoices } from "@/lib/actions/invoices";
import { TopLoader } from "@/components/ui/top-loader";
import { toast } from "sonner";

export default function InvoicesPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getInvoices({ search, status: statusFilter });
            setData(res);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('fr-FR').format(amount);
    };

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-6 pb-20 font-sans transition-colors duration-500">
            {loading && <TopLoader />}

            <div className="max-w-[1500px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* --- MENTOR HEADER --- */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-0.5 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/40 italic">Revenue Control Protocol</span>
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase leading-none">
                                Facturation & <span className="text-primary italic">Trésorerie</span>
                            </h1>
                            <p className="text-xs font-black opacity-20 tracking-[0.3em] uppercase italic">MindOS Invoicing Core</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-muted/10 p-1.5 rounded-xl border border-border/30">
                        <button className="flex items-center gap-2 px-6 py-3 bg-card border border-border/50 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-zinc-900 transition-all shadow-sm">
                             <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                             Export Data
                        </button>
                    </div>
                </header>

                {/* --- MENTOR METRICS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Outstanding (Debt) Card */}
                    <div className="bg-[#050505] dark:bg-card rounded-2xl p-6 shadow-xl relative overflow-hidden group border border-white/5 dark:border-border/50 transition-all duration-500">
                        <div className="relative z-10 space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#EF4444] italic">Dettes Totales (Risk)</p>
                                <ShieldAlert className="w-5 h-5 text-[#EF4444]/30" />
                            </div>
                            <h2 className="text-3xl font-black text-white italic tracking-tighter">
                                {formatMoney(data?.metrics?.totalOutstanding || 0)} <span className="text-xs opacity-20 uppercase not-italic ml-1">F</span>
                            </h2>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Balance clients en attente</p>
                        </div>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 blur-[50px] rounded-full pointer-events-none" />
                    </div>

                    {/* Total Billed Card */}
                    <div className="bg-card rounded-2xl p-6 border border-border shadow-lg transition-all duration-500 group">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 italic">Facturation Globale</p>
                                <TrendingUp className="w-5 h-5 text-emerald-500/30 transition-transform group-hover:scale-110" />
                            </div>
                            <h2 className="text-3xl font-black text-foreground tracking-tighter italic">
                                {formatMoney(data?.metrics?.totalBilled || 0)} <span className="text-xs opacity-20 uppercase ml-1.5 tracking-widest">F CFA</span>
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest italic">Sur {data?.metrics?.invoiceCount || 0} Documents</span>
                            </div>
                        </div>
                    </div>

                    {/* Recovery Card */}
                    <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 shadow-lg transition-all duration-500 group">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-primary/60 italic">
                                <p className="text-[9px] font-black uppercase tracking-[0.4em]">Recovery Rate</p>
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="flex items-end gap-2">
                                <h2 className="text-3xl font-black text-primary tracking-tighter italic leading-none">
                                    {data?.metrics?.recoveryRate || 0}<span className="text-sm font-black ml-0.5">%</span>
                                </h2>
                                <ArrowUpRight className="w-5 h-5 text-primary/30 transform translate-y-[-5px]" />
                            </div>
                            <div className="w-full h-1 bg-primary/10 rounded-full overflow-hidden shadow-inner">
                                <div className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.5)]" style={{ width: `${data?.metrics?.recoveryRate || 100}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FILTERS & SEARCH --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 bg-muted/10 border border-border/30 rounded-xl p-1">
                        {["ALL", "COMPLETED", "PARTIAL", "UNPAID"].map(f => (
                            <button 
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                                    statusFilter === f ? "bg-primary text-black shadow-lg shadow-primary/20 scale-105 italic" : "text-muted-foreground hover:text-foreground hover:bg-background"
                                )}
                            >
                                {f.replace("COMPLETED", "PAYÉ").replace("UNPAID", "IMPAYÉ").replace("PARTIAL", "DETTE").replace("ALL", "TOUT")}
                            </button>
                        ))}
                    </div>
                    
                    <div className="relative group w-full md:w-[350px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-all" />
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="RECHERCHER CLIENT OU #INV..."
                            className="w-full bg-card border border-border/50 rounded-xl py-3 pl-12 pr-6 text-[9px] font-black uppercase tracking-widest focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/30 shadow-sm"
                        />
                    </div>
                </div>

                {/* --- POWER TABLE HUB --- */}
                <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-xl backdrop-blur-3xl transition-all duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-muted/10 text-muted-foreground bg-muted/5">
                                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-[0.3em] italic"># Invoice ID</th>
                                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-[0.3em] italic">Client Entity</th>
                                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-[0.3em] italic">Total Net</th>
                                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-[0.3em] italic">Settle Progress</th>
                                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-[0.3em] italic">Due / Balance</th>
                                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-[0.3em] italic text-center">Type</th>
                                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-[0.3em] italic text-right">Vault Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse border-b border-muted/10"><td colSpan={7} className="h-24" /></tr>
                                    ))
                                ) : data?.invoices?.length === 0 ? (
                                    <tr><td colSpan={7} className="py-32 text-center text-[11px] font-black uppercase tracking-[0.4em] opacity-20 italic">No Billing Records Found</td></tr>
                                ) : data?.invoices?.map((inv: any) => {
                                    const debt = inv.totalAmount - inv.amountPaid;
                                    const progress = Math.round((inv.amountPaid / inv.totalAmount) * 100);

                                    return (
                                        <tr key={inv.id} className="group hover:bg-muted/5 transition-all border-b border-muted/5 last:border-0 relative">
                                            <td className="px-6 py-4">
                                                <div className="space-y-0.5">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">#INV-{inv.id.slice(-6)}</span>
                                                    <div className="flex items-center gap-1.5 text-[8px] font-bold opacity-30">
                                                        <Clock className="w-2.5 h-2.5" /> {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[12px] font-black uppercase tracking-tight text-foreground">{inv.customerName || "CASUAL CLIENT"}</span>
                                            </td>
                                            <td className="px-6 py-4 font-black text-[12px] italic">{formatMoney(inv.totalAmount)} F</td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2 w-32">
                                                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest leading-none">
                                                         <span className={cn(debt > 0 ? "text-amber-500" : "text-emerald-500")}>
                                                            {progress}% Settle
                                                         </span>
                                                    </div>
                                                    <div className="w-full h-1 bg-muted/10 rounded-full overflow-hidden shadow-inner">
                                                         <div 
                                                            className={cn("h-full transition-all duration-1000", debt > 0 ? "bg-amber-500" : "bg-emerald-500")}
                                                            style={{ width: `${progress}%` }} 
                                                         />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={cn(
                                                    "text-[12px] font-black italic",
                                                    debt > 0 ? "text-red-500" : "opacity-5"
                                                )}>
                                                    {debt > 0 ? formatMoney(debt) + " F" : "CLEARED"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <div className={cn(
                                                        "px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest min-w-[90px] text-center shadow-sm italic",
                                                        inv.paymentMethod === 'WAVE' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : 
                                                        inv.paymentMethod === 'CASH' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted/5 text-zinc-500 border-border"
                                                    )}>
                                                        {inv.paymentMethod}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                                    <button className="p-2 bg-background border border-border/50 hover:bg-primary hover:text-white rounded-lg transition-all">
                                                        <Printer className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button className="p-2 bg-background border border-border/50 hover:bg-primary hover:text-white rounded-lg transition-all">
                                                        <Mail className="w-3.5 h-3.5" />
                                                    </button>
                                                    <div className="w-px h-6 bg-border mx-0.5" />
                                                    <button className="p-2 bg-foreground text-background hover:bg-primary hover:text-white rounded-lg transition-all shadow-lg">
                                                        <FileText className="w-3.5 h-3.5" />
                                                    </button>
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
