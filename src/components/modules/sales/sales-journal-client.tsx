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
                    <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                         <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-sm shrink-0">
                            <button onClick={handlePrevDay} className="p-2 hover:bg-muted rounded-lg transition-colors">
                                <ChevronLeft className="w-5 h-5 text-muted-foreground hover:text-primary" />
                            </button>
                            <div className="px-4 flex flex-col items-center min-w-[120px]">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">Journal</span>
                                <span className="text-xs font-bold italic">{dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                            </div>
                            <button 
                                onClick={handleNextDay} 
                                className={cn("p-2 hover:bg-muted rounded-lg transition-colors", isToday && "opacity-10 pointer-events-none")} 
                                disabled={isToday}
                            >
                                <ChevronRight className="w-5 h-5 text-muted-foreground hover:text-primary" />
                            </button>
                        </div>

                        <div className="relative group flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <input 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                                placeholder="Rechercher..." 
                                className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/40 shadow-sm"
                            />
                        </div>

                        <NewSaleSheet 
                            trigger={
                                <button className="bg-primary text-primary-foreground h-11 px-6 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/20">
                                    <Plus className="w-4 h-4 stroke-[3]" /> <span className="hidden sm:inline">Nouvelle Vente</span>
                                </button>
                            }
                        />
                    </div>
                }
            />

            {/* --- METRICS HUB (Elite SaaS) --- */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <EliteMetricCard 
                    label="CA Global" 
                    value={`${formatMoney(totalSales)} F`} 
                    icon={ShoppingCart} 
                    variant="blue"
                    sub="Total Ventes"
                />
                <EliteMetricCard 
                    label="Bénéfice" 
                    value={`${formatMoney(totalProfit)} F`} 
                    icon={TrendingUp} 
                    variant="emerald"
                    sub="Marge Estimée"
                />
                <EliteMetricCard 
                    label="Volume" 
                    value={filteredSales.length} 
                    icon={Receipt} 
                    variant="orange"
                    sub="Nombre Tickets"
                />
                <EliteMetricCard 
                    label="Panier Moyen" 
                    value={`${formatMoney(filteredSales.length > 0 ? totalSales / filteredSales.length : 0)} F`} 
                    icon={CreditCard} 
                    variant="purple"
                    sub="Valeur Moyenne"
                />
            </div>

            {/* TABLES SECTION */}
            <div className="bg-card border border-border shadow-sm rounded-[2rem] overflow-hidden flex-1 flex flex-col min-h-[400px]">
                {/* Desktop View */}
                <div className="hidden lg:block overflow-x-auto">
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

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-border/20">
                    {filteredSales.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground italic">Aucune transaction ce jour.</div>
                    ) : filteredSales.map((sale: Sale) => (
                        <div key={sale.id} className="p-5 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black italic text-primary font-mono">#{sale.id.slice(-6).toUpperCase()}</span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[8px] font-black uppercase border",
                                            sale.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                                        )}>
                                            {sale.status === 'COMPLETED' ? 'PAYÉ' : 'PARTIEL'}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-black uppercase tracking-tight text-foreground italic">{sale.customerName || "CLIENT PASSANT"}</h4>
                                </div>
                                <span className="text-xs font-bold text-muted-foreground font-mono">{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                                {sale.items?.map((i: SaleItem) => (
                                    <div key={i.id} className="relative group shrink-0">
                                        <div className="w-10 h-10 rounded-lg bg-muted border border-border overflow-hidden shadow-sm">
                                            {i.product?.image ? (
                                                <SafeImage src={i.product.image} alt={i.product.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-10">
                                                    <Package className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                        <span className="absolute -top-1 -right-1 bg-primary text-black text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md border border-background">
                                            {i.quantity}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border/40">
                                <div className="space-y-0.5">
                                    <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">{sale.paymentMethod || 'CASH'}</p>
                                    <p className="text-base font-black italic text-foreground">{formatMoney(sale.totalAmount)} F</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handlePrint(sale.id)} className="p-3 bg-muted/20 border border-border rounded-xl active:scale-90 transition-all">
                                        <Printer className="w-4 h-4" />
                                    </button>
                                    {isToday && (
                                        <button onClick={() => handleDelete(sale.id)} className="p-3 bg-red-500/5 text-red-500 border border-red-500/10 rounded-xl active:scale-90 transition-all">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
