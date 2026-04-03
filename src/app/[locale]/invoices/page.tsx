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

import { SaleStatus } from "@prisma/client";

interface InvoiceItem {
    id: string;
    product: { name: string };
    quantity: number;
    price: number;
}

interface Invoice {
    id: string;
    customerName?: string;
    totalAmount: number;
    amountPaid: number;
    status: SaleStatus;
    paymentMethod: string;
    createdAt: string;
    items?: InvoiceItem[];
}

export default function InvoicesPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ invoices: Invoice[], metrics: any } | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getInvoices({ search, status: statusFilter as any });
            setData(res as any);
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
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#050505] text-[#1A1A1A] dark:text-white p-4 md:p-10 pb-32 font-sans selection:bg-primary/20">
            {loading && <TopLoader />}

            <div className="max-w-[1500px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* --- MENTOR HEADER: INVOICING HUB --- */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-1 bg-primary rounded-full" />
                             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/60">Revenue Control Hub</span>
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black tracking-tighter italic uppercase leading-none">
                                Facturation & <span className="text-primary italic underline decoration-primary/20 underline-offset-4">Trésorerie.</span>
                            </h1>
                            <p className="text-[10px] font-black opacity-10 tracking-[0.3em] uppercase">MindOS Invoicing Core</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-white/5 border border-[#E9ECEF] dark:border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 transition-all">
                             <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                             Export Excel
                        </button>
                    </div>
                </header>

                {/* --- MENTOR METRICS --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Outstanding (Debt) Card */}
                    <div className="bg-[#050505] rounded-2xl p-6 shadow-2xl relative overflow-hidden group border border-white/5 flex flex-col justify-between">
                        <div className="relative z-10 space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#EF4444]">Dettes Totales</p>
                                <ShieldAlert className="w-5 h-5 text-[#EF4444]/20" />
                            </div>
                            <h2 className="text-3xl font-black text-white italic tracking-tighter">
                                {formatMoney(data?.metrics?.totalOutstanding || 0)} <span className="text-sm opacity-20 uppercase not-italic">F</span>
                            </h2>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Balance Clients</p>
                        </div>
                    </div>

                    {/* Total Billed Card */}
                    <div className="bg-white dark:bg-white/5 rounded-2xl p-6 border border-[#E9ECEF] dark:border-white/10 shadow-3xl flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9EA3A7]">Facturation Global</p>
                                <TrendingUp className="w-5 h-5 text-emerald-500/20" />
                            </div>
                            <h2 className="text-3xl font-black text-[#1A1A1A] dark:text-white tracking-tighter">
                                {formatMoney(data?.metrics?.totalBilled || 0)} <span className="text-sm opacity-20 uppercase ml-1">F CFA</span>
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">Sur {data?.metrics?.invoiceCount || 0} Docs</span>
                            </div>
                        </div>
                    </div>

                    {/* Recovery Card */}
                    <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 shadow-3xl flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-primary">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em]">Taux Recouvrement</p>
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div className="flex items-end gap-2">
                                <h2 className="text-4xl font-black text-primary tracking-tighter italic leading-none">
                                    {data?.metrics?.recoveryRate || 0}<span className="text-xl font-black ml-1">%</span>
                                </h2>
                                <ArrowUpRight className="w-6 h-6 text-primary opacity-20" />
                            </div>
                            <div className="w-full h-1 bg-primary/10 rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${data?.metrics?.recoveryRate || 100}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FILTERS & SEARCH --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                    <div className="flex items-center gap-3 bg-white dark:bg-white/5 border border-[#E9ECEF] dark:border-white/10 rounded-2xl p-1.5">
                        {["ALL", "COMPLETED", "PARTIAL", "UNPAID"].map(f => (
                            <button 
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={cn(
                                    "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                    statusFilter === f ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105" : "text-[#9EA3A7] hover:text-[#1A1A1A] dark:hover:text-white"
                                )}
                            >
                                {f.replace("COMPLETED", "PAYÉ").replace("UNPAID", "IMPAYÉ").replace("PARTIAL", "DETTE").replace("ALL", "TOUT")}
                            </button>
                        ))}
                    </div>
                    
                    <div className="relative group w-full md:w-[400px]">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CED4DA] group-focus-within:text-primary transition-all" />
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="RECHERCHER CLIENT OU #INV..."
                            className="w-full bg-white dark:bg-white/5 border border-[#E9ECEF] dark:border-white/10 rounded-2xl py-4.5 pl-14 pr-8 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:opacity-20"
                        />
                    </div>
                </div>

                {/* --- POWER TABLE HUB --- */}
                <div className="bg-white dark:bg-white/[0.02] rounded-[3rem] border border-[#E9ECEF] dark:border-white/5 overflow-hidden shadow-3xl backdrop-blur-3xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border/50 text-muted-foreground bg-muted/5">
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em]"># Invoice</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em]">Client Entity</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em]">Total Net</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em]">Settle Status</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em]">Due / Debt</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-center">Protocol</th>
                                    <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.3em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse border-b border-[#F8F9FA] dark:border-white/5"><td colSpan={7} className="h-24" /></tr>
                                    ))
                                ) : data?.invoices?.length === 0 ? (
                                    <tr><td colSpan={7} className="py-32 text-center text-[11px] font-black uppercase tracking-[0.4em] opacity-20 italic">No Billing Records Detected</td></tr>
                                ) : data?.invoices?.map((inv: Invoice) => {
                                    const debt = inv.totalAmount - inv.amountPaid;
                                    const progress = Math.round((inv.amountPaid / inv.totalAmount) * 100);

                                    return (
                                        <tr key={inv.id} className="group hover:bg-muted/10 transition-all border-b border-border/10 last:border-0 relative">
                                            <td className="px-8 py-4">
                                                <div className="space-y-0.5">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#CED4DA]">#INV-{inv.id.slice(-6)}</span>
                                                    <div className="flex items-center gap-1.5 text-[8px] font-bold opacity-30">
                                                        <Clock className="w-2.5 h-2.5" /> {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className="text-[11px] font-black uppercase tracking-tight dark:text-white italic">{inv.customerName || "WALK-IN CLIENT"}</span>
                                            </td>
                                            <td className="px-8 py-4 font-black text-xs italic">{formatMoney(inv.totalAmount)} F</td>
                                            <td className="px-8 py-4">
                                                <div className="space-y-2 w-32">
                                                    <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                                                         <span className={cn(debt > 0 ? "text-amber-500" : "text-emerald-500")}>
                                                            {progress}% Paid
                                                         </span>
                                                    </div>
                                                    <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                                                         <div 
                                                            className={cn("h-full transition-all duration-1000", debt > 0 ? "bg-amber-500" : "bg-emerald-500")}
                                                            style={{ width: `${progress}%` }} 
                                                         />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4">
                                                <span className={cn(
                                                    "text-xs font-black italic",
                                                    debt > 0 ? "text-red-500" : "opacity-10"
                                                )}>
                                                    {debt > 0 ? formatMoney(debt) + " F" : "— SETTLED —"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex justify-center">
                                                    <div className={cn(
                                                        "px-3 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest min-w-[90px] text-center",
                                                        inv.paymentMethod === 'WAVE' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : 
                                                        inv.paymentMethod === 'CASH' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-zinc-500 border-white/10"
                                                    )}>
                                                        {inv.paymentMethod}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                    <button className="p-2 bg-card border border-border hover:bg-muted rounded-lg shadow-sm transition-all text-muted-foreground hover:text-foreground">
                                                        <Printer className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button className="p-2 bg-card border border-border hover:bg-muted rounded-lg shadow-sm transition-all text-muted-foreground hover:text-foreground">
                                                        <Mail className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button className="p-2 bg-primary text-black hover:bg-primary/80 rounded-lg transition-all shadow-md">
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
