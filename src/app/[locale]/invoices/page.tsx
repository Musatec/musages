"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { 
    FileText, Printer, Mail, Search, 
    TrendingUp, AlertCircle, CheckCircle2, 
    ArrowUpRight, Clock, Filter, MoreVertical,
    FileSpreadsheet, ShieldAlert, Trash2
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
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#050505] text-[#1A1A1A] dark:text-foreground p-4 md:p-10 pb-32 font-sans selection:bg-primary/20">
            {loading && <TopLoader />}

            <div className="max-w-[1500px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Header: Pro & Clean */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-border/40 pb-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase italic leading-none">
                            Facturation & <span className="text-primary italic">Trésorerie.</span>
                        </h1>
                        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">
                            <div className="w-8 h-0.5 bg-primary/30 rounded-full" />
                            <span>GESTION DES FLUX FINANCIERS PROTOCOL</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                         <button className="flex items-center gap-3 px-6 py-3 bg-muted/20 border border-border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-muted/40 transition-all">
                             <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                             Export Excel
                        </button>
                    </div>
                </header>

                {/* --- MENTOR METRICS: INTEGRATED PANEL --- */}
                <div className="bg-card border border-border/50 rounded-[2.5rem] p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/2 blur-[100px] rounded-full pointer-events-none" />
                    
                    {/* Outstanding (Debt) */}
                    <div className="flex-1 flex flex-col items-center md:items-start gap-4 relative z-10 w-full md:border-r border-border/20 md:pr-10">
                        <div className="flex items-center gap-3">
                             <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                                <ShieldAlert className="w-4 h-4" />
                             </div>
                             <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/30 italic">Dettes Totales</span>
                        </div>
                        <div className="space-y-1 text-center md:text-left">
                            <h2 className="text-4xl font-black text-foreground tracking-tighter italic leading-none">
                                {formatMoney(data?.metrics?.totalOutstanding || 0)} <span className="text-xl opacity-20 not-italic ml-1">F</span>
                            </h2>
                            <p className="text-xs font-bold text-muted-foreground/20 uppercase tracking-widest">Balance Clients à recouvrer</p>
                        </div>
                    </div>

                    {/* Total Billed */}
                    <div className="flex-1 flex flex-col items-center md:items-start gap-4 relative z-10 w-full md:border-r border-border/20 md:pr-10">
                        <div className="flex items-center gap-3">
                             <div className="p-2 rounded-xl bg-muted/30 border border-border text-primary transition-all group-hover:bg-primary group-hover:text-black">
                                <TrendingUp className="w-4 h-4" />
                             </div>
                             <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/30 italic">Facturation Global</span>
                        </div>
                        <div className="space-y-1 text-center md:text-left">
                            <h2 className="text-4xl font-black text-foreground tracking-tighter italic leading-none text-emerald-500">
                                {formatMoney(data?.metrics?.totalBilled || 0)} <span className="text-xl opacity-20 not-italic ml-1">F</span>
                            </h2>
                            <p className="text-xs font-bold text-muted-foreground/20 uppercase tracking-widest">Volumes sur {data?.metrics?.invoiceCount || 0} factures</p>
                        </div>
                    </div>

                    {/* Payment Progress */}
                    <div className="w-full md:w-64 space-y-4 relative z-10">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 italic">Taux de Recouvrement</span>
                            <span className="text-lg font-black italic text-primary">{data?.metrics?.recoveryRate || 0}%</span>
                        </div>
                        <div className="h-3 w-full bg-muted/20 border border-border/50 rounded-full overflow-hidden p-0.5 shadow-inner">
                            <div 
                                className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-1000" 
                                style={{ width: `${data?.metrics?.recoveryRate || 0}%` }} 
                            />
                        </div>
                    </div>
                </div>

                {/* --- INVOICE LEDGER: HIGH-DENSITY TABLE --- */}
                <div className="bg-card border border-border/50 rounded-[2.5rem] overflow-hidden shadow-2xl flex-1 flex flex-col min-h-[600px]">
                     <div className="p-8 border-b border-border/30 bg-muted/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                         <div className="relative group w-full md:w-96">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/20 group-focus-within:text-primary transition-all" />
                            <input 
                                placeholder="RECHERCHER FACTURE / CLIENT..." 
                                className="w-full bg-background border border-border rounded-2xl pl-14 pr-6 py-4 text-xs font-black uppercase tracking-[0.1em] outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                         </div>
                         <div className="flex items-center gap-3 bg-muted/10 p-1.5 rounded-2xl border border-border/10">
                            {['ALL', 'COMPLETED', 'PARTIAL', 'UNPAID'].map((status) => (
                                <button 
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={cn(
                                        "px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                        statusFilter === status 
                                            ? "bg-primary text-black shadow-lg shadow-primary/20" 
                                            : "text-muted-foreground/40 hover:bg-muted/20"
                                    )}
                                >
                                    {status.replace("COMPLETED", "PAYÉ").replace("UNPAID", "IMPAYÉ").replace("PARTIAL", "DETTE").replace("ALL", "TOUT")}
                                </button>
                            ))}
                         </div>
                     </div>

                     <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="sticky top-0 z-20 bg-muted/30 backdrop-blur-md text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 border-b border-border">
                                    <th className="px-10 py-6 border-b border-border/50">ID / Protocole</th>
                                    <th className="px-10 py-6 border-b border-border/50">Entité Client</th>
                                    <th className="px-10 py-6 border-b border-border/50 text-primary italic">Net à Payer</th>
                                    <th className="px-10 py-6 border-b border-border/50 text-primary italic">Balance Restante</th>
                                    <th className="px-10 py-6 border-b border-border/50 text-center">Protocol Sync</th>
                                    <th className="px-10 py-6 border-b border-border/50 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/10">
                                {data?.invoices.map((inv) => (
                                    <tr key={inv.id} className="group hover:bg-muted/5 transition-all">
                                        <td className="px-10 py-6">
                                             <div className="flex flex-col">
                                                <span className="text-xs font-black italic">#{inv.id.slice(-6).toUpperCase()}</span>
                                                <span className="text-[9px] font-bold opacity-20 uppercase tracking-widest mt-1 italic">Record {new Date(inv.createdAt).toLocaleDateString()}</span>
                                             </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black uppercase tracking-tighter text-foreground italic">{inv.customerName || "CLIENT PASSANT"}</span>
                                                <span className="text-[9px] font-black text-muted-foreground/20 uppercase tracking-widest mt-1">Secteur Market</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <span className="text-sm font-black italic text-foreground tracking-tighter">{formatMoney(inv.totalAmount)} F</span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex flex-col gap-1.5 min-w-[150px]">
                                                <span className={cn(
                                                    "text-sm font-black italic tracking-tighter",
                                                    (inv.totalAmount - inv.amountPaid) > 0 ? "text-primary" : "text-emerald-500 opacity-20"
                                                )}>
                                                    {formatMoney(inv.totalAmount - inv.amountPaid)} F
                                                </span>
                                                <div className="h-0.5 w-full bg-muted/20 rounded-full overflow-hidden">
                                                     <div className={cn("h-full transition-all duration-1000", (inv.totalAmount - inv.amountPaid) > 0 ? "bg-primary" : "bg-emerald-500")} style={{ width: `${(inv.amountPaid / inv.totalAmount) * 100}%` }} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex justify-center">
                                                <div className={cn(
                                                    "px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest min-w-[120px] text-center italic shadow-inner",
                                                    inv.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                                                    inv.status === 'PARTIAL' ? "bg-primary/10 text-primary border-primary/20" : 
                                                    "bg-red-500/10 text-red-500 border-red-500/20"
                                                )}>
                                                    {inv.status === 'COMPLETED' ? "SECURED ✅" : inv.status === 'PARTIAL' ? "PARTIAL ⏳" : "UNPAID ⚠️"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 translate-x-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                <button className="p-3 bg-background border border-border/50 hover:bg-primary hover:text-black rounded-xl transition-all shadow-sm">
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                                <button className="p-3 bg-background border border-border/50 hover:bg-zinc-800 hover:text-foreground rounded-xl transition-all shadow-sm">
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                                <button className="p-3 bg-background border border-border/50 hover:bg-red-500 hover:text-foreground rounded-xl transition-all shadow-sm">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>
            </div>
        </div>
    );
}
