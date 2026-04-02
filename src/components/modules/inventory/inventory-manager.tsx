"use client";

import { useState, useMemo } from "react";
import { 
    Search, Plus, Package, AlertTriangle, 
    Trash2, Printer, Coins, X, Loader2, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SafeImage } from "@/components/ui/safe-image";
import { createProduct, updateStock, deleteProduct } from "@/lib/actions/inventory";

interface Product {
    id: string;
    name: string;
    price: number;
    costPrice?: number | null;
    category?: string | null;
    image?: string | null;
    stock: number;
    minStock?: number | null;
    sku?: string | null;
}

export function InventoryManager({ initialProducts, storeId }: { initialProducts: Product[], storeId: string }) {
    const [products, setProducts] = useState(initialProducts);
    const [search, setSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: "", price: "", costPrice: "", stock: "0", minStock: "5", category: "", sku: "", image: "" });

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
        const amount = prompt(`📦 APPROVISIONNEMENT : ${name}\nQuantité reçue :`);
        if (!amount || isNaN(Number(amount))) return;
        setLoading(true);
        try {
            const res = await updateStock({ productId: pId, amount: Number(amount), reason: "Approvisionnement Manuel" });
            if (res.success) {
                toast.success(`Stock mis à jour ! ✨`);
                setProducts(prev => prev.map(p => p.id === pId ? { ...p, stock: p.stock + Number(amount) } : p));
            } else toast.error(res.error);
        } finally { setLoading(false); }
    };

    const handleDelete = async (pId: string, name: string) => {
        if (!confirm(`⚠️ Supprimer ${name} ?`)) return;
        try {
            const res = await deleteProduct(pId);
            if (res.success) {
                toast.success("Retiré ! ✨");
                setProducts(prev => prev.filter(p => p.id !== pId));
            } else toast.error(res.error);
        } catch { toast.error("Erreur système"); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const result = await createProduct({ ...formData, price: Number(formData.price), costPrice: Number(formData.costPrice), stock: Number(formData.stock), minStock: Number(formData.minStock) });
        if (result.success) {
            toast.success("Produit ajouté ! 📦");
            // @ts-ignore
            setProducts([result.product, ...products]);
            setShowAddModal(false);
            setFormData({ name: "", price: "", costPrice: "", stock: "0", minStock: "5", category: "", sku: "", image: "" });
        } else toast.error(result.error);
        setLoading(false);
    };

    return (
        <div className="p-4 md:p-6 flex flex-col h-full space-y-6 bg-background text-foreground transition-all duration-500 overflow-y-auto custom-scrollbar">
            
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none text-foreground">
                        Gestion <span className="text-primary italic">Stock.</span>
                    </h1>
                    <p className="text-[8px] text-muted-foreground/30 font-black tracking-[0.2em] uppercase">Logistique Alpha | {products.length} Articles</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 p-1 bg-muted/20 border border-border rounded-lg group focus-within:ring-1 ring-primary/20 h-9">
                        <Search className="w-3.5 h-3.5 ml-2 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="FILTRER STOCK..." className="bg-transparent border-none outline-none py-1.5 px-0.5 w-32 text-[8px] uppercase font-black tracking-widest placeholder:text-muted-foreground/20" />
                    </div>
                    <button onClick={() => setShowAddModal(true)} className="bg-primary text-black px-4 py-2.5 rounded-lg font-black uppercase text-[9px] tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-md italic">
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        Ajouter
                    </button>
                    <button className="p-2.5 bg-muted/30 border border-border rounded-lg hover:bg-primary transition-all"><Printer className="w-3.5 h-3.5" /></button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    { label: "Valeur Achat", value: metrics.totalValue, icon: Coins, color: "text-primary" },
                    { label: "Alertes Seuil", value: metrics.lowStockCount, icon: AlertTriangle, color: "text-amber-500", anim: true },
                    { label: "Rupture Stock", value: metrics.outOfStockCount, icon: Package, color: "text-red-500" }
                ].map((m, i) => (
                    <div key={i} className="bg-secondary/5 border border-border/10 rounded-xl p-4 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col gap-1.5">
                            <div className={cn("inline-flex items-center gap-1.5 opacity-50 font-black", m.color)}>
                                <AlertTriangle className={cn("w-3.5 h-3.5", m.anim && "animate-pulse")} />
                                <p className="text-[8px] uppercase tracking-widest leading-none">{m.label}</p>
                            </div>
                            <h2 className="text-xl font-black text-foreground italic tracking-tight leading-none uppercase">
                                {typeof m.value === 'number' ? new Intl.NumberFormat('fr-FR').format(m.value) : m.value}
                                <span className="text-[9px] opacity-20 ml-1 font-black uppercase">{i === 0 ? 'F' : 'Units'}</span>
                            </h2>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredProducts.map((p) => {
                    const isLow = p.stock <= (p.minStock || 5);
                    const isOut = p.stock === 0;
                    return (
                        <div key={p.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:border-primary/20 transition-all group relative overflow-hidden flex flex-col justify-between h-full min-h-[170px]">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-center overflow-hidden">
                                        {p.image ? <SafeImage src={p.image} className="w-full h-full object-cover" /> : <Package className="w-3.5 h-3.5 opacity-10" />}
                                    </div>
                                    <div className={cn("px-1.5 py-0.5 rounded text-[6px] font-black uppercase tracking-widest border", isOut ? "bg-red-500/10 border-red-500/20 text-red-500" : isLow ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500")}>
                                        {isOut ? "OUT" : isLow ? "LOW" : "OK"}
                                    </div>
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[7px] font-black text-muted-foreground/30 italic uppercase tracking-widest">{p.category || "GENERAL"}</p>
                                    <h3 className="text-[11px] font-black text-foreground tracking-tighter uppercase leading-tight truncate">{p.name}</h3>
                                    <p className="text-[12px] font-black text-primary italic leading-none pt-0.5">{p.price.toLocaleString()} <span className="text-[7px] opacity-20 ml-0.5 uppercase">F</span></p>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-border/10 mt-3 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[7px] font-black text-muted-foreground/30 uppercase opacity-20">Stock Unit</span>
                                    <span className={cn("text-base font-black leading-none italic", isLow ? "text-red-500" : "text-foreground")}>{p.stock}</span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleQuickStock(p.id, p.name)} className="w-7 h-7 rounded-lg bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all flex items-center justify-center"><Plus className="w-3.5 h-3.5 stroke-[3]" /></button>
                                    <button onClick={() => handleDelete(p.id, p.name)} className="w-7 h-7 rounded-lg bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-black transition-all flex items-center justify-center"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 md:p-6 lg:p-8">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-background/60 backdrop-blur-md" />
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="relative w-full max-w-md h-[90vh] bg-card border border-border shadow-2xl rounded-2xl p-6 flex flex-col overflow-hidden">
                            <header className="flex justify-between items-center mb-6">
                                <div className="space-y-0.5 text-left w-full">
                                    <h2 className="text-lg font-black italic tracking-tighter uppercase text-foreground leading-none">Nouveau <span className="text-primary italic">Article.</span></h2>
                                    <p className="text-[7px] text-muted-foreground/30 font-black uppercase tracking-widest">Registre Logistique Alpha</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg bg-muted/20 border border-border text-foreground hover:bg-primary transition-all"><X className="w-4 h-4" /></button>
                            </header>
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1 italic">Désignation</label>
                                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-muted/5 border border-border/50 focus:border-primary rounded-lg px-4 py-3 text-xs font-black text-foreground outline-none uppercase italic" placeholder="EX: IPHONE 15 PRO..." />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                     <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-primary/60 ml-1 italic">P.A (Achat)</label>
                                        <input required type="number" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} className="w-full bg-muted/5 border border-border/50 focus:border-primary rounded-lg px-4 py-3 text-xs font-black text-white outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-primary ml-1 italic">P.V (Vente)</label>
                                        <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-muted/5 border border-border/50 focus:border-primary rounded-lg px-4 py-3 text-xs font-black text-white outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                     <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 ml-1 italic">Stock Initial</label>
                                        <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full bg-muted/5 border border-border/50 rounded-lg px-4 py-3 text-xs font-black text-white outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase tracking-widest text-red-500/60 ml-1 italic">Seuil Alerte</label>
                                        <input required type="number" value={formData.minStock} onChange={e => setFormData({...formData, minStock: e.target.value})} className="w-full bg-red-500/5 border border-red-500/10 rounded-lg px-4 py-3 text-xs font-black text-red-500 outline-none" />
                                    </div>
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-4 bg-primary text-black font-black uppercase tracking-[0.2em] text-[9px] rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 italic mt-6">
                                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : [<Sparkles key="s" className="w-3.5 h-3.5" />, "Déployer le Produit"]}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
