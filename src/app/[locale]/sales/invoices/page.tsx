"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
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

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('fr-FR').format(amount);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-8 text-foreground">
            {loading && <TopLoader />}

            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border/50">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Facturation & Devis</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Gérez vos factures clients, suivez les encaissements et les impayés.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher #INV / Client..."
                            className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/40 shadow-sm"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-bold hover:bg-muted transition-colors shadow-sm">
                         <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                         <span className="hidden sm:inline">Exporter CSV</span>
                    </button>
                </div>
            </header>

            {/* --- METRICS GRID --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Facturation Totale", value: data?.metrics?.totalBilled || 0, icon: TrendingUp, color: "text-primary", sub: "Montant brut facturé" },
                    { label: "Restant à Percevoir", value: data?.metrics?.totalOutstanding || 0, icon: ShieldAlert, color: "text-red-500", sub: "Créances actives" },
                    { label: "Taux de Recouvrement", value: data?.metrics?.recoveryRate || 0, icon: CheckCircle2, color: "text-emerald-500", sub: "Paiements validés", suffix: "%" },
                    { label: "Volume Factures", value: data?.invoices?.length || 0, icon: FileText, color: "text-muted-foreground", sub: "Transactions enregistrées" }
                ].map((m, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={cn("p-2 rounded-lg bg-muted/50 border border-border shadow-sm", m.color)}>
                                <m.icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">{m.label}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">
                            {formatMoney(m.value)} <span className="text-xs font-medium ml-1 text-muted-foreground/40">{m.suffix || ' FCFA'}</span>
                        </h2>
                        <p className="text-[11px] text-muted-foreground mt-1 opacity-60 uppercase font-semibold">{m.sub}</p>
                    </div>
                ))}
            </div>

            {/* --- FILTERS PROTOCOL --- */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: "ALL", label: "Toutes les Factures" },
                    { id: "COMPLETED", label: "Payées" },
                    { id: "PARTIAL", label: "Dettes Partielles" },
                    { id: "UNPAID", label: "Impayées" }
                ].map(f => (
                    <button 
                        key={f.id}
                        onClick={() => setStatusFilter(f.id)}
                        className={cn(
                            "px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm border",
                            statusFilter === f.id 
                                ? "bg-primary text-primary-foreground border-transparent shadow-primary/20 scale-105" 
                                : "bg-card border-border text-muted-foreground hover:bg-muted"
                        )}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* --- INVOICES TABLE --- */}
            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden flex-1 flex flex-col min-h-[500px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-0">
                        <thead className="bg-muted/10 text-muted-foreground text-xs font-semibold border-b border-border">
                            <tr>
                                <th className="px-6 py-4 uppercase tracking-wider">Identifiant / Date</th>
                                <th className="px-6 py-4 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-4 uppercase tracking-wider">Montant Net</th>
                                <th className="px-6 py-4 uppercase tracking-wider">Progression</th>
                                <th className="px-6 py-4 uppercase tracking-wider text-right">Reste à payer</th>
                                <th className="px-6 py-4 text-right px-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                Array(6).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-6"><div className="h-10 bg-muted/30 rounded-lg w-full" /></td>
                                    </tr>
                                ))
                            ) : data?.invoices?.length === 0 ? (
                                <tr><td colSpan={6} className="py-20 text-center text-muted-foreground italic">Aucune donnée de facturation identifiée.</td></tr>
                            ) : data?.invoices?.map((inv: any) => {
                                const debt = inv.totalAmount - inv.amountPaid;
                                const progress = Math.round((inv.amountPaid / inv.totalAmount) * 100);

                                return (
                                    <tr key={inv.id} className="group hover:bg-muted/20 transition-all">
                                        <td className="px-6 py-5">
                                            <span className="block text-xs font-bold text-foreground mb-0.5">#INV-{inv.id.slice(-8).toUpperCase()}</span>
                                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase font-mono">
                                                <Clock className="w-3 h-3" /> {new Date(inv.createdAt).toLocaleDateString('fr-FR')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="block font-bold text-foreground text-sm uppercase tracking-tight">{inv.customerName || "CLIENT PASSANT"}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase">{inv.paymentMethod}</span>
                                        </td>
                                        <td className="px-6 py-5 font-bold text-foreground text-sm">
                                            {formatMoney(inv.totalAmount)} F
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5 w-32">
                                                <div className="w-full h-1 bg-muted/40 rounded-full overflow-hidden">
                                                     <div 
                                                        className={cn("h-full transition-all duration-1000", debt > 0 ? "bg-amber-500" : "bg-emerald-500")}
                                                        style={{ width: `${progress}%` }} 
                                                     />
                                                </div>
                                                <span className={cn("text-[9px] font-bold uppercase tracking-tight opacity-40", debt > 0 ? "text-amber-600" : "text-emerald-600")}>
                                                    {progress}% Validé
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right font-bold text-sm">
                                            <span className={cn(debt > 0 ? "text-red-500" : "text-emerald-500/30")}>
                                                {debt > 0 ? formatMoney(debt) + " F" : "SOLDÉ"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right px-10">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <button 
                                                    onClick={() => window.open(`/r/${inv.id}?print=true`, '_blank')} 
                                                    className="p-2 border border-border rounded-lg bg-card hover:bg-muted text-muted-foreground hover:text-primary transition-colors shadow-sm"
                                                    title="Imprimer"
                                                >
                                                    <Printer className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const url = `${window.location.origin}/r/${inv.id}`;
                                                        const subject = `Facture #INV-${inv.id.slice(-8).toUpperCase()}`;
                                                        const body = `Bonjour ${inv.customerName || ''},\n\nVoici le lien vers votre facture : ${url}`;
                                                        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                                    }}
                                                    className="p-2 border border-border rounded-lg bg-card hover:bg-muted text-muted-foreground hover:text-indigo-500 transition-colors shadow-sm"
                                                    title="Envoyer Email"
                                                >
                                                    <Mail className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => window.open(`/r/${inv.id}`, '_blank')}
                                                    className="p-2.5 bg-primary text-primary-foreground rounded-lg transition-all shadow-sm hover:bg-primary/90"
                                                    title="Ouvrir"
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
            </div>
        </div>
    );
}
