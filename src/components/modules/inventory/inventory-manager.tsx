"use client";

import { useState, useMemo } from "react";
import { 
    Search, Plus, Package, AlertTriangle, 
    Trash2, Coins, Loader2, Sparkles,
    BoxIcon, RefreshCw, Filter, MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SafeImage } from "@/components/ui/safe-image";
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
        const totalValue = products.reduce((acc, p) => acc + (p.stock * (p.costPrice || 0)), 0);
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

    const formatMoney = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount);

    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-8">
            <div className="max-w-[1600px] mx-auto w-full space-y-8">
                
                {/* --- PROFESSIONAL HEADER --- */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50 text-foreground">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestion de l'Inventaire</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {products.length} articles répertoriés dans votre logistique.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <input 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                                placeholder="Rechercher un article..." 
                                className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/40 shadow-sm"
                            />
                        </div>

                        <ImportModal />

                        <Sheet open={openAdd} onOpenChange={setOpenAdd}>
                            <SheetTrigger asChild>
                                <button className="bg-primary text-primary-foreground h-10 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/10">
                                    <Plus className="w-4 h-4" /> Ajouter
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
                                        <label className="text-xs font-semibold text-muted-foreground ml-1">Lien de la photo (URL)</label>
                                        <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-muted/30 border-border border rounded-xl px-4 py-3 text-sm font-medium focus:ring-1 focus:ring-primary/20 outline-none" placeholder="https://..." />
                                    </div>
                                    <button disabled={loading} className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/10 active:scale-95 transition-all flex items-center justify-center gap-3">
                                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Enregistrer le produit"}
                                    </button>
                                </form>
                            </SheetContent>
                        </Sheet>
                    </div>
                </header>

                {/* --- METRICS GRID --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Valeur du Stock", value: metrics.totalValue, icon: Coins, color: "text-primary", sub: "Au prix d'achat" },
                        { label: "Alertes Seuil", value: metrics.lowStockCount, icon: AlertTriangle, color: "text-amber-500", sub: "À réapprovisionner" },
                        { label: "Ruptures", value: metrics.outOfStockCount, icon: BoxIcon, color: "text-red-500", sub: "En attente" },
                        { label: "Indice Disponibilité", value: "98%", icon: RefreshCw, color: "text-emerald-500", sub: "Taux de service" }
                    ].map((m, i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-5 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={cn("p-2 rounded-lg bg-muted/50 border border-border shadow-sm", m.color)}>
                                    <m.icon className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{m.label}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">
                                {typeof m.value === 'number' && i === 0 ? formatMoney(m.value) : m.value} 
                                <span className="text-xs font-medium ml-1">{i === 0 ? ' FCFA' : ''}</span>
                            </h2>
                            <p className="text-[11px] text-muted-foreground mt-1">{m.sub}</p>
                        </div>
                    ))}
                </div>

                {/* --- STOCK TABLE (Desktop) --- */}
                <div className="hidden md:block bg-card border border-border shadow-sm rounded-xl overflow-hidden min-h-[500px] flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-separate border-spacing-0">
                            <thead className="bg-muted/10 text-muted-foreground text-xs font-semibold border-b border-border">
                                <tr>
                                    <th className="px-6 py-4">Article</th>
                                    <th className="px-6 py-4">Catégorie</th>
                                    <th className="px-6 py-4 text-center">Stock</th>
                                    <th className="px-6 py-4 text-right">État</th>
                                    <th className="px-6 py-4 text-right">P. Vente</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center text-muted-foreground italic">Aucun produit trouvé.</td>
                                    </tr>
                                ) : filteredProducts.map((p) => {
                                    const isLow = p.stock <= (p.minStock || 5);
                                    const isOut = p.stock === 0;
                                    return (
                                        <tr key={p.id} className="group hover:bg-muted/20 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                                                        {p.image ? (
                                                            <SafeImage src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package className="w-4 h-4 text-muted-foreground/30" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-foreground text-sm uppercase truncate">{p.name}</h3>
                                                        <p className="text-[9px] text-muted-foreground font-mono uppercase opacity-60">REF: {p.id.slice(-6).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-medium text-muted-foreground">{p.category || "Standard"}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={cn("text-sm font-bold", isLow ? "text-red-500" : "text-foreground")}>{p.stock}</span>
                                                    <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
                                                        <div 
                                                            className={cn("h-full", isOut ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-primary")} 
                                                            style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }} 
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[9px] font-black uppercase border",
                                                    isOut ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                                                    isLow ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                                                    "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                                )}>
                                                    {isOut ? "Rupture" : isLow ? "Seuil" : "OK"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-foreground">{formatMoney(p.price)} F</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleQuickStock(p.id, p.name)} className="p-2 bg-background border border-border rounded-lg hover:border-primary/50 transition-all"><Plus className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDelete(p.id, p.name)} className="p-2 bg-background border border-border rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- MOBILE CARD VIEW --- */}
                <div className="md:hidden space-y-4">
                    {filteredProducts.length === 0 ? (
                         <div className="py-20 text-center text-muted-foreground italic">Aucun produit trouvé.</div>
                    ) : filteredProducts.map((p) => {
                        const isLow = p.stock <= (p.minStock || 5);
                        const isOut = p.stock === 0;
                        return (
                            <div key={p.id} className="bg-card border border-border p-4 rounded-2xl space-y-4 shadow-sm">
                                <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden">
                                        {p.image ? <SafeImage src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-muted-foreground/30" />}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <h3 className="font-bold text-foreground text-sm uppercase truncate">{p.name}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] font-black text-primary">{formatMoney(p.price)} F</span>
                                            <span className="text-[8px] text-muted-foreground/50 uppercase font-bold tracking-tighter">REF: {p.id.slice(-6).toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[8px] font-black uppercase border",
                                        isOut ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                                        isLow ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                                        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                    )}>
                                        {isOut ? "Out" : isLow ? "Alert" : "OK"}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest">Stock Disponible</span>
                                        <span className={cn("text-lg font-black", isLow ? "text-red-500" : "text-foreground")}>{p.stock}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleQuickStock(p.id, p.name)} className="px-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Réappro.</button>
                                        <button onClick={() => handleDelete(p.id, p.name)} className="p-2.5 bg-red-500/5 text-red-500 border border-red-500/10 rounded-xl active:scale-95 transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
