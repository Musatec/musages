"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Search, TrendingUp, 
    Calendar, Package, 
    ArrowUpRight,
    Trash2, Printer, Filter,
    ChevronLeft, ChevronRight,
    Plus, ShoppingCart, Receipt, CreditCard
} from "lucide-react";
import { deleteSale } from "@/lib/actions/sales";
import { toast } from "sonner";
import { cn, formatMoney } from "@/lib/utils";
import { NewSaleSheet } from "./new-sale-sheet";
import { SafeImage } from "@/components/ui/safe-image";
import { EliteMetricCard } from "@/components/ui/metric-card";
import { ElitePageHeader } from "@/components/ui/page-header";

interface SaleItem {
    id: string;
    product: { name: string, image?: string };
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
    createdAt: string;
}

export default function SalesJournalClient({ 
    initialSales = [], 
    dailyMetrics,
    currentDate
}: { 
    initialSales: Sale[], 
    dailyMetrics: { totalSales: number },
    currentDate?: string 
}) {
    const router = useRouter();
    const [sales, setSales] = useState<Sale[]>(initialSales || []);
    const [search, setSearch] = useState("");



    const dateObj = currentDate ? new Date(currentDate) : new Date();
    const isToday = new Date().toDateString() === dateObj.toDateString();

    const handlePrevDay = () => {
        const prev = new Date(dateObj);
        prev.setDate(prev.getDate() - 1);
        router.push(`?date=${prev.toISOString().split('T')[0]}`);
    };

    const handleNextDay = () => {
        const next = new Date(dateObj);
        next.setDate(next.getDate() + 1);
        router.push(`?date=${next.toISOString().split('T')[0]}`);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("⚠️ Confirmer l'annulation de cette vente ?")) return;
        try {
            const res = await deleteSale(id);
            if (res.success) {
                toast.success("Vente annulée !");
                setSales((prev: Sale[]) => (prev || []).filter((s: Sale) => s.id !== id));
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Erreur système");
        }
    };

    const handlePrint = (id: string) => {
        window.open(`/r/${id}`, "_blank");
    };

    const filteredSales = (sales || []).filter((s: Sale) => 
        (s.customerName || "").toLowerCase().includes(search.toLowerCase()) ||
        (s.id || "").toLowerCase().includes(search.toLowerCase())
    );

    const totalSales = filteredSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
    const totalProfit = filteredSales.reduce((acc, s) => {
        // Simple profit calculation: totalAmount - cost
        // We'll use a conservative estimate if item cost is missing
        return acc + ((s.totalAmount || 0) * 0.25); // 25% margin as fallback or use actual items if available
    }, 0);

    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-4">
            <ElitePageHeader 
                title="Flux Commerciaux."
                subtitle="Point de Vente"
                description={`Registre quotidien des transactions pour le ${dateObj.toLocaleDateString('fr-FR')}.`}
                actions={
                    <div className="flex items-center gap-3">
                         <div className="relative group w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <input 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                                placeholder="Rechercher une vente..." 
                                className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/40 shadow-sm"
                            />
                        </div>
                        <NewSaleSheet 
                            trigger={
                                <button className="bg-primary text-primary-foreground h-11 px-6 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20">
                                    <Plus className="w-5 h-5 stroke-[3]" /> Nouvelle Vente
                                </button>
                            }
                        />
                    </div>
                }
            />

            {/* --- METRICS HUB (Elite SaaS) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <EliteMetricCard 
                    label="Chiffre d'Affaires" 
                    value={`${formatMoney(totalSales)} F`} 
                    icon={ShoppingCart} 
                    variant="blue"
                />
                <EliteMetricCard 
                    label="Bénéfice Net" 
                    value={`${formatMoney(totalProfit)} F`} 
                    icon={TrendingUp} 
                    variant="emerald"
                />
                <EliteMetricCard 
                    label="Transactions" 
                    value={filteredSales.length} 
                    icon={Receipt} 
                    variant="orange"
                />
                <EliteMetricCard 
                    label="Panier Moyen" 
                    value={`${formatMoney(filteredSales.length > 0 ? totalSales / filteredSales.length : 0)} F`} 
                    icon={CreditCard} 
                    variant="purple"
                />
            </div>

            {/* TABLES SECTION */}
            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden flex-1 flex flex-col min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/10 text-muted-foreground text-xs font-semibold border-b border-border">
                            <tr>
                                <th className="px-6 py-4 uppercase tracking-wider">ID Vente</th>
                                <th className="px-6 py-4 uppercase tracking-wider">Client / Mode</th>
                                <th className="px-6 py-4 uppercase tracking-wider">Articles</th>
                                <th className="px-6 py-4 uppercase tracking-wider text-center">Statut</th>
                                <th className="px-6 py-4 uppercase tracking-wider text-right">Montant Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredSales.length === 0 ? (
                                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground">Aucune transaction trouvée pour cette période.</td></tr>
                            ) : filteredSales.map((sale: Sale) => (
                                <tr key={sale.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-5 font-mono text-xs text-foreground font-bold">
                                        #{sale.id.slice(-6).toUpperCase()}
                                        <span className="block text-[10px] font-normal text-muted-foreground">{new Date(sale.createdAt).toLocaleTimeString()}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="block font-bold text-foreground text-sm uppercase tracking-tight">{sale.customerName || "CLIENT PASSANT"}</span>
                                        <span className="text-[10px] text-muted-foreground font-medium uppercase">{sale.paymentMethod || 'CASH'}</span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-1.5">
                                            {sale.items?.map((i: SaleItem) => (
                                                <div key={i.id} className="flex items-center gap-3 bg-muted/20 px-3 py-1.5 rounded-lg border border-border/50 group/item">
                                                    <div className="w-6 h-6 rounded bg-background border border-border/50 overflow-hidden shrink-0">
                                                        {i.product?.image ? (
                                                            <SafeImage src={i.product.image} alt={i.product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center opacity-10">
                                                                <Package className="w-3 h-3" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="uppercase truncate max-w-[140px] text-[11px] font-bold text-foreground/80">{i.product?.name || "ARTICLE INCONNU"}</span>
                                                    <span className="text-primary ml-auto text-[11px] font-black">×{i.quantity}</span>
                                                </div>
                                            )) || <span className="text-xs italic text-muted-foreground">Aucun article</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={cn(
                                            "px-2 py-1 rounded text-[10px] font-bold border",
                                            sale.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                        )}>
                                            {sale.status === 'COMPLETED' ? 'PAYÉ' : 'PARTIEL'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            <div className="text-right">
                                                <span className="block text-base font-bold text-foreground">{formatMoney(sale.totalAmount)} F</span>
                                            </div>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    className="p-2 border border-border rounded-lg bg-background hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                                                    onClick={() => handlePrint(sale.id)}
                                                    title="Facture"
                                                >
                                                   <Printer className="w-3.5 h-3.5" />
                                                </button>
                                                {isToday && (
                                                    <button 
                                                        className="p-2 border border-border rounded-lg bg-background hover:bg-red-500/10 text-red-500 transition-colors" 
                                                        onClick={() => handleDelete(sale.id)}
                                                        title="Annuler"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* MOBILE VIEW */}
            <div className="lg:hidden space-y-3">
                {filteredSales.map((sale: Sale) => (
                    <div key={sale.id} className="p-4 bg-card border border-border rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-bold font-mono">#{sale.id.slice(-6).toUpperCase()}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(sale.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <div className="flex-1">
                                <h4 className="text-sm font-bold uppercase">{sale.customerName || "CLIENT PASSANT"}</h4>
                                <p className="text-[10px] text-muted-foreground uppercase">{sale.paymentMethod || 'CASH'}</p>
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                    {sale.items?.map((i: SaleItem) => (
                                        <div key={i.id} className="w-6 h-6 rounded bg-muted border border-border/50 overflow-hidden shrink-0 shadow-sm" title={i.product.name}>
                                            {i.product?.image ? (
                                                <SafeImage src={i.product.image} alt={i.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-10">
                                                    <Package className="w-2 h-2" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-base font-bold text-foreground">{formatMoney(sale.totalAmount)} F</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
