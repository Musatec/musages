"use client";

import { useState, useMemo } from "react";
import { 
    Search, Plus, Package, AlertTriangle, 
    Trash2, Coins, Loader2, Sparkles,
    BoxIcon, RefreshCw, Filter, MoreHorizontal
} from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";
import { toast } from "sonner";
import { SafeImage } from "@/components/ui/safe-image";
import { ImageUpload } from "@/components/ui/image-upload";
import { EliteMetricCard } from "@/components/ui/metric-card";
import { ElitePageHeader } from "@/components/ui/page-header";
import { createProduct, updateStock, deleteProduct } from "@/lib/actions/inventory";
import { 
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger 
} from "@/components/ui/sheet";

import { Product, ProductFormData } from "@/types/inventory";

import { ImportModal } from "./import-modal";

export function InventoryManager({ initialProducts }: { initialProducts: Product[] }) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [search, setSearch] = useState("");
    const [openAdd, setOpenAdd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ProductFormData>({ name: "", price: "", costPrice: "", stock: "0", minStock: "5", category: "", sku: "", image: "" });

    const filteredProducts = useMemo(() => {
        return products.filter(p => 
            p.name.toLowerCase().includes(search.toLowerCase()) || 
            (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
        );
    }, [products, search]);

    const metrics = useMemo(() => {
        const totalValue = products.reduce((acc, p) => {
            const price = Number(p.costPrice) || 0;
            const stock = Number(p.stock) || 0;
            return acc + (stock * price);
        }, 0);
        const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= (p.minStock || 5)).length;
        const outOfStockCount = products.filter(p => p.stock === 0).length;
        return { totalValue, lowStockCount, outOfStockCount };
    }, [products]);

    const handleQuickStock = async (pId: string, name: string) => {
        const amount = prompt(`Approvisionnement pour : ${name}\nSaisissez la quantité reçue :`);
        if (!amount || isNaN(Number(amount))) return;
        setLoading(true);
        try {
            const res = await updateStock({ productId: pId, amount: Number(amount), reason: "Réapprovisionnement manuel" });
            if (res.success) {
                toast.success(`Quantité mise à jour !`);
                setProducts(prev => prev.map(p => p.id === pId ? { ...p, stock: p.stock + Number(amount) } : p));
            } else toast.error(res.error);
        } finally { setLoading(false); }
    };

    const handleDelete = async (pId: string, name: string) => {
        if (!confirm(`Supprimer définitivement "${name}" de l'inventaire ?`)) return;
        try {
            const res = await deleteProduct(pId);
            if (res.success) {
                toast.success("Produit supprimé !");
                setProducts(prev => prev.filter(p => p.id !== pId));
            } else toast.error(res.error);
        } catch { toast.error("Une erreur est survenue."); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const result = await createProduct({ ...formData, price: Number(formData.price), costPrice: Number(formData.costPrice), stock: Number(formData.stock), minStock: Number(formData.minStock) });
        if (result.success) {
            toast.success("Nouveau produit enregistré !");
            // @ts-expect-error type expected from server
            setProducts([result.product, ...products]);
            setOpenAdd(false);
            setFormData({ name: "", price: "", costPrice: "", stock: "0", minStock: "5", category: "", sku: "", image: "" });
        } else toast.error(result.error);
        setLoading(false);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-4">
            <div className="max-w-[1600px] mx-auto w-full space-y-4">
                
                <ElitePageHeader 
                title="Logistique & Stocks."
                subtitle="Entrepôt Central"
                description="Supervisez vos actifs, gérez les alertes de rupture et optimisez vos niveaux de stock en temps réel."
                actions={
                    <div className="flex items-center gap-3">
                        <div className="relative group w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <input 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher un article..." 
                                className="w-full bg-card border border-border rounded-xl py-2 pl-10 pr-4 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-sm"
                            />
                        </div>
                        <ImportModal />
                        <Sheet open={openAdd} onOpenChange={setOpenAdd}>
                            <SheetTrigger asChild>
                                <button className="h-10 px-6 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                                    <Plus className="w-4 h-4" /> Nouveau Produit
                                </button>
                            </SheetTrigger>
                            <SheetContent className="sm:max-w-md bg-card border-l border-border p-8 flex flex-col shadow-2xl">
                                <SheetHeader className="mb-8 text-left">
                                    <SheetTitle className="text-2xl font-bold">Nouveau Produit</SheetTitle>
                                    <p className="text-sm text-muted-foreground mt-1">Remplissez les informations de base pour enregistrer l'article.</p>
                                </SheetHeader>
                                <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-2">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground ml-1">Dégnisation de l'article</label>
                                        <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-muted/30 border-border border rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none" placeholder="Ex: Montre de luxe..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                         <div className="space-y-1">
                                            <label className="text-xs font-semibold text-muted-foreground ml-1">Prix Achat (F)</label>
                                            <input required type="number" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} className="w-full bg-muted/30 border-border border rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none" placeholder="0" />
                                         </div>
                                         <div className="space-y-1">
                                            <label className="text-xs font-semibold text-primary ml-1">Prix Vente (F)</label>
                                            <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-primary/5 border-primary/20 border rounded-xl px-4 py-3 text-sm font-bold text-primary focus:ring-1 focus:ring-primary/20 outline-none" placeholder="0" />
                                         </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                         <div className="space-y-1">
                                            <label className="text-xs font-semibold text-muted-foreground ml-1">Stock Initial</label>
                                            <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-muted/30 border-border border rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none" />
                                         </div>
                                         <div className="space-y-1">
                                            <label className="text-xs font-semibold text-red-500/80 ml-1">Alerte Seuil</label>
                                            <input required type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} className="w-full bg-red-500/5 border-red-500/20 border rounded-xl px-4 py-3 text-sm font-bold text-red-500 outline-none" />
                                         </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-muted-foreground ml-1">Photo du produit</label>
                                        <ImageUpload 
                                           value={formData.image} 
                                           onChange={(url) => setFormData({...formData, image: url})} 
                                        />
                                    </div>
                                    <button disabled={loading} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/10 active:scale-95 transition-all flex items-center justify-center gap-3">
                                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Enregistrer le produit"}
                                    </button>
                                </form>
                            </SheetContent>
                        </Sheet>
                    </div>
                }
            />

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    <EliteMetricCard 
                        label="Valeur du Stock" 
                        value={`${formatMoney(metrics.totalValue)} F`} 
                        icon={Coins} 
                        variant="blue" 
                    />
                    <EliteMetricCard 
                        label="Alertes Seuil" 
                        value={metrics.lowStockCount} 
                        icon={AlertTriangle} 
                        variant="amber" 
                    />
                    <EliteMetricCard 
                        label="Ruptures" 
                        value={metrics.outOfStockCount} 
                        icon={Package} 
                        variant="red" 
                    />
                    <EliteMetricCard 
                        label="Disponibilité" 
                        value={`${products.length > 0 ? Math.round(((products.length - metrics.outOfStockCount) / products.length) * 100) : 100}%`} 
                        icon={RefreshCw} 
                        variant="emerald" 
                    />
                </div>

                {/* --- REGISTRE EXCEL PRO D'INVENTAIRE --- */}
                <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden print:border-none print:shadow-none">
                    {/* Barre de Titre Feuille Excel */}
                    <div className="bg-[#f1f3f5] dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs select-none">
                        <div className="flex items-center gap-2">
                            <span className="bg-[#107c41] text-white px-2 py-0.5 rounded font-black text-[10px] tracking-wider uppercase flex items-center gap-1 shadow-sm">
                                <span>XLSX</span>
                            </span>
                            <span className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                                Feuille : Inventaire & Approvisionnement Entrepôt
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {filteredProducts.length} {filteredProducts.length > 1 ? "articles" : "article"}
                            </span>
                        </div>
                    </div>

                    {/* Grille Excel */}
                    <div className="w-full overflow-x-auto touch-pan-x">
                        <table className="w-full min-w-[700px] border-collapse text-left text-xs">
                            <thead>
                                <tr className="bg-[#107c41] text-white select-none">
                                    <th className="w-12 text-center px-2 py-2 text-[10px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50">N°</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[180px]">Article / Fourniture</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[90px] text-center">Réf</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[120px]">Catégorie</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[90px] text-center">Stock</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 min-w-[90px] text-center">Statut</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-r border-b border-emerald-600/50 text-right min-w-[110px]">Prix Vente</th>
                                    <th className="px-3 py-2 text-[11px] font-black uppercase tracking-wider border-b border-emerald-600/50 text-center w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="py-10 text-center text-muted-foreground border-b border-slate-200 dark:border-slate-700/80 italic bg-white dark:bg-slate-900">
                                            Aucun produit trouvé dans l'inventaire.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((p, idx) => {
                                        const isLow = p.stock <= (p.minStock || 5);
                                        const isOut = p.stock === 0;
                                        return (
                                            <tr 
                                                key={p.id} 
                                                className={cn(
                                                    "transition-colors hover:bg-[#e8f4fc] dark:hover:bg-slate-800/80",
                                                    idx % 2 === 1 ? "bg-[#f8fafc] dark:bg-slate-900/60" : "bg-white dark:bg-slate-900"
                                                )}
                                            >
                                                <td className="w-12 text-center bg-[#f1f3f5] dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px] font-bold border-r border-b border-slate-200 dark:border-slate-700/80 select-none">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-3 py-2 font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                                                    <div className="flex items-center gap-2">
                                                        {p.image ? (
                                                            <div className="w-7 h-7 rounded border border-slate-200 overflow-hidden shrink-0">
                                                                <SafeImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <Package className="w-4 h-4 text-slate-400 shrink-0" />
                                                        )}
                                                        <span className="truncate">{p.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2 text-center font-mono font-bold text-muted-foreground text-[10px] border-r border-b border-slate-200 dark:border-slate-700/80">
                                                    {p.id.slice(-6).toUpperCase()}
                                                </td>
                                                <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium border-r border-b border-slate-200 dark:border-slate-700/80">
                                                    {p.category || "Standard"}
                                                </td>
                                                <td className="px-3 py-2 text-center font-mono font-bold text-sm border-r border-b border-slate-200 dark:border-slate-700/80">
                                                    <span className={cn(isOut ? "text-red-600 dark:text-red-400" : isLow ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-slate-100")}>
                                                        {p.stock}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-center border-r border-b border-slate-200 dark:border-slate-700/80">
                                                    <span className={cn(
                                                        "inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase border",
                                                        isOut ? "bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300" : 
                                                        isLow ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300" : 
                                                        "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                                                    )}>
                                                        {isOut ? "Rupture" : isLow ? "Seuil" : "OK"}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 dark:text-slate-100 border-r border-b border-slate-200 dark:border-slate-700/80">
                                                    {formatMoney(Number(p.price))} F
                                                </td>
                                                <td className="px-3 py-2 text-center border-b border-slate-200 dark:border-slate-700/80">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button 
                                                            onClick={() => handleQuickStock(p.id, p.name)} 
                                                            className="px-2 py-0.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded border border-emerald-200 text-[10px] font-bold transition-all" 
                                                            title="Réapprovisionner"
                                                        >
                                                            + Stock
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(p.id, p.name)} 
                                                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all" 
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
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
                            <span>Affichage : {filteredProducts.length} articles</span>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                            <span>Valeur globale du stock : <strong>{formatMoney(metrics.totalValue)} FCFA</strong></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
