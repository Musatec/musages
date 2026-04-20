"use client";

import { useEffect, useState } from "react";
import { getSuppliers, processPurchase } from "@/lib/actions/procurement";
import { getProducts } from "@/lib/actions/inventory";
import { TopLoader } from "@/components/ui/top-loader";
import { toast } from "sonner";
import { 
    ShoppingCart, 
    Truck, 
    Plus, 
    Minus, 
    Trash2, 
    Search, 
    CheckCircle2, 
    Package, 
    Info,
    Loader2
} from "lucide-react";
import { cn, formatMoney } from "@/lib/utils";
import { EliteMetricCard } from "@/components/ui/metric-card";
import { ElitePageHeader } from "@/components/ui/page-header";

export default function PurchasePage() {
    const [loading, setLoading] = useState(true);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Selection state
    const [selectedSupplierId, setSelectedSupplierId] = useState("");
    const [cart, setCart] = useState<any[]>([]);

    const fetchData = async () => {
        const [supRes, prodRes] = await Promise.all([
            getSuppliers(),
            getProducts()
        ]);
        if (supRes.success) setSuppliers(supRes.suppliers || []);
        if (prodRes) setProducts(prodRes);
        setLoading(false);
    };

    useEffect(() => {
        let isMounted = true;
        (async () => {
            if (isMounted) setLoading(true);
            const [supRes, prodRes] = await Promise.all([
                getSuppliers(),
                getProducts()
            ]);
            if (isMounted) {
                if (supRes.success) setSuppliers(supRes.suppliers || []);
                if (prodRes) setProducts(prodRes);
                setLoading(false);
            }
        })();
        return () => { isMounted = false; };
    }, []);

    const addToCart = (product: any) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, quantity: 1, unitPrice: product.price * 0.7 }]); // Default cost price to 70% of sell price
        }
    };

    const updateCartItem = (id: string, updates: any) => {
        setCart(cart.map(item => item.id === id ? { ...item, ...updates } : item));
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const total = cart.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

    const handleSubmit = async () => {
        if (!selectedSupplierId) return toast.error("Veuillez sélectionner un fournisseur.");
        if (cart.length === 0) return toast.error("Le panier d'arrivage est vide.");

        setLoading(true);
        const res = await processPurchase({
            supplierId: selectedSupplierId,
            paymentMethod: "CASH",
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice
            }))
        });

        if (res.success) {
            toast.success("Arrivage validé et stocks mis à jour !");
            setCart([]);
            setSelectedSupplierId("");
            fetchData();
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-hidden lg:flex-row">
            {loading && <TopLoader />}

            {/* Left Section: Product Picker */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-border p-6 md:p-8 space-y-4 overflow-y-auto">
                <ElitePageHeader 
                    title="Arrivages & Stocks."
                    subtitle="Logistique Amont"
                    description="Réceptionnez vos commandes, mettez à jour les prix d'achat et injectez de nouvelles unités dans votre inventaire."
                    actions={
                        <div className="relative group w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                            <input 
                                value={searchTerm}
                                onChange={e=>setSearchTerm(e.target.value)}
                                placeholder="Rechercher un produit dans l'inventaire..." 
                                className="w-full bg-card border border-border rounded-xl py-3 pl-12 pr-4 text-sm font-bold outline-none focus:ring-1 focus:ring-primary/20 shadow-sm"
                            />
                        </div>
                    }
                />

                {/* --- STRATEGIC METRICS (Elite SaaS) --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <EliteMetricCard 
                        label="Coût Arrivage" 
                        value={`${formatMoney(total)} F`} 
                        icon={ShoppingCart} 
                        variant="blue"
                    />
                    <EliteMetricCard 
                        label="Total Articles" 
                        value={cart.reduce((acc, i) => acc + i.quantity, 0)} 
                        icon={Package} 
                        variant="purple"
                    />
                    <EliteMetricCard 
                        label="Fournisseur" 
                        value={suppliers.find(s => s.id === selectedSupplierId)?.name || "Non sélectionné"} 
                        icon={Truck} 
                        variant="amber"
                    />
                    <EliteMetricCard 
                        label="Marge Est." 
                        value={`${cart.length > 0 ? Math.round(((cart.reduce((acc, i) => acc + (i.price * i.quantity), 0) - total) / cart.reduce((acc, i) => acc + (i.price * i.quantity), 1)) * 100) : 0}%`} 
                        icon={CheckCircle2} 
                        variant="emerald"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProducts.map(p => (
                        <button 
                            key={p.id}
                            onClick={() => addToCart(p)}
                            className="bg-card border border-border p-5 rounded-2xl text-left hover:border-primary active:scale-[0.98] transition-all group relative overflow-hidden shadow-sm"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-all" />
                            <h3 className="font-bold uppercase text-xs leading-tight mb-3 truncate pr-6 text-foreground">{p.name}</h3>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Actuel</p>
                                    <p className="font-bold text-xl text-primary italic leading-none">{p.stock}</p>
                                </div>
                                <div className="p-2.5 bg-muted border border-border rounded-lg group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent transition-all shadow-sm">
                                    <Plus className="w-4 h-4" />
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Section: Purchase Summary (Cart) */}
            <div className="w-full lg:w-96 flex flex-col bg-muted/20 border-l border-border p-6 md:p-8 space-y-6 overflow-y-auto">
                <div>
                     <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 mb-6 flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> Manifeste d'Arrivage
                    </h2>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 ml-1">Fournisseur</label>
                        <select 
                            value={selectedSupplierId}
                            onChange={e=>setSelectedSupplierId(e.target.value)}
                            className="w-full bg-card border border-border rounded-xl px-4 py-3 text-[11px] font-bold uppercase outline-none focus:ring-1 focus:ring-primary/20 shadow-sm appearance-none"
                        >
                            <option value="">-- Sélectionner --</option>
                            {suppliers.map(s => (
                                <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto min-h-0 pt-2 scrollbar-hide">
                    {cart.map(item => (
                        <div key={item.id} className="bg-card border border-border rounded-xl p-4 space-y-4 shadow-sm animate-in fade-in slide-in-from-right-2 duration-200">
                             <div className="flex justify-between items-start gap-4">
                                 <h4 className="text-[11px] font-bold uppercase italic leading-tight break-words">{item.name}</h4>
                                 <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground/30 hover:text-red-500 transition-colors">
                                     <Trash2 className="w-3.5 h-3.5" />
                                 </button>
                             </div>
                             
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                     <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">Quantité</span>
                                     <div className="flex items-center gap-2">
                                         <button onClick={() => updateCartItem(item.id, { quantity: Math.max(1, item.quantity - 1) })} className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center hover:bg-foreground/5 transition-colors"><Minus className="w-3 h-3" /></button>
                                         <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                                         <button onClick={() => updateCartItem(item.id, { quantity: item.quantity + 1 })} className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center hover:bg-foreground/5 transition-colors"><Plus className="w-3 h-3" /></button>
                                     </div>
                                 </div>
                                 <div className="space-y-1 text-right">
                                     <span className="text-[9px] font-bold text-muted-foreground/40 uppercase">P. Achat Unitaire</span>
                                     <input 
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={e=>updateCartItem(item.id, { unitPrice: Number(e.target.value) })}
                                        className="w-full bg-transparent border-b border-primary/20 text-sm font-bold text-primary text-right outline-none focus:border-primary"
                                     />
                                 </div>
                             </div>
                        </div>
                    ))}

                    {cart.length === 0 && (
                        <div className="h-40 flex flex-col items-center justify-center text-center opacity-30 border-2 border-dashed border-border rounded-2xl bg-card">
                            <Package className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="text-[10px] font-bold uppercase tracking-widest px-8">Manifeste vide</p>
                        </div>
                    )}
                </div>

                <div className="pt-6 border-t border-border space-y-6">
                    <div className="flex justify-between items-center bg-card border border-border p-4 rounded-xl shadow-sm">
                         <span className="text-[10px] font-bold uppercase text-muted-foreground/50 tracking-widest">Coût Acquisition</span>
                         <span className="text-lg font-bold text-primary italic">{(total).toLocaleString()} F</span>
                    </div>

                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-3 shadow-sm">
                        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5 opacity-60" />
                        <p className="text-[9px] text-muted-foreground/80 leading-tight uppercase font-semibold">
                            La validation automatique enregistre une sortie de caisse immédiate de <span className="text-foreground">{(total).toLocaleString()} F</span> pour ce stock.
                        </p>
                    </div>

                    <button 
                        disabled={loading || cart.length === 0}
                        onClick={handleSubmit}
                        className="w-full bg-foreground text-background py-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-foreground/90 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Valider l'Arrivage</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
