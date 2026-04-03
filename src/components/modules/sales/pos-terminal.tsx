"use client";

import { useState, useMemo } from "react";
import { 
    Search, 
    ShoppingCart, 
    Trash2, 
    Plus, 
    Minus, 
    CreditCard, 
    Banknote, 
    Receipt, 
    X, 
    Package, 
    Tag,
    ChevronRight,
    Loader2,
    Printer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SafeImage } from "@/components/ui/safe-image";
import { processSale } from "@/lib/actions/sales";

interface Product {
    id: string;
    name: string;
    price: number;
    category?: string | null;
    image?: string | null;
    stock: number;
    sku?: string | null;
}

interface CartItem extends Product {
    quantity: number;
}

interface SaleReceipt {
    items: CartItem[];
    total: number;
    subtotal: number;
    tax: number;
    method: "CASH" | "CARD";
    id: string;
    date: string;
}

export function PosTerminal({ initialProducts }: { initialProducts: Product[] }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState<string>("all");
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");
    const [showReceipt, setShowReceipt] = useState(false);
    const [lastSale, setLastSale] = useState<SaleReceipt | null>(null);
    const [showMobileCart, setShowMobileCart] = useState(false);

    const handlePrintReceipt = () => {
        window.print();
    };

    // --- LOGIC ---
    const categories = useMemo(() => {
        const cats = new Set(initialProducts.map(p => p.category).filter(Boolean));
        return ["all", ...Array.from(cats)];
    }, [initialProducts]);

    const filteredProducts = initialProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                             (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
        const matchesCategory = category === "all" || p.category === category;
        return matchesSearch && matchesCategory;
    });

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.20; // 20% Mock Tax
    const total = subtotal + tax;

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => 
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const removeFromCart = (id: string) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const handleProcessSale = async () => {
        if (cart.length === 0) return;
        setIsCheckingOut(true);

        const result = await processSale({
            items: cart,
            total,
            paymentMethod
        });

        if (result.success) {
            const saleId = `MDS-${crypto.randomUUID().split("-")[0].toUpperCase()}`;
            const saleData: SaleReceipt = {
                items: [...cart],
                total,
                subtotal,
                tax,
                method: paymentMethod,
                id: saleId,
                date: new Date().toLocaleString()
            };
            setLastSale(saleData);
            setShowReceipt(true);
            toast.success("Vente enregistrée avec succès ! 🧾");
            setCart([]);
        } else {
            toast.error(result.error || "Erreur lors de la vente.");
        }
        
        setIsCheckingOut(false);
    };

    return (
        <div className="flex flex-col md:flex-row h-full bg-[#050505] text-white">
            <div className="md:hidden fixed bottom-24 right-6 z-[60]">
                <button 
                    onClick={() => setShowMobileCart(true)}
                    className="w-16 h-16 rounded-full bg-primary text-black shadow-[0_20px_50px_rgba(249,115,22,0.5)] flex items-center justify-center relative active:scale-95 transition-all"
                >
                    <ShoppingCart className="w-7 h-7" />
                    {cart.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center text-[10px] font-black border-4 border-[#050505]">
                            {cart.length}
                        </div>
                    )}
                </button>
            </div>

            <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden">
                <header className="mb-8 space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none">
                                Terminal <span className="text-primary underline-offset-4 decoration-primary/30 underline">Alpha-POS.</span>
                            </h1>
                            <p className="text-[9px] text-gray-500 font-bold tracking-[0.2em] uppercase origin-left">Operations Protocol active</p>
                        </div>

                        <div className="relative group max-w-md w-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Scanner un produit ou rechercher..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="block w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-[11px] font-black uppercase tracking-widest focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary transition-all backdrop-blur-md placeholder:text-white/10"
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 p-1 bg-white/5 rounded-xl overflow-x-auto no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat as string)}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300",
                                    category === cat ? "bg-primary text-black" : "text-gray-500 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {cat === "all" ? "Catalogue" : cat}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        <AnimatePresence>
                            {filteredProducts.map((product) => (
                                <motion.div
                                    layout
                                    key={product.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => addToCart(product)}
                                    className="group relative bg-white/[0.03] border border-white/5 rounded-3xl p-4 cursor-pointer hover:bg-white/[0.07] hover:border-primary/20 transition-all active:scale-[0.98] overflow-hidden"
                                >
                                    <div className="mb-3 aspect-square rounded-xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center relative">
                                        {product.image ? (
                                            <SafeImage src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <Package className="h-8 w-8 text-white/10" />
                                        )}
                                        <div className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[8px] font-black text-white shadow-xl">
                                            {product.stock}
                                        </div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-[11px] font-black text-white/90 truncate uppercase tracking-tight italic">{product.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-black text-primary italic tracking-tight">{product.price.toLocaleString()} F</span>
                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Plus className="w-3 h-3 text-primary" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-40 text-center opacity-40">
                            <Tag className="w-16 h-16 mb-4 text-gray-500" />
                            <p className="text-xl font-black italic uppercase">Aucun module identifié.</p>
                            <span className="text-xs">Réinitialisez les filtres ou vérifiez l&apos;inventaire.</span>
                        </div>
                    )}
                </div>
            </div>

            <div className={cn(
                "fixed md:static inset-0 md:inset-auto z-[70] md:z-10 w-full md:w-[450px] bg-[#0A0A0B] border-l border-white/10 flex flex-col p-6 md:p-8 relative shadow-[-50px_0_100px_rgba(0,0,0,0.5)] transition-transform duration-500",
                showMobileCart ? "translate-x-0" : "translate-x-full md:translate-x-0"
            )}>
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                    <button onClick={() => setShowMobileCart(false)} className="md:hidden p-2 rounded-xl bg-white/5 text-gray-500 mr-2"><X className="w-4 h-4" /></button>
                    <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"><ShoppingCart className="w-4 h-4 text-primary" /></div>
                    <div className="flex flex-col"><h2 className="text-sm font-black uppercase italic tracking-tighter">Votre Panier</h2><span className="text-[8px] font-black tracking-[0.2em] uppercase text-white/10">{cart.length} Articles</span></div>
                    <button onClick={() => setCart([])} className="ml-auto p-2 rounded-xl text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all"><Trash2 className="w-5 h-5" /></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1">
                    <AnimatePresence mode="popLayout">
                        {cart.map((item) => (
                            <motion.div key={item.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="w-12 h-12 rounded-lg bg-black/40 overflow-hidden shrink-0 border border-white/5">
                                    {item.image ? <SafeImage src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-white/10" /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-[10px] font-black uppercase text-white/80 truncate">{item.name}</h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[11px] font-black text-primary italic">{(item.price * item.quantity).toLocaleString()} F</span>
                                        <div className="flex items-center gap-2 bg-black/50 p-1 rounded-lg border border-white/5 scale-90 origin-right">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5 hover:bg-white/10 rounded shadow-sm"><Minus className="w-2.5 h-2.5" /></button>
                                            <span className="text-[10px] font-black w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5 hover:bg-white/10 rounded shadow-sm"><Plus className="w-2.5 h-2.5 text-primary" /></button>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="p-3 self-center rounded-2xl bg-red-500/5 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 transition-all border border-red-500/0 hover:border-red-500/20"><X className="w-4 h-4" /></button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {cart.length === 0 && <div className="flex flex-col items-center justify-center h-full py-40 text-center opacity-30 grayscale pointer-events-none"><div className="relative"><ShoppingCart className="w-16 h-16 text-gray-600" /><div className="absolute top-0 right-0 w-4 h-4 bg-primary rounded-full animate-ping" /></div><p className="mt-4 text-xs font-black tracking-[0.3em] uppercase">Espace Vide</p></div>}
                </div>

                <div className="mt-8 space-y-6">
                    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center text-[10px]"><span className="text-gray-500 font-black uppercase tracking-widest leading-none">Sous-total</span><span className="font-black text-white/40">{subtotal.toLocaleString()} F</span></div>
                        <div className="flex justify-between items-center text-[10px]"><span className="text-gray-500 font-black uppercase tracking-widest leading-none">TVA (20%)</span><span className="font-black text-white/40">{tax.toLocaleString()} F</span></div>
                        <div className="h-px bg-white/5 w-full" /><div className="flex justify-between items-end pt-1"><span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Total Terminal</span><span className="text-2xl font-black italic tracking-tighter text-white">{total.toLocaleString()} <span className="text-[10px] opacity-20">F</span></span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setPaymentMethod("CASH")} className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all", paymentMethod === "CASH" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-white/5 border-white/5 text-gray-500 hover:text-white")}><Banknote className="w-5 h-5" /><span className="text-[9px] font-black uppercase tracking-widest">Espèces</span></button>
                        <button onClick={() => setPaymentMethod("CARD")} className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all", paymentMethod === "CARD" ? "bg-primary/10 border-primary/30 text-primary" : "bg-white/5 border-white/5 text-gray-500 hover:text-white")}><CreditCard className="w-5 h-5" /><span className="text-[9px] font-black uppercase tracking-widest">TPE / Carte</span></button>
                    </div>
                    <button onClick={handleProcessSale} disabled={cart.length === 0 || isCheckingOut} className="w-full py-6 rounded-3xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:grayscale transition-all text-black font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(249,115,22,0.3)] active:scale-[0.98]">{isCheckingOut ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Receipt className="w-5 h-5" />Finaliser & Encaisser<ChevronRight className="w-4 h-4" /></>}</button>
                </div>
            </div>

            <AnimatePresence>{showReceipt && lastSale && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm print:bg-white print:p-0">
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white text-black p-8 rounded-[2rem] w-full max-w-sm shadow-2xl relative print:shadow-none print:rounded-none print:w-full print:p-0">
                        <button onClick={() => setShowReceipt(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 print:hidden"><X className="w-5 h-5 text-gray-400" /></button>
                        <div className="text-center mb-8 border-b border-dashed border-gray-200 pb-6"><div className="text-2xl font-black tracking-tighter uppercase mb-1">MINDOS</div><div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Le Système d&apos;Exploitation Créateur</div><div className="mt-4 text-[9px] text-gray-400"><p>N° Ticket: {lastSale.id}</p><p>{lastSale.date}</p></div></div>
                        <div className="space-y-3 mb-8">{lastSale.items.map((item: CartItem) => (
                            <div key={item.id} className="flex justify-between text-xs"><div className="flex-1"><p className="font-bold uppercase tracking-tight">{item.name}</p><p className="text-[10px] text-gray-500">{item.quantity} x {item.price.toLocaleString()}</p></div><div className="font-bold">{(item.price * item.quantity).toLocaleString()}</div></div>
                        ))}</div>
                        <div className="border-t border-dashed border-gray-200 pt-6 space-y-2"><div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500"><span>Sous-total</span><span>{lastSale.subtotal.toLocaleString()}</span></div><div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500"><span>TVA (20%)</span><span>{lastSale.tax.toLocaleString()}</span></div><div className="flex justify-between text-xl font-black pt-2 border-t border-gray-100"><span>TOTAL</span><span className="text-primary italic">{lastSale.total.toLocaleString()} FCFA</span></div><div className="text-[9px] font-bold text-gray-400 uppercase text-center mt-6">Paiement par {lastSale.method === "CASH" ? "Espèces" : "Carte"}</div></div>
                        <div className="mt-10 space-y-3 print:hidden"><button onClick={handlePrintReceipt} className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center gap-2"><Printer className="w-4 h-4" />Imprimer Ticket</button><button onClick={() => setShowReceipt(false)} className="w-full py-4 border border-gray-200 text-gray-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-all">Nouvelle Vente</button></div>
                    </motion.div>
                </div>
            )}</AnimatePresence>
        </div>
    );
}
