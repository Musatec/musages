"use client";

import { useState, useEffect, useMemo } from "react";
import { 
    Search, ShoppingCart, Plus, Minus, X, 
    Banknote, Smartphone, CreditCard,
    Loader2, User as UserIcon, Clock, Package,
    Phone
} from "lucide-react";
import { 
    Sheet, SheetContent, SheetTrigger 
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getProducts } from "@/lib/actions/inventory";
import { processSale } from "@/lib/actions/sales";
import { toast } from "sonner";

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    category?: string;
}

interface CartItem extends Product {
    quantity: number;
}

export function NewSaleSheet({ trigger }: { trigger: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
    const [amountPaid, setAmountPaid] = useState<string>("");
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentTime, setCurrentTime] = useState("");

    // Initial Fetch & Clock
    useEffect(() => {
        if (open) {
            getProducts().then(setProducts);
            const updateTime = () => {
                const now = new Date();
                setCurrentTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
            };
            updateTime();
            const timer = setInterval(updateTime, 60000);
            return () => clearInterval(timer);
        }
    }, [open]);

    // Logic
    const groupedProducts = useMemo(() => {
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(search.toLowerCase())
        );
        const groups: Record<string, Product[]> = {};
        filtered.forEach(p => {
            const cat = p.category || "GÉNÉRAL";
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(p);
        });
        return groups;
    }, [products, search]);

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const payingAmount = amountPaid === "" ? 0 : Number(amountPaid);
    const rest = payingAmount - total;
    const itemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { ...product, quantity: 1 }]);
        }
    };

    const updateQty = (id: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const n = Math.max(1, item.quantity + delta);
                return { ...item, quantity: n };
            }
            return item;
        }));
    };

    const handleFinalize = async () => {
        if (cart.length === 0) return;
        setIsSubmitting(true);
        try {
            const res = await processSale({
                items: cart,
                total,
                paymentMethod,
                amountPaid: payingAmount,
                customerName: customerName || "CLIENT COMPTOIR",
                customerPhone: customerPhone || undefined
            });
            if (res.success) {
                toast.success("Vente réussie ! ✨");
                setCart([]);
                setAmountPaid("");
                setCustomerName("");
                setCustomerPhone("");
                setOpen(false);
            } else {
                toast.error(res.error || "Erreur lors du paiement");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentDateLabel = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {trigger}
            </SheetTrigger>
            <SheetContent className="w-[95vw] sm:max-w-[1100px] bg-background border-border p-0 flex flex-col sm:flex-row overflow-hidden shadow-2xl rounded-l-2xl transition-colors duration-500">
                
                {/* --- LEFT SECTION: CATALOG --- */}
                <div className="flex-1 flex flex-col bg-muted/20 p-4 md:p-6 space-y-6 overflow-y-auto custom-scrollbar border-r border-border/50">
                    {/* POS Header */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-xl font-black tracking-tighter text-foreground uppercase italic leading-none">Caisse <span className="text-primary italic">MINDOS</span></h2>
                            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">
                                <span>{currentDateLabel}</span>
                                <span className="opacity-20">•</span>
                                <span className="text-primary flex items-center gap-1 font-black">
                                    <Clock className="w-2.5 h-2.5" /> {currentTime}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Search & Customer Inputs */}
                    <div className="flex flex-col xl:flex-row gap-3">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Scanner ou chercher un produit..."
                                className="w-full bg-card border border-border/10 focus:ring-1 focus:ring-primary/20 rounded-xl py-3.5 pl-12 pr-6 font-bold text-xs transition-all text-foreground placeholder:text-muted-foreground/30 shadow-sm outline-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="relative w-48 group">
                                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input 
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Nom Client"
                                    className="w-full bg-card border border-border/10 focus:ring-1 focus:ring-primary/20 rounded-xl py-3.5 pl-12 pr-6 font-bold text-xs transition-all text-foreground placeholder:text-muted-foreground/30 shadow-sm outline-none"
                                />
                            </div>
                            <div className="relative w-40 group">
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input 
                                    type="text"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="+221..."
                                    className="w-full bg-card border border-border/10 focus:ring-1 focus:ring-primary/20 rounded-xl py-3.5 pl-12 pr-6 font-bold text-xs transition-all text-foreground placeholder:text-muted-foreground/30 shadow-sm outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Catalog List */}
                    <div className="space-y-12">
                        {Object.entries(groupedProducts).map(([category, products]) => (
                            <div key={category} className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-1 bg-primary rounded-full" />
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-foreground italic">{category}</h3>
                                    <span className="text-[10px] font-black text-muted-foreground/20 ml-auto">{products.length} ARTICLES</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {products.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-3 bg-card border border-border/40 hover:border-primary/40 hover:shadow-lg transition-all rounded-xl group overflow-hidden relative">
                                            <div className="flex items-center gap-3 flex-1 relative z-10">
                                                <div className="w-10 h-10 bg-muted/40 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="text-[12px] font-black uppercase tracking-tight text-foreground block leading-none">{p.name}</span>
                                                    <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">{p.stock} UNITÉS</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-4 relative z-10">
                                                <p className="text-[13px] font-black text-foreground w-20 text-right">
                                                    {p.price.toLocaleString()} <span className="text-[9px] opacity-20 italic ml-0.5 font-black">F</span>
                                                </p>
                                                <button 
                                                    onClick={() => addToCart(p)}
                                                    className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-primary hover:text-white hover:scale-105 active:scale-90 transition-all shadow-md"
                                                >
                                                    <Plus className="w-5 h-5 stroke-[3]" />
                                                </button>
                                            </div>

                                            {/* Subtle Glow */}
                                            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/5 blur-[20px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- RIGHT SECTION: TICKET --- */}
                <div className="w-full sm:w-[380px] bg-card flex flex-col shadow-[-40px_0_100px_rgba(0,0,0,0.05)] relative z-20">
                    <div className="p-5 md:p-6 space-y-6 flex-1 flex flex-col">
                        {/* Ticket Header */}
                        <div className="flex items-center justify-between border-b border-border/10 pb-4">
                            <div className="flex flex-col gap-0.5">
                                <h3 className="text-lg font-black tracking-tighter text-foreground uppercase italic">Ticket Client</h3>
                                <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] italic">{itemsCount} ARTICLE{itemsCount > 1 ? 'S' : ''}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-muted/10 flex items-center justify-center border border-border/20 shadow-sm">
                                <ShoppingCart className="w-4 h-4 text-muted-foreground/40" />
                            </div>
                        </div>

                        {/* Cart List or Empty */}
                        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-10">
                                    <ShoppingCart className="w-24 h-24 stroke-[1]" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">Panier en attente</p>
                                </div>
                            ) : (
                                <div className="space-y-4 pr-2">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 p-3.5 bg-background rounded-xl border border-border/50 hover:border-primary/20 transition-all group relative overflow-hidden">
                                            <div className="flex-1 space-y-0.5">
                                                <p className="text-[11px] font-black uppercase tracking-tight text-foreground leading-none">{item.name}</p>
                                                <p className="text-[9px] font-black text-primary italic leading-none">{item.price.toLocaleString()} F × {item.quantity}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 bg-muted/10 rounded-lg p-1 border border-border/20">
                                                    <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-foreground hover:text-background rounded-md transition-all"><Minus className="w-3 h-3" /></button>
                                                    <span className="text-[10px] font-black w-4 text-center text-foreground">{item.quantity}</span>
                                                    <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-primary hover:text-white rounded-md transition-all"><Plus className="w-3 h-3" /></button>
                                                </div>
                                                <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-muted-foreground/20 hover:text-red-500 transition-all"><X className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-6 pt-6 border-t border-dashed border-border/20">
                            {/* Total Pill (Elite Theme) */}
                            <div className="bg-foreground text-background rounded-2xl p-6 flex justify-between items-center shadow-xl relative overflow-hidden group">
                                <div className="text-left relative z-10 text-background">
                                     <p className="text-[8px] font-black uppercase tracking-[0.4em] opacity-40 leading-tight italic">Total Net</p>
                                     <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">Payable</p>
                                </div>
                                <h2 className="text-3xl font-black tracking-tighter italic relative z-10 text-background">
                                    {total.toLocaleString()} <span className="text-lg italic opacity-30 ml-1 font-black">F</span>
                                </h2>
                                <div className="absolute top-0 right-0 w-32 h-full bg-primary/10 blur-[50px] rounded-full pointer-events-none opacity-50" />
                            </div>

                            {/* Payment Methods */}
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { id: "CASH", label: "CASH", icon: Banknote, color: "bg-emerald-500", glow: "shadow-emerald-500/20" },
                                    { id: "WAVE", label: "WAVE", icon: Smartphone, color: "bg-blue-500", glow: "shadow-blue-500/20" },
                                    { id: "ORANGE", label: "ORANGE", icon: Smartphone, color: "bg-orange-500", glow: "shadow-orange-500/20" },
                                    { id: "NON_PAYE", label: "DETTE", icon: CreditCard, color: "bg-red-500", glow: "shadow-red-500/20" },
                                ].map(m => (
                                    <button 
                                        key={m.id}
                                        onClick={() => setPaymentMethod(m.id)}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-500 group relative overflow-hidden",
                                            paymentMethod === m.id 
                                                ? (m.color + " text-white border-transparent " + m.glow + " scale-105 shadow-xl") 
                                                : "bg-background border-border text-muted-foreground hover:border-primary/30"
                                        )}
                                    >
                                        <m.icon className="w-5 h-5 relative z-10" />
                                        <span className="text-[8px] font-black tracking-[0.2em] uppercase relative z-10">{m.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Money Inputs */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Encaissé</p>
                                    <input 
                                        type="number"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-muted/10 border border-transparent focus:border-primary focus:bg-background rounded-xl py-3 px-4 text-xl font-black text-foreground transition-all text-center shadow-inner outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Reliquat</p>
                                    <div className={cn(
                                        "w-full rounded-xl py-3 px-4 flex items-center justify-center border transition-all duration-500 shadow-inner",
                                        rest < 0 
                                            ? "bg-red-500/5 border-red-500/20" 
                                            : "bg-muted/5 border-transparent opacity-30"
                                    )}>
                                        <p className={cn("text-xl font-black text-center italic tracking-tighter", rest < 0 ? "text-red-500 animate-pulse" : "text-foreground")}>
                                            {rest < 0 ? Math.abs(rest).toLocaleString() : 0} <span className="text-xs italic not-italic opacity-20">F</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleFinalize}
                                disabled={cart.length === 0 || isSubmitting}
                                className={cn(
                                    "w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.4em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 italic",
                                    (cart.length > 0 && !isSubmitting) 
                                        ? "bg-primary text-white hover:brightness-110 shadow-primary/30" 
                                        : "bg-muted text-muted-foreground opacity-10 cursor-not-allowed"
                                )}
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Valider la Vente"}
                            </button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
