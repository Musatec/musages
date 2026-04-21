"use client";

import { useEffect, useState, useCallback } from "react";
import { cn, formatMoney } from "@/lib/utils";
import { 
    FileText, Printer, Mail, Search, 
    TrendingUp, CheckCircle2, 
    Clock, Filter,
    FileSpreadsheet, ShieldAlert,
    ChevronDown
} from "lucide-react";
import { getInvoices } from "@/lib/actions/invoices";
import { TopLoader } from "@/components/ui/top-loader";
import { toast } from "sonner";
import { InvoicesData } from "@/types/invoices";
import { EliteMetricCard } from "@/components/ui/metric-card";
import { ElitePageHeader } from "@/components/ui/page-header";

export default function InvoicesPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<InvoicesData | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getInvoices({ 
                search, 
                status: statusFilter as any 
            });
            setData(res);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="flex-1 flex flex-col transition-all duration-300 p-4 md:p-8 pt-6 md:pt-10 pb-40 text-foreground">
            {loading && <TopLoader />}

            <div className="max-w-[1500px] mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            <ElitePageHeader 
                title="Audit Documentaire & Flux."
                subtitle="Gestion Commerciale"
                description="Gérez vos factures clients, suivez les encaissements en temps réel et analysez les performances de recouvrement."
                actions={
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <div className="hidden sm:block relative group sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <input 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher #INV / Client..."
                                className="w-full bg-card border border-border rounded-xl py-3 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/30 shadow-sm"
                            />
                        </div>
                        <button className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 bg-card border border-border/50 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-muted transition-all shadow-sm active:scale-95 group">
                             <FileSpreadsheet className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                             <span>Export Données Audit</span>
                        </button>
                    </div>
                }
            />

            {/* --- METRICS GRID (Elite SaaS) --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <EliteMetricCard 
                    label="Facturation" 
                    value={`${formatMoney(data?.metrics?.totalBilled || 0)} F`} 
                    icon={TrendingUp} 
                    variant="blue"
                    sub="Volume brut"
                />
                <EliteMetricCard 
                    label="À Percevoir" 
                    value={`${formatMoney(data?.metrics?.totalOutstanding || 0)} F`} 
                    icon={ShieldAlert} 
                    variant="red"
                    sub="Créances"
                />
                <EliteMetricCard 
                    label="Recouvrement" 
                    value={`${data?.metrics?.recoveryRate || 0}%`} 
                    icon={CheckCircle2} 
                    variant="emerald"
                    sub="Performance"
                />
                <EliteMetricCard 
                    label="Factures" 
                    value={data?.invoices?.length || 0} 
                    icon={FileText} 
                    variant="purple"
                    sub="Documents"
                />
            </div>

            {/* --- FILTERS PROTOCOL --- */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                {[
                    { id: "ALL", label: "TOUT" },
                    { id: "COMPLETED", label: "PAYÉES" },
                    { id: "PARTIAL", label: "DETTES" },
                    { id: "UNPAID", label: "IMPAYÉES" }
                ].map(f => (
                    <button 
                        key={f.id}
                        onClick={() => setStatusFilter(f.id)}
                        className={cn(
                            "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm border",
                            statusFilter === f.id 
                                ? "bg-primary text-primary-foreground border-transparent shadow-primary/20 scale-105" 
                                : "bg-card border-border text-muted-foreground/40 hover:bg-muted"
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* --- INVOICES CONTAINER --- */}
            <div className="bg-card border border-border shadow-2xl rounded-[2rem] overflow-hidden flex-1 flex flex-col min-h-[500px]">
                {/* Desktop View Table */}
                <div className="hidden md:block overflow-x-auto no-scrollbar">
                    <table className="w-full text-left text-sm border-separate border-spacing-0">
                        <thead className="bg-muted/10 text-muted-foreground text-[10px] font-black uppercase tracking-widest border-b border-border">
                            <tr>
                                <th className="px-8 py-5 border-b border-border/50">Identifiant / Date</th>
                                <th className="px-8 py-5 border-b border-border/50">Client / Mode</th>
                                <th className="px-8 py-5 border-b border-border/50 text-primary italic">Montant Net</th>
                                <th className="px-8 py-5 border-b border-border/50">Recouvrement</th>
                                <th className="px-8 py-5 border-b border-border/50 text-right">Reste à payer</th>
                                <th className="px-8 py-5 border-b border-border/50 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-8 py-8"><div className="h-10 bg-muted/20 rounded-xl w-full" /></td>
                                    </tr>
                                ))
                            ) : data?.invoices?.length === 0 ? (
                                <tr><td colSpan={6} className="py-20 text-center text-muted-foreground italic font-medium opacity-40 uppercase tracking-widest text-xs">Aucune donnée de facturation identifiée.</td></tr>
                            ) : data?.invoices?.map((inv: any) => {
                                const debt = inv.totalAmount - inv.amountPaid;
                                const progress = Math.round((inv.amountPaid / inv.totalAmount) * 100);

                                return (
                                    <tr key={inv.id} className="group hover:bg-muted/20 transition-all">
                                        <td className="px-8 py-6">
                                            <span className="block text-xs font-black text-foreground mb-1 italic">#INV-{inv.id.slice(-8).toUpperCase()}</span>
                                            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40">
                                                <Clock className="w-3 h-3" /> {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="block font-black text-foreground text-xs uppercase tracking-tight italic">{inv.customerName || "CLIENT PASSANT"}</span>
                                            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 block opacity-30">{inv.paymentMethod || 'CASH PROTOCOL'}</span>
                                        </td>
                                        <td className="px-8 py-6 font-black text-foreground text-sm italic tabular-nums">
                                            {formatMoney(inv.totalAmount)} F
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2 w-40">
                                                <div className="w-full h-1 bg-muted/40 rounded-full overflow-hidden">
                                                     <div 
                                                        className={cn("h-full transition-all duration-1000 shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]", debt > 0 ? "bg-primary" : "bg-emerald-500")}
                                                        style={{ width: `${progress}%` }} 
                                                     />
                                                </div>
                                                <span className={cn("text-[8px] font-black uppercase tracking-widest", debt > 0 ? "text-primary/60" : "text-emerald-600/60")}>
                                                    {progress}% RECOUVRÉ
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-sm tabular-nums">
                                            <span className={cn(debt > 0 ? "text-red-500" : "text-emerald-500/20 italic")}>
                                                {debt > 0 ? formatMoney(debt) + " F" : "SOLDÉ ✅"}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                <button 
                                                    onClick={() => window.open(`/r/${inv.id}?print=true`, '_blank')} 
                                                    className="p-3 border border-border/50 rounded-xl bg-card hover:bg-primary hover:text-black transition-all shadow-sm group/btn"
                                                    title="Imprimer"
                                                >
                                                    <Printer className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const url = `${window.location.origin}/r/${inv.id}`;
                                                        const subject = `Facture #INV-${inv.id.slice(-8).toUpperCase()}`;
                                                        const body = `Bonjour ${inv.customerName || ''},\n\nVoici le lien vers votre facture : ${url}`;
                                                        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                                    }}
                                                    className="p-3 border border-border/50 rounded-xl bg-card hover:bg-indigo-500 hover:text-white transition-all shadow-sm group/btn"
                                                    title="Envoyer Email"
                                                >
                                                    <Mail className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                                                </button>
                                                <button 
                                                    onClick={() => window.open(`/r/${inv.id}`, '_blank')}
                                                    className="p-3 bg-foreground text-background rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95"
                                                    title="Ouvrir Détails"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                </button>
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
                            <div key={i} className="p-6 space-y-4 animate-pulse">
                                <div className="h-4 bg-muted/20 rounded w-1/3" />
                                <div className="h-6 bg-muted/20 rounded w-full" />
                                <div className="h-2 bg-muted/20 rounded w-full" />
                            </div>
                        ))
                    ) : data?.invoices?.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground italic font-black uppercase tracking-widest text-[10px] opacity-30">Aucun document identifié.</div>
                    ) : data?.invoices?.map((inv: any) => {
                        const debt = inv.totalAmount - inv.amountPaid;
                        const progress = Math.round((inv.amountPaid / inv.totalAmount) * 100);

                        return (
                            <div key={inv.id} className="p-6 space-y-5 group active:bg-muted/10 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black italic text-primary font-mono">#INV-{inv.id.slice(-8).toUpperCase()}</span>
                                            <div className={cn(
                                                "px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase border shadow-inner",
                                                debt === 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : 
                                                progress > 0 ? "bg-primary/10 text-primary border-primary/20" : 
                                                "bg-red-500/10 text-red-500 border-red-500/20"
                                            )}>
                                                {debt === 0 ? 'PAYÉ' : progress > 0 ? 'PARTIEL' : 'IMPAYÉ'}
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-black uppercase tracking-tight text-foreground italic">{inv.customerName || "CLIENT PASSANT"}</h4>
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground/40 font-mono italic">{new Date(inv.createdAt).toLocaleDateString()}</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                                        <span>Progression de Paie</span>
                                        <span>{progress}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden">
                                        <div 
                                            className={cn("h-full transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]", debt === 0 ? "bg-emerald-500" : "bg-primary")}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">{inv.paymentMethod || 'CASH PROTOCOL'}</p>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-base font-black italic text-foreground tabular-nums">{formatMoney(inv.totalAmount)} F</p>
                                            {debt > 0 && (
                                                <p className="text-[10px] font-bold text-red-500 tabular-nums">-{formatMoney(debt)} F</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => window.open(`/r/${inv.id}?print=true`, '_blank')}
                                            className="p-3.5 bg-card border border-border/50 rounded-xl active:scale-90 transition-all shadow-sm"
                                        >
                                            <Printer className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                        <button 
                                            onClick={() => window.open(`/r/${inv.id}`, '_blank')}
                                            className="p-3.5 bg-foreground text-background border border-foreground rounded-xl active:scale-90 transition-all shadow-lg"
                                        >
                                            <FileText className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            </div>
        </div>
    );
}
