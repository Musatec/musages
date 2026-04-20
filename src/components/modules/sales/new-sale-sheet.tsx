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
import { cn, formatMoney } from "@/lib/utils";
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
    isManual?: boolean;
    customName?: string;
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

    // Manual item form
    const [manualName, setManualName] = useState("");
    const [manualPrice, setManualPrice] = useState("");

    const addManualItem = () => {
        if (!manualName || !manualPrice) {
            toast.error("Nom et prix requis");
            return;
        }
        const item: CartItem = {
            id: "MANUAL_" + Date.now(),
            name: manualName,
            price: Number(manualPrice),
            stock: 0,
            quantity: 1,
            isManual: true,
            customName: manualName
        };
        setCart([...cart, item]);
        setManualName("");
        setManualPrice("");
        toast.success("Article manuel ajouté");
    };

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
                items: cart.map(item => ({
                    id: item.isManual ? "MANUAL" : item.id,
                    name: item.isManual ? item.customName : undefined,
                    quantity: item.quantity,
                    price: item.price
                })),
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
                // Trigger refresh if needed
                window.location.reload(); 
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
            <SheetContent className="w-[95vw] sm:max-w-[1100px] bg-background border-border p-0 flex flex-col sm:flex-row overflow-hidden shadow-2xl rounded-l-2xl">
                
                {/* --- CATALOG --- */}
                <div className="flex-1 flex flex-col bg-muted/20 p-4 md:p-6 space-y-6 overflow-y-auto custom-scrollbar border-r border-border/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold tracking-tight text-foreground uppercase">Caisse <span className="text-primary italic">MINDOS</span></h2>
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
                                <span>{currentDateLabel}</span>
                                <span className="opacity-20">•</span>
                                <span className="text-primary flex items-center gap-1 font-bold">
                                    <Clock className="w-3 h-3" /> {currentTime}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-3">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <input 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher un article..."
                                className="w-full bg-card border border-border rounded-xl py-3 pl-11 pr-4 text-xs font-semibold focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="relative w-48 group">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input 
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Client"
                                    className="w-full bg-card border border-border rounded-xl py-3 pl-11 pr-4 text-xs font-semibold focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-sm"
                                />
                            </div>
                            <div className="relative w-40 group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input 
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    placeholder="WhatsApp"
                                    className="w-full bg-card border border-border rounded-xl py-3 pl-11 pr-4 text-xs font-semibold focus:ring-1 focus:ring-primary/20 outline-none transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-1 bg-emerald-500 rounded-full" />
                            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Saisie Manuelle</h3>
                        </div>
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex flex-col xl:flex-row gap-3">
                            <input 
                                value={manualName}
                                onChange={(e) => setManualName(e.target.value)}
                                placeholder="Nom de l'article..."
                                className="flex-1 bg-white/5 border border-border/50 rounded-xl px-4 py-3 text-xs font-semibold focus:border-emerald-500/50 outline-none transition-all"
                            />
                            <div className="flex gap-2">
                                <input 
                                    type="number"
                                    value={manualPrice}
                                    onChange={(e) => setManualPrice(e.target.value)}
                                    placeholder="Prix"
                                    className="w-24 bg-white/5 border border-border/50 rounded-xl px-4 py-3 text-xs font-semibold focus:border-emerald-500/50 outline-none transition-all"
                                />
                                <button 
                                    onClick={addManualItem}
                                    className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> AJOUTER
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {Object.entries(groupedProducts).map(([category, products]) => (
                            <div key={category} className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-1 bg-primary rounded-full" />
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">{category}</h3>
                                    <span className="text-[10px] font-bold text-muted-foreground/40 ml-auto">{products.length} EN STOCK</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {products.map(p => (
                                        <div key={p.id} className="flex items-center justify-between p-3 bg-card border border-border/40 hover:border-primary/40 hover:shadow-md transition-all rounded-xl group relative overflow-hidden">
                                            <div className="flex items-center gap-3 flex-1">
                                                <div className="w-10 h-10 bg-muted/40 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="text-xs font-bold uppercase tracking-tight text-foreground block leading-none">{p.name}</span>
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-40">{p.stock} EN STOCK</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-sm font-bold text-foreground">
                                                    {formatMoney(p.price)} F
                                                </p>
                                                <button 
                                                    onClick={() => addToCart(p)}
                                                    className="w-10 h-10 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-md active:scale-90"
                                                >
                                                    <Plus className="w-5 h-5 stroke-[3]" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- TICKET --- */}
                <div className="w-full sm:w-[400px] bg-card flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.05)] border-l border-border/50">
                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center justify-between border-b border-border/10 pb-4 mb-6">
                            <div className="flex flex-col gap-0.5">
                                <h3 className="text-lg font-bold tracking-tight text-foreground uppercase">Ticket Client</h3>
                                <p className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest">{itemsCount} ARTICLE{itemsCount > 1 ? 'S' : ''}</p>
                            </div>
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm text-primary">
                                <ShoppingCart className="w-4 h-4" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar space-y-3">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-4">
                                    <ShoppingCart className="w-16 h-16 stroke-[1.5]" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.4em]">Panier Vide</p>
                                </div>
                            ) : cart.map(item => (
                                <div key={item.id} className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                                    item.isManual ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/20 border-border/50"
                                )}>
                                    <div className="flex-1 space-y-0.5">
                                        <p className="text-[11px] font-bold uppercase tracking-tight text-foreground leading-none">
                                            {item.name} {item.isManual && <span className="text-[8px] opacity-40 italic ml-1">(MANUEL)</span>}
                                        </p>
                                        <p className="text-[10px] font-bold text-primary leading-none">{formatMoney(item.price)} F × {item.quantity}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1.5 bg-background rounded-lg p-1 border border-border">
                                            <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-primary hover:text-white rounded-md transition-all"><Minus className="w-3 h-3" /></button>
                                            <span className="text-[10px] font-bold w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-primary hover:text-white rounded-md transition-all"><Plus className="w-3 h-3" /></button>
                                        </div>
                                        <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-muted-foreground/20 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-dashed border-border/30 space-y-6">
                            <div className="bg-foreground text-background rounded-2xl p-5 flex justify-between items-center shadow-lg overflow-hidden relative">
                                <div className="space-y-0.5 relative z-10">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Total Net</p>
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight relative z-10">
                                    {formatMoney(total)} <span className="text-sm opacity-40">F</span>
                                </h2>
                                <div className="absolute top-0 right-0 w-32 h-full bg-primary/10 blur-[40px] pointer-events-none opacity-50" />
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { id: "CASH", label: "CASH", icon: Banknote, color: "bg-emerald-500" },
                                    { id: "WAVE", label: "WAVE", icon: Smartphone, color: "bg-blue-500" },
                                    { id: "ORANGE", label: "ORANGE", icon: Smartphone, color: "bg-orange-500" },
                                    { id: "NON_PAYE", label: "DETTE", icon: CreditCard, color: "bg-red-500" },
                                ].map(m => (
                                    <button 
                                        key={m.id}
                                        onClick={() => setPaymentMethod(m.id)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                                            paymentMethod === m.id 
                                                ? (m.color + " text-white border-transparent shadow-lg scale-105") 
                                                : "bg-background border-border text-muted-foreground hover:bg-muted"
                                        )}
                                    >
                                        <m.icon className="w-4 h-4" />
                                        <span className="text-[8px] font-bold tracking-wider uppercase">{m.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Encaissé</p>
                                    <input 
                                        type="number"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(e.target.value)}
                                        placeholder="0"
                                        className="w-full bg-muted/20 border border-border focus:ring-2 focus:ring-primary/10 rounded-xl py-3 px-4 text-xl font-bold text-foreground transition-all text-center outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 ml-1">Reliquat</p>
                                    <div className={cn(
                                        "w-full rounded-xl py-3 px-4 flex items-center justify-center border transition-all",
                                        rest < 0 ? "bg-red-500/5 border-red-500/20" : "bg-muted/30 border-transparent opacity-60"
                                    )}>
                                        <p className={cn("text-xl font-bold tracking-tight", rest < 0 ? "text-red-500" : "text-foreground")}>
                                            {rest < 0 ? formatMoney(Math.abs(rest)) : 0} <span className="text-xs opacity-40">F</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={handleFinalize}
                                disabled={cart.length === 0 || isSubmitting}
                                className={cn(
                                    "w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3",
                                    (cart.length > 0 && !isSubmitting) 
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20" 
                                        : "bg-muted text-muted-foreground opacity-20 cursor-not-allowed"
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
