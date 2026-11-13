"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { cn, formatMoney } from "@/lib/utils";
import { 
    FileText, Printer, Mail, Search, 
    TrendingUp, AlertCircle, CheckCircle2, 
    ArrowUpRight, Clock, Filter, MoreVertical,
    FileSpreadsheet, ShieldAlert, Trash2
} from "lucide-react";
import { getInvoices } from "@/lib/actions/invoices";
import { TopLoader } from "@/components/ui/top-loader";
import { toast } from "sonner";
import { EliteMetricCard } from "@/components/ui/metric-card";
import { ElitePageHeader } from "@/components/ui/page-header";

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
    status: string;
    paymentMethod: string;
    createdAt: string;
    items?: InvoiceItem[];
}

export default function InvoicesPage() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{ invoices: Invoice[], metrics: any } | null>(null);
    const [unavailable, setUnavailable] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getInvoices({ search, status: statusFilter as any });
            if (!res.success) {
                setData(null);
                setUnavailable(res.error || "Le registre des factures n'est pas disponible.");
                return;
            }
            setData(res as any);
            setUnavailable(null);
        } catch {
            setData(null);
            setUnavailable("Impossible de charger le registre des factures.");
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading && !data && !unavailable) {
        return <div className="p-8"><TopLoader /><p className="text-sm text-muted-foreground">Chargement du registre…</p></div>;
    }

    if (unavailable) {
        return (
            <div className="space-y-6 pb-20">
                <div className="max-w-[1500px] mx-auto space-y-6">
                    <ElitePageHeader
                        title="Facturation & Trésorerie."
                        subtitle="Gestion des flux"
                        description="Registre des factures indisponible."
                    />
                    <div role="status" className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-sm text-muted-foreground">
                        {unavailable}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {loading && <TopLoader />}

            <div className="max-w-[1500px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                <ElitePageHeader 
                    title="Facturation & Trésorerie."
                    subtitle="Gestion des Flux"
                    description="Supervisez l'ensemble de vos documents commerciaux, analysez les créances et gérez les flux de trésorerie historiques."
                    actions={
                        <button className="flex items-center gap-3 px-6 py-3 bg-muted/20 border border-border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-muted/40 transition-all w-full md:w-auto">
                             <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                             Export Excel
                        </button>
                    }
                />
                {/* --- METRICS GRID (Elite SaaS) --- */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <EliteMetricCard 
                        label="Dettes Totales" 
                        value={`${formatMoney(data?.metrics?.totalOutstanding || 0)} F`} 
                        icon={ShieldAlert} 
                        variant="red"
                        sub="Balance à recouvrer"
                    />
                    <EliteMetricCard 
                        label="Facturation Totale" 
                        value={`${formatMoney(data?.metrics?.totalBilled || 0)} F`} 
                        icon={TrendingUp} 
                        variant="blue"
                        sub="Volumes historiques"
                    />
                    <EliteMetricCard 
                        label="Taux Recouvrement" 
                        value={`${data?.metrics?.recoveryRate || 0}%`} 
                        icon={CheckCircle2} 
                        variant="emerald"
                        sub="Performance de paie"
                    />
                    <EliteMetricCard 
                        label="Total Factures" 
                        value={data?.metrics?.invoiceCount || 0} 
                        icon={FileText} 
                        variant="purple"
                        sub="Documents générés"
                    />
                </div>

                {/* --- INVOICE LEDGER: HIGH-DENSITY TABLE --- */}
                <div className="bg-card border border-border/50 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex-1 flex flex-col min-h-[400px] md:min-h-[600px]">
                     {/* --- FILTERS & SEARCH --- */}
                <div className="flex flex-col md:flex-row gap-4 p-4 md:p-8 border-b border-border/30 bg-muted/5 items-stretch md:items-center">
                    <div className="hidden md:block relative group flex-1 md:max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 group-focus-within:text-primary transition-all" />
                        <input 
                            placeholder="RECHERCHER..." 
                            className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3.5 text-xs font-black uppercase tracking-[0.1em] outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/20 shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                     </div>
                     <div className="flex items-center gap-1.5 bg-muted/20 p-1 rounded-xl border border-border/10 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-1">
                        {['ALL', 'COMPLETED', 'PARTIAL', 'UNPAID'].map((status) => (
                            <button 
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "px-4 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    statusFilter === status 
                                        ? "bg-primary text-black shadow-lg shadow-primary/20" 
                                        : "text-muted-foreground/40 hover:bg-muted/30"
                                )}
                            >
                                {status.replace("COMPLETED", "PAYÉ").replace("UNPAID", "IMPAYÉ").replace("PARTIAL", "DETTE").replace("ALL", "TOUT")}
                            </button>
                        ))}
                     </div>
                </div>

                     {/* --- REGISTRE EXCEL PRO DE FACTURATION --- */}
                     <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none">
                        {/* Barre de Titre Feuille Excel */}
                        <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs select-none">
                            <div className="flex items-center gap-2">
                                <span className="bg-[#107c41] text-white px-2 py-0.5 rounded font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
                                    <span>XLSX</span>
                                </span>
                                <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                                    Feuille : Grand Livre de Facturation & Créances
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    {data?.invoices?.length || 0} factures
                                </span>
                            </div>
                        </div>

                        {/* Grille Excel */}
                        <div className="w-full overflow-x-auto touch-pan-x">
                            <table className="w-full min-w-[750px] border-collapse text-left text-xs">
                                <thead>
                                    <tr className="bg-[#107c41] text-white select-none">
                                        <th className="w-12 text-center px-2 py-2 text-[10px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50">N°</th>
                                        <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[100px] text-center">Réf Facture</th>
                                        <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[100px] text-center">Date</th>
                                        <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[180px]">Client / Destinataire</th>
                                        <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 text-right min-w-[120px]">Total Facturé</th>
                                        <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 text-right min-w-[120px]">Reste Dû</th>
                                        <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 text-center min-w-[110px]">Statut</th>
                                        <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-b border-emerald-600/50 text-center w-24">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {!data?.invoices || data.invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-10 text-center text-muted-foreground border-b border-slate-200 dark:border-slate-700/80 italic bg-white dark:bg-slate-900">
                                                Aucune facture enregistrée.
                                            </td>
                                        </tr>
                                    ) : (
                                        data.invoices.map((inv, idx) => {
                                            const remaining = inv.totalAmount - inv.amountPaid;
                                            return (
                                                <tr 
                                                    key={inv.id} 
                                                    className={cn(
                                                        "transition-colors hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                                                        idx % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-900/60" : "bg-white dark:bg-slate-900"
                                                    )}
                                                >
                                                    <td className="w-12 text-center bg-[#f1f3f5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold border-r border-b border-slate-200 dark:border-slate-700/80 select-none">
                                                        {idx + 1}
                                                    </td>
                                                    <td className="px-3 py-2 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs border-r border-b border-slate-200 dark:border-slate-700/80">
                                                        #{inv.id.slice(-6).toUpperCase()}
                                                    </td>
                                                    <td className="px-3 py-2 text-center font-mono text-xs text-slate-600 dark:text-slate-400 border-r border-b border-slate-200 dark:border-slate-700/80">
                                                        {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                                                    </td>
                                                    <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                                                        {inv.customerName || "CLIENT PASSANT"}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                                                        {formatMoney(inv.totalAmount)} F
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-mono font-bold border-r border-b border-slate-200 dark:border-slate-700/80">
                                                        <span className={remaining > 0 ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}>
                                                            {formatMoney(remaining)} F
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                                                        <span className={cn(
                                                            "inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase border",
                                                            inv.status === 'COMPLETED' ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300" : 
                                                            inv.status === 'PARTIAL' ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300" : 
                                                            "bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300"
                                                        )}>
                                                            {inv.status === 'COMPLETED' ? "Payé" : inv.status === 'PARTIAL' ? "Acompte" : "Impayé"}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2 text-center border-b border-slate-200 dark:border-slate-700/80">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all" title="Imprimer">
                                                                <Printer className="w-3.5 h-3.5 text-slate-500" />
                                                            </button>
                                                            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-all" title="Email">
                                                                <Mail className="w-3.5 h-3.5 text-slate-500" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Barre d'état Excel */}
                        <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium select-none">
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-emerald-800 dark:text-emerald-400">PRÊT</span>
                                <span>•</span>
                                <span>Affichage : {data?.invoices?.length || 0} factures</span>
                            </div>
                            <div className="flex items-center gap-4 font-mono">
                                <span>Total facturé : <strong>{formatMoney(data?.invoices?.reduce((acc, i) => acc + (i.totalAmount || 0), 0) || 0)} F</strong></span>
                                <span>Total restant dû : <strong className="text-amber-600 dark:text-amber-400">{formatMoney(data?.invoices?.reduce((acc, i) => acc + (i.totalAmount - i.amountPaid), 0) || 0)} F</strong></span>
                            </div>
                        </div>
                     </div>

                </div>
            </div>
        </div>
    );
}
