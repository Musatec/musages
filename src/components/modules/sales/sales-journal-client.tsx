"use client";

import { useState } from "react";
import { 
    ArrowLeftRight, Search, TrendingUp, 
    Calendar, Package, DollarSign, 
    ArrowUpRight, ArrowDownRight, MoreVertical,
    FileText, Trash2, Printer, Filter, ChevronRight
} from "lucide-react";
import { deleteSale } from "@/lib/actions/sales";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SaleItem {
    id: string;
    product: { name: string };
    quantity: number;
    price: number;
}

interface Sale {
    id: string;
    customerName?: string;
    totalAmount: number;
    amountPaid: number;
    status: string;
    paymentMethod: string;
    items?: SaleItem[];
}

export default function SalesJournalClient({ initialSales = [], dailyMetrics }: { initialSales: Sale[], dailyMetrics: any }) {
    const [sales, setSales] = useState<Sale[]>(initialSales || []);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('fr-FR').format(amount || 0);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("⚠️ Annuler cette vente ? Les stocks seront remis à jour et l'argent retiré du journal.")) return;
        
        setLoading(true);
        try {
            const res = await deleteSale(id);
            if (res.success) {
                toast.success("Vente annulée avec succès ! ✨");
                setSales(prev => (prev || []).filter(s => s.id !== id));
            } else {
                toast.error(res.error);
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredSales = (sales || []).filter(s => 
        (s.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.id || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background text-foreground p-4 md:p-6 pb-20 font-sans transition-colors duration-500 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* --- COMPACT HEADER --- */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-border/50 pb-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                             <div className="w-6 h-0.5 bg-primary rounded-full" />
                             <span className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 leading-none italic">Commerce Journal Protocol</span>
                        </div>
                        <div className="space-y-0.5">
                            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase leading-none">
                                Journal des <span className="text-primary italic">Ventes</span>
                            </h1>
                            <p className="text-[9px] font-black opacity-10 tracking-[0.2em] uppercase italic">Operations Registry Alpha</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-1.5 bg-muted/20 border border-border/50 rounded-xl">
                         <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg shadow-sm">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Aujourd'hui</span>
                         </div>
                         <button className="p-2.5 bg-muted/30 hover:bg-primary hover:text-white rounded-lg transition-all active:scale-95 text-muted-foreground">
                            <Filter className="w-4 h-4" />
                         </button>
                    </div>
                </header>

                {/* --- COMPACT DAILY METRICS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-primary">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em]">Chiffre d'Affaire</p>
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <h2 className="text-3xl font-black text-foreground italic tracking-tighter leading-none">
                                {formatMoney(dailyMetrics?.totalSales || 0)} <span className="text-sm opacity-20 italic ml-1">F</span>
                            </h2>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Encaissé Aujourd'hui</p>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative overflow-hidden group">
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-amber-500">
                                <p className="text-[9px] font-black uppercase tracking-[0.3em]">Volume Ventes</p>
                                <Package className="w-4 h-4" />
                            </div>
                            <h2 className="text-3xl font-black text-foreground tracking-tighter italic leading-none">
                                {(sales || []).length} <span className="text-sm opacity-20 italic ml-1 uppercase">Factures</span>
                            </h2>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Transactions Validées</p>
                        </div>
                    </div>

                    <div className="bg-muted/10 border border-border rounded-2xl p-6 flex flex-col justify-between">
                         <div className="space-y-2">
                             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">Performance Jour</p>
                             <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: '65%' }} />
                             </div>
                         </div>
                         <div className="flex items-end justify-between mt-2">
                            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none">65% de l'objectif</span>
                            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                         </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Registre des Opérations</p>
                        <h3 className="text-[11px] font-black text-foreground italic uppercase tracking-[0.1em]">{filteredSales.length} Transactions détectées</h3>
                    </div>
                    <div className="relative group w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-primary transition-all" />
                        <input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="RECHERCHER CLIENT OU #INV..."
                            className="w-full bg-card border border-border rounded-xl py-3.5 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-primary/40 outline-none transition-all placeholder:text-muted-foreground/20"
                        />
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                            <thead>
                                <tr className="border-b border-muted/10 text-muted-foreground uppercase opacity-40 bg-muted/5">
                                    <th className="px-6 py-4 text-[8px] font-black tracking-widest italic">Facture ID / Client</th>
                                    <th className="px-6 py-4 text-[8px] font-black tracking-widest italic">Détails Panier</th>
                                    <th className="px-6 py-4 text-[8px] font-black tracking-widest italic">Montant Total</th>
                                    <th className="px-6 py-4 text-[8px] font-black tracking-widest italic">Payé / Statut</th>
                                    <th className="px-6 py-4 text-[8px] font-black tracking-widest italic text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSales.length === 0 ? (
                                    <tr><td colSpan={5} className="py-20 text-center font-black text-muted-foreground opacity-20 italic uppercase tracking-[0.4em]">Journal vierge ✨🛒</td></tr>
                                ) : filteredSales.map((sale: Sale) => (
                                    <tr key={sale.id} className="group hover:bg-muted/5 transition-all border-b border-muted/5 last:border-0 relative">
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-[11px] font-black uppercase tracking-tight text-foreground italic leading-none">{sale.customerName || "CLIENT PASSANT"}</span>
                                                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-20">#MDS-{sale.id.slice(-6).toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-md bg-muted/20 flex items-center justify-center border border-border/30 group-hover:bg-primary group-hover:text-white transition-all text-muted-foreground/40 font-black text-[9px]">
                                                    {sale.items?.length || 0}
                                                </div>
                                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest italic truncate max-w-[120px]">
                                                    {sale.items?.map((i: SaleItem) => i.product.name).join(", ") || "Détails indisponibles"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 font-black text-[11px] italic">{formatMoney(sale.totalAmount)} <span className="opacity-20 ml-1">F</span></td>
                                        <td className="px-6 py-3">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-md text-[7px] font-bold uppercase tracking-widest border",
                                                    sale.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm italic" : "bg-amber-500/10 text-amber-500 border-amber-500/20 italic"
                                                )}>
                                                    {sale.status === 'COMPLETED' ? 'SOLDE' : 'PARTIEL'}
                                                </span>
                                                <span className="text-[8px] font-bold text-muted-foreground opacity-20 italic">{formatMoney(sale.amountPaid)} F Reçus</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                                <button className="p-2 bg-background border border-border/30 hover:bg-muted rounded-md transition-all text-muted-foreground hover:text-foreground">
                                                    <Printer className="w-3 h-3" />
                                                </button>
                                                <button onClick={() => handleDelete(sale.id)} className="p-2 bg-red-500/5 text-red-500 border border-red-500/10 rounded-md hover:bg-red-500 hover:text-white transition-all">
                                                    <Trash2 className="w-3 h-3" />
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
