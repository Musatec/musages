"use client";

import { useState, useMemo, useEffect } from "react";
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
    Printer,
    User,
    Phone,
    MessageSquare,
    MessageCircle,
    FileText,
    MoreHorizontal,
    BoxIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatMoney } from "@/lib/utils";
import { toast } from "sonner";
import { SafeImage } from "@/components/ui/safe-image";
import { processSale } from "@/lib/actions/sales";
import { generateInvoicePDF, shareViaWhatsApp } from "@/lib/invoice";

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
    
    // CUSTOMER DATA PROTOCOL
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [isCustomerEnabled, setIsCustomerEnabled] = useState(false);

    const handlePrintReceipt = () => {
        window.print();
    };

    const handleWhatsAppShare = () => {
        if (!lastSale) return;
        
        const phone = customerPhone.replace(/\D/g, "");
        if (!phone) {
            toast.error("Numéro de téléphone manquant pour WhatsApp !");
            return;
        }

        const itemsList = lastSale.items.map(item => `- ${item.name} (x${item.quantity}): ${item.price.toLocaleString()} F`).join("\n");
        const receiptUrl = `${window.location.origin}/r/${lastSale.id}`;
        
        const message = `*MINDOS - REÇU DE VENTE*\n\n` +
            `Bonjour ${customerName || 'Client'},\n` +
            `Voici le détail de votre achat du ${lastSale.date} :\n\n` +
            `${itemsList}\n\n` +
            `*TOTAL : ${lastSale.total.toLocaleString()} FCFA*\n\n` +
            `🔗 Voir votre facture officielle en ligne :\n${receiptUrl}\n\n` +
            `Merci de votre confiance ! A bientôt chez Musages.`;

        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
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

    // BARCODE SCANNER OPTIMIZATION
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && search.trim() !== '') {
            // If exactly one product matches, auto-add to cart and clear search (Barcode Scanner behavior)
            if (filteredProducts.length === 1) {
                addToCart(filteredProducts[0]);
                setSearch("");
                toast.success(`${filteredProducts[0].name} ajouté !`);
            } else if (filteredProducts.length > 1) {
                // If multiple, maybe it's just a general search, do nothing specific
            } else {
                toast.error("Code barre inconnu.");
                setSearch("");
            }
        }
    };

    const handleProcessSale = async () => {
        if (cart.length === 0) return;
        setIsCheckingOut(true);

        const result = await processSale({
            items: cart,
            total,
            paymentMethod,
            customerName: isCustomerEnabled ? customerName : undefined,
            customerPhone: isCustomerEnabled ? customerPhone : undefined
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

    // GLOBAL HOTKEYS FOR PHYSICAL POS
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F12' || (e.ctrlKey && e.key === 'Enter')) {
                e.preventDefault();
                if (cart.length > 0 && !isCheckingOut && !showReceipt) {
                    handleProcessSale();
                }
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [cart, isCheckingOut, showReceipt]);

    const [layout, setLayout] = useState<"list" | "grid">("grid");

    return (
        <div className="flex flex-col md:flex-row h-full bg-background text-foreground transition-all duration-500 overflow-hidden font-sans">
            
            {/* MOBILE CART TRIGGER */}
            <div className="md:hidden fixed bottom-32 right-8 z-[70] animate-in fade-in zoom-in duration-500">
                <button 
                    onClick={() => setShowMobileCart(true)}
                    className="w-20 h-20 rounded-[2.5rem] bg-primary text-black shadow-2xl shadow-primary/40 flex items-center justify-center relative active:scale-90 transition-all border-4 border-background"
                >
                    <ShoppingCart className="w-8 h-8" />
                    {cart.length > 0 && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-foreground text-background rounded-2xl flex items-center justify-center text-[11px] font-black border-4 border-background shadow-xl">
                            {cart.length}
                        </div>
                    )}
                </button>
            </div>

            {/* MAIN TERMINAL AREA: THE KINETIC HUB */}
            <main className="flex-1 flex flex-col p-4 md:p-14 overflow-hidden space-y-6 md:space-y-12 bg-background relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-20" />
                
                <header className="space-y-6 md:space-y-10 group">
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 md:gap-10">
                        <div className="space-y-3 md:space-y-4">
                            <div className="flex items-center gap-3 md:gap-4">
                                 <div className="w-8 md:w-12 h-0.5 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]" />
                                 <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-muted-foreground/30 leading-none italic">Terminal Registry Alpha-01</span>
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none text-foreground">
                                    Alpha <span className="text-primary italic">POS.</span>
                                </h1>
                                <p className="text-[9px] md:text-[11px] font-black text-muted-foreground/20 tracking-[0.4em] uppercase italic leading-none">MindOS Kinetic Operations Hub</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-3xl">
                            <div className="relative group flex-1">
                                <div className="absolute inset-y-0 left-4 md:left-8 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground/10 group-focus-within:text-primary transition-all duration-500" />
                                </div>
                                    <input
                                        id="pos-search-input"
                                        type="text"
                                        placeholder="SCANNER / RECHERCHER..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={handleSearchKeyDown}
                                        autoFocus
                                        className="block w-full pl-10 md:pl-18 pr-4 md:pr-12 py-4 md:py-7 bg-card border border-border/50 rounded-2xl md:rounded-[2.5rem] text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/50 transition-all shadow-2xl placeholder:text-muted-foreground/10 italic"
                                    />
                            </div>

                            {/* LAYOUT TOGGLE */}
                            <div className="hidden md:flex bg-card border border-border/50 p-2 rounded-[2rem] shadow-xl">
                                <button 
                                    onClick={() => setLayout("list")}
                                    className={cn(
                                        "p-4 rounded-2xl transition-all",
                                        layout === "list" ? "bg-primary text-black shadow-lg" : "text-muted-foreground/40 hover:text-foreground"
                                    )}
                                >
                                    <MoreHorizontal className="w-6 h-6" />
                                </button>
                                <button 
                                    onClick={() => setLayout("grid")}
                                    className={cn(
                                        "p-4 rounded-2xl transition-all",
                                        layout === "grid" ? "bg-primary text-black shadow-lg" : "text-muted-foreground/40 hover:text-foreground"
                                    )}
                                >
                                    <BoxIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CATEGORY SELECTOR PROTOCOL */}
                    <div className="flex gap-4 p-2 bg-muted/5 border border-border/30 rounded-[2rem] overflow-x-auto no-scrollbar group-hover:border-primary/10 transition-all shadow-inner">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat as string)}
                                className={cn(
                                    "px-10 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap transition-all duration-700 relative overflow-hidden",
                                    category === cat 
                                        ? "bg-primary text-black shadow-xl shadow-primary/10 scale-[1.03] italic" 
                                        : "text-muted-foreground/40 hover:text-foreground hover:bg-card hover:translate-y-[-1px]"
                                )}
                            >
                                {cat === "all" ? "TOTAL REGISTRY" : cat}
                            </button>
                        ))}
                    </div>
                </header>

                {/* MAIN PRODUCT DISPLAY INTERFACE */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-card/40 border border-border/60 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden flex flex-col shadow-2xl transition-all hover:border-primary/5 group/log">
                    
                    {layout === "grid" ? (
                        <div className="p-4 md:p-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        id={`pos-product-${product.id}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -5 }}
                                        onClick={() => addToCart(product)}
                                        className="group/card bg-card border border-border/40 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 cursor-pointer hover:border-primary/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 relative overflow-hidden"
                                    >
                                        <div className="aspect-square rounded-[1.5rem] md:rounded-[2rem] bg-muted/20 border border-border/10 overflow-hidden mb-4 md:mb-6 relative group-hover/card:rotate-2 transition-transform duration-700">
                                            {product.image ? (
                                                <SafeImage src={product.image} alt={product.name} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-1000" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center opacity-5">
                                                    <Package className="w-12 h-12" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 md:space-y-3">
                                            <h3 className="text-[10px] md:text-[12px] font-black uppercase italic tracking-tight text-foreground/80 group-hover/card:text-primary transition-colors leading-tight truncate">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] md:text-sm font-black italic tracking-tighter text-foreground font-mono">
                                                    {formatMoney(product.price)} F
                                                </span>
                                                <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover/card:bg-primary group-hover/card:text-black transition-all">
                                                    <Plus className="w-3 h-3 md:w-4 md:h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-40 flex flex-col items-center justify-center opacity-10">
                                    <Search className="w-24 h-24 mb-6" />
                                    <p className="text-xl font-black uppercase tracking-widest">No Products Found</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* TABLE HEAD: REGISTRY METADATA (Desktop Only) */}
                            <div className="sticky top-0 bg-muted/30 backdrop-blur-3xl border-b border-border/80 p-4 md:p-8 hidden md:grid grid-cols-12 text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/30 italic z-30">
                                <div className="col-span-1 text-center">SYNC</div>
                                <div className="col-span-5 px-6 italic">PRODUIT / RÉFÉRENCE SYSTÈME</div>
                                <div className="col-span-2 text-center">PROTOCOLE-CAT</div>
                                <div className="col-span-2 text-center">FLUX / STOCK</div>
                                <div className="col-span-2 text-right">COTATION VALEUR</div>
                            </div>

                    <div className="flex-1 flex flex-col min-h-0 divide-y divide-border/5">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => addToCart(product)}
                                    className="flex flex-col md:grid md:grid-cols-12 items-center px-4 md:px-8 py-4 md:py-10 hover:bg-primary/[0.02] cursor-pointer group/row transition-all duration-300 active:bg-primary/5 relative border-l-[4px] md:border-l-[6px] border-l-transparent hover:border-l-primary gap-3 md:gap-0"
                                >
                                    {/* STATUS INDICATOR (Desktop Only) */}
                                    <div className="hidden md:flex col-span-1 flex justify-center flex-col items-center gap-2">
                                        <div className={cn(
                                            "w-2 h-10 rounded-full transition-all duration-500",
                                            product.stock < 10 ? "bg-amber-500/20 group-hover/row:bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]" : "bg-primary/20 group-hover/row:bg-primary"
                                        )} />
                                        <span className="text-[8px] font-black opacity-10 group-hover/row:opacity-100 transition-opacity uppercase tracking-widest">{product.id.slice(-4).toUpperCase()}</span>
                                    </div>

                                    {/* PRODUCT IDENTIFICATION & PRICE (Mobile Layout) */}
                                    <div className="md:col-span-5 w-full md:px-6 flex items-center gap-4 md:gap-8 overflow-hidden">
                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-muted/40 border border-border/50 overflow-hidden flex items-center justify-center shrink-0 group-hover/row:bg-primary group-hover/row:text-black transition-all shadow-inner relative">
                                            {product.image ? (
                                                <SafeImage src={product.image} alt={product.name} className="w-full h-full object-cover group-hover/row:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <Package className="h-4 w-4 md:h-6 md:w-6 opacity-10" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center justify-between md:block">
                                                <h3 className="text-[12px] md:text-lg font-black text-foreground uppercase tracking-tight italic group-hover/row:text-primary transition-colors truncate">
                                                    {product.name}
                                                </h3>
                                                <span className="md:hidden text-sm md:text-lg font-black text-primary italic tracking-tighter font-mono">
                                                    {formatMoney(product.price)} F
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <div className="h-[1px] w-3 md:w-4 bg-muted/20" />
                                                <p className="text-[8px] md:text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] md:tracking-[0.3em] font-mono">{product.sku || product.id.slice(-6).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CATEGORY (Desktop Only) */}
                                    <div className="hidden md:block md:col-span-2 text-center">
                                        <span className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-[0.3em] italic px-4 py-2 bg-muted/10 border border-border/10 rounded-xl group-hover/row:border-primary/20 transition-all">
                                            {product.category || 'GENERAL'}
                                        </span>
                                    </div>

                                    {/* FLOW / STOCK INDICATOR */}
                                    <div className="md:col-span-2 w-full flex items-center justify-between md:justify-center px-2 md:px-0">
                                        <div className="md:hidden text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Stock</div>
                                        <div className="inline-flex flex-col items-center md:items-center gap-1 md:gap-3">
                                            <span className={cn(
                                                "text-[9px] md:text-[12px] font-black italic tracking-tighter font-mono",
                                                product.stock < 10 ? "text-amber-500" : "text-emerald-500/60 group-hover/row:text-emerald-500"
                                            )}>
                                                {product.stock} PCS
                                            </span>
                                            <div className="w-12 md:w-24 h-[2px] md:h-[3px] bg-muted/20 rounded-full overflow-hidden">
                                                <div 
                                                    className={cn("h-full", product.stock < 10 ? "bg-amber-500" : "bg-emerald-500")} 
                                                    style={{ width: `${Math.min(100, (product.stock / 100) * 100)}%` }} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* PRICE VALUATION (Desktop Only) */}
                                    <div className="hidden md:flex md:col-span-2 text-right items-center justify-end gap-10 pr-8">
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-foreground italic tracking-tighter font-mono">
                                                {product.price.toLocaleString()}
                                            </span>
                                            <p className="text-[8px] font-black opacity-20 uppercase tracking-widest mt-1">FCFA</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-card border border-border/50 flex items-center justify-center group-hover/row:bg-primary group-hover/row:text-black transition-all">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center py-60 group/empty opacity-20">
                                <Search className="w-32 h-32 mb-8 text-muted-foreground/30 group-hover/empty:scale-110 transition-transform duration-1000" />
                                <div className="space-y-4 text-center">
                                    <p className="text-4xl font-black italic uppercase tracking-[0.5em] text-foreground">Registry Empty.</p>
                                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground/30">AUCUN PRODUIT NE RÉPOND AU FILTRE SÉLECTIONNÉ</p>
                                </div>
                            </div>
                        )}
                    </div>
                        </>
                    )}
                </div>
            </main>

            {/* CHECKOUT SIDEBAR: THE TRANSACTION ENGINE */}
            <aside className={cn(
                "fixed lg:static inset-0 lg:inset-auto z-[80] lg:z-10 w-full lg:w-[500px] bg-card border-l border-border/60 flex flex-col p-6 md:p-14 relative shadow-[-40px_0_60px_rgba(0,0,0,0.05)] transition-all duration-700 ease-in-out",
                showMobileCart ? "translate-x-0" : "translate-x-full lg:translate-x-0"
            )}>
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-transparent via-primary/20 to-transparent opacity-20" />
                
                <header className="flex items-center gap-4 md:gap-6 mb-6 md:mb-12 pb-6 md:pb-12 border-b border-border/30">
                    <button onClick={() => setShowMobileCart(false)} className="lg:hidden p-4 rounded-2xl bg-muted/20 text-muted-foreground mr-2 active:scale-90 transition-all"><X className="w-6 h-6" /></button>
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner group/icon">
                        <ShoppingCart className="w-6 h-6 text-primary group-hover/icon:scale-110 transition-transform" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black uppercase italic tracking-tighter leading-none">Checkout Engine</h2>
                        <span className="text-[11px] font-black tracking-[0.4em] uppercase text-primary/40 mt-1 italic">{cart.length} ARTICLES CHARGÉS</span>
                        <span className="text-[8px] font-black tracking-widest uppercase text-muted-foreground/30 mt-1">APPUIEZ SUR F12 POUR ENCAISSER</span>
                    </div>
                    <button onClick={() => setCart([])} className="ml-auto p-3.5 rounded-2xl text-muted-foreground/10 hover:text-red-500 hover:bg-red-500/5 transition-all group/trash" title="Vider Protocol">
                        <Trash2 className="w-6 h-6 group-hover/trash:-rotate-12" />
                    </button>
                </header>

                {/* CART LOG SCROLL-AREA */}
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-4 group/cartlist">
                    <AnimatePresence mode="popLayout">
                        {cart.map((item) => (
                            <motion.div 
                                key={item.id} 
                                layout 
                                initial={{ opacity: 0, x: 40 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                exit={{ opacity: 0, x: 40 }} 
                                className="flex items-center gap-6 p-6 rounded-[2rem] bg-muted/5 border border-border/20 hover:border-primary/20 transition-all group/item hover:shadow-xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover/item:bg-primary/40 transition-all" />
                                <div className="w-20 h-20 rounded-2xl bg-background overflow-hidden shrink-0 border border-border/50 shadow-inner group-hover/item:rotate-2 transition-transform">
                                    {item.image ? <SafeImage src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 opacity-5" /></div>}
                                </div>
                                <div className="flex-1 min-w-0 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-[13px] font-black uppercase text-foreground leading-tight truncate italic">{item.name}</h4>
                                        <button onClick={() => removeFromCart(item.id)} className="p-1 rounded-full text-muted-foreground/10 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"><X className="w-4 h-4" /></button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-black text-foreground italic tracking-tighter font-mono">{formatMoney(item.price * item.quantity)} F</span>
                                        <div className="flex items-center gap-4 bg-card px-4 py-2 rounded-2xl border border-border/40 shadow-inner scale-90 origin-right transition-all group-hover/item:border-primary/20">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-muted rounded-xl transition-colors active:scale-90"><Minus className="w-3.5 h-3.5" /></button>
                                            <span className="text-[12px] font-black w-6 text-center font-mono">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-muted rounded-xl transition-colors text-primary active:scale-90"><Plus className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {cart.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-40 text-center opacity-10 group/cart-empty">
                            <ShoppingCart className="w-24 h-24 text-foreground group-hover/cart-empty:scale-110 transition-transform duration-1000" />
                            <div className="mt-8 space-y-2">
                                <p className="text-[12px] font-black tracking-[0.5em] uppercase italic">Engine-STBY</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50">EN ATTENTE DE CHARGEMENT DONNÉES</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* COMPUTATION PANEL & CHECKOUT PROTOCOL */}
                <div className="mt-12 space-y-10 group/finance">
                    <div className="p-8 bg-muted/10 border border-border/30 rounded-[3rem] space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-primary/2 blur-[80px] rounded-full pointer-events-none" />
                        <div className="flex justify-between items-center text-[10px]"><span className="text-muted-foreground/30 font-black uppercase tracking-[0.3em] leading-none">Net Hors Taxe Protocol</span><span className="font-black text-foreground/40 font-mono italic">{formatMoney(subtotal)} F</span></div>
                        <div className="flex justify-between items-center text-[10px]"><span className="text-muted-foreground/30 font-black uppercase tracking-[0.3em] leading-none">Taxes Aggregated (20%)</span><span className="font-black text-foreground/40 font-mono italic">{formatMoney(tax)} F</span></div>
                        <div className="h-[2px] bg-border/20 w-full relative">
                            <div className="absolute top-0 left-0 h-full bg-primary/40 w-24 animate-pulse rounded-full" />
                        </div>
                        <div className="flex justify-between items-end pt-4">
                            <div className="space-y-1">
                                <span className="text-[12px] font-black text-primary uppercase tracking-[0.5em] italic leading-none">TOTAL COLLECTÉ</span>
                                <p className="text-[8px] font-black opacity-10 uppercase tracking-widest">MIN-VAL REGISTRY 00-1</p>
                            </div>
                            <div className="text-right">
                                <span className="text-5xl font-black italic tracking-tighter text-foreground font-mono">
                                    {formatMoney(total)}
                                </span>
                                <span className="text-[12px] font-black opacity-20 ml-2 uppercase">FCFA</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* STRATEGIC CUSTOMER IDENTIFICATION */}
                    <div className="space-y-4">
                        <button 
                            onClick={() => setIsCustomerEnabled(!isCustomerEnabled)}
                            className={cn(
                                "w-full py-4 px-6 rounded-2xl border flex items-center justify-between text-[10px] font-black uppercase tracking-widest transition-all",
                                isCustomerEnabled ? "bg-primary/5 border-primary text-primary" : "bg-muted/10 border-border/40 text-muted-foreground/40"
                            )}
                        >
                            <span className="flex items-center gap-3">
                                <User className="w-4 h-4" /> INFO CLIENT PROTOCOL
                            </span>
                            <div className={cn("w-2 h-2 rounded-full", isCustomerEnabled ? "bg-primary animate-pulse" : "bg-muted-foreground/20")} />
                        </button>

                        <AnimatePresence>
                            {isCustomerEnabled && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden space-y-3"
                                >
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                                        <input 
                                            type="text"
                                            placeholder="NOM COMPLET CLIENT"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            className="w-full pl-12 pr-6 py-4 bg-muted/5 border border-border/40 rounded-2xl text-[10px] font-black uppercase tracking-wider focus:border-primary/50 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                                        <input 
                                            type="tel"
                                            placeholder="TÉLÉPHONE (WHATSAPP)"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            className="w-full pl-12 pr-6 py-4 bg-muted/5 border border-border/40 rounded-2xl text-[10px] font-black tracking-widest focus:border-primary/50 transition-all outline-none"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* PAYMENT METHOD STRATEGY */}
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setPaymentMethod("CASH")} 
                            className={cn(
                                "flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-700 relative overflow-hidden group/opt",
                                paymentMethod === "CASH" ? "bg-emerald-500 text-black border-emerald-400 shadow-2xl shadow-emerald-500/20 scale-[1.03] italic" : "bg-card border-border/60 text-muted-foreground/40 hover:text-foreground"
                            )}
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] z-10">ESPECES</span>
                            <Banknote className={cn("w-6 h-6 z-10 transition-transform", paymentMethod === "CASH" ? "rotate-12 translate-x-1" : "opacity-30")} />
                        </button>
                        <button 
                            onClick={() => setPaymentMethod("CARD")} 
                            className={cn(
                                "flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-700 relative overflow-hidden group/opt",
                                paymentMethod === "CARD" ? "bg-primary text-black border-primary/60 shadow-2xl shadow-primary/20 scale-[1.03] italic" : "bg-card border-border/60 text-muted-foreground/40 hover:text-foreground"
                            )}
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] z-10">TPE / CARTE</span>
                            <CreditCard className={cn("w-6 h-6 z-10 transition-transform", paymentMethod === "CARD" ? "-rotate-12 -translate-x-1" : "opacity-30")} />
                        </button>
                    </div>
                    
                    {/* FINAL ACTION COMMAND */}
                    <button 
                        id="pos-checkout-btn"
                        onClick={handleProcessSale} 
                        disabled={cart.length === 0 || isCheckingOut} 
                        className="w-full py-10 rounded-[2.5rem] bg-primary hover:bg-primary/90 disabled:opacity-20 disabled:grayscale transition-all text-black font-black uppercase tracking-[0.6em] text-[12px] flex items-center justify-center gap-6 shadow-2xl shadow-primary/30 active:scale-95 italic group/btn"
                    >
                        {isCheckingOut ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                            <><Receipt className="w-6 h-6 group-hover/btn:rotate-12 transition-transform" /> ENCAISSER TRANSACTION <ChevronRight className="w-5 h-5 ml-4 group-hover/btn:translate-x-2 transition-transform" /></>
                        )}
                    </button>
                </div>
            </aside>

            {/* ALPHA RECEIPT THERMAL PROTOCOL */}
            <AnimatePresence>{showReceipt && lastSale && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-black/90 backdrop-blur-3xl print:bg-white print:p-0">
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 40 }} 
                        animate={{ scale: 1, opacity: 1, y: 0 }} 
                        exit={{ scale: 0.95, opacity: 0, y: 40 }} 
                        className="bg-zinc-50 text-black p-12 rounded-[3rem] w-full max-w-md shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative border border-white/20 print:shadow-none print:rounded-none print:w-full print:p-0 font-mono"
                    >
                        <button onClick={() => setShowReceipt(false)} className="absolute top-10 right-10 p-4 rounded-3xl hover:bg-zinc-200 print:hidden transition-all active:scale-90"><X className="w-6 h-6 text-zinc-400" /></button>
                        
                        <div className="text-center mb-12 border-b-2 border-dashed border-zinc-300 pb-8 space-y-4">
                            <div className="text-4xl font-black tracking-tighter uppercase italic leading-none">MINDOS</div>
                            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic">INDUSTRIAL RETAIL PROTOCOL</div>
                            <div className="mt-8 text-[10px] font-black text-zinc-400 uppercase tracking-widest space-y-1">
                                <p>REGISTRY: {lastSale.id}</p>
                                <p>TS: {lastSale.date}</p>
                            </div>
                        </div>

                        <div className="space-y-6 mb-12">
                            {lastSale.items.map((item: CartItem) => (
                                <div key={item.id} className="flex justify-between items-baseline gap-6">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black uppercase tracking-tight truncate border-b border-zinc-200 pb-1">{item.name}</p>
                                        <p className="text-[10px] font-black text-zinc-500 mt-1 uppercase tracking-widest">{item.quantity.toString().padStart(2, '0')} X {formatMoney(item.price)} FCFA</p>
                                    </div>
                                    <div className="font-black text-sm italic">{formatMoney(item.price * item.quantity)}</div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t-2 border-dashed border-zinc-300 pt-8 space-y-4">
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400"><span>NET PAYABLE</span><span className="italic">{formatMoney(lastSale.subtotal)}</span></div>
                            <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400"><span>TAX AGGR. (20%)</span><span className="italic">{formatMoney(lastSale.tax)}</span></div>
                            <div className="flex justify-between text-3xl font-black pt-6 border-t-2 border-zinc-900 mt-4 leading-none italic">
                                <span>TOTAL</span>
                                <span>{formatMoney(lastSale.total)}</span>
                            </div>
                            <div className="text-[10px] font-black text-zinc-400 uppercase text-center mt-12 tracking-[0.4em] italic">— PAIEMENT {lastSale.method} SYNC —</div>
                        </div>

                        <div className="mt-12 space-y-4 print:hidden">
                            <button onClick={handlePrintReceipt} className="w-full py-6 bg-zinc-900 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.4em] hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-4 italic shadow-2xl"><Printer className="w-5 h-5" /> EXÉCUTER THERMAL</button>
                            
                            <button 
                                onClick={async () => {
                                    const doc = await generateInvoicePDF({
                                        saleId: lastSale.id,
                                        customerName: customerName || "Client Passant",
                                        customerPhone: customerPhone,
                                        items: lastSale.items,
                                        totalAmount: lastSale.total,
                                        date: lastSale.date,
                                        storeName: "MINDOS"
                                    });
                                    doc.save(`Facture_${lastSale.id}.pdf`);
                                }} 
                                className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.4em] hover:bg-blue-500 transition-all active:scale-95 flex items-center justify-center gap-4 italic shadow-2xl shadow-blue-500/20"
                            >
                                <FileText className="w-5 h-5" /> TÉLÉCHARGER PDF
                            </button>
                            
                            {isCustomerEnabled && customerPhone && (
                                <button 
                                    onClick={() => shareViaWhatsApp({
                                        saleId: lastSale.id,
                                        customerName: customerName || "Client Passant",
                                        customerPhone: customerPhone,
                                        items: lastSale.items,
                                        totalAmount: lastSale.total,
                                        date: lastSale.date,
                                        storeName: "MINDOS"
                                    })} 
                                    className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-[11px] tracking-[0.4em] hover:bg-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-4 italic shadow-2xl shadow-emerald-500/20"
                                >
                                    <MessageCircle className="w-5 h-5" /> ENVOYER WHATSAPP
                                </button>
                            )}

                            <button 
                                onClick={() => {
                                    setShowReceipt(false);
                                    setCustomerName("");
                                    setCustomerPhone("");
                                    setIsCustomerEnabled(false);
                                }} 
                                className="w-full py-6 border-2 border-zinc-300 text-zinc-500 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.4em] hover:bg-zinc-100 transition-all italic"
                            >
                                RESET TERMINAL
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}</AnimatePresence>
        </div>
    );
}
