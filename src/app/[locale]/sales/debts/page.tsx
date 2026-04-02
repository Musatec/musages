"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { 
    CreditCard, Search, Banknote, 
    AlertCircle, MessageSquare,
    RefreshCcw
} from "lucide-react";
import { getDebts, registerDebtPayment } from "@/lib/actions/debts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DebtsPage() {
    const [loading, setLoading] = useState(true);
    const [debts, setDebts] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getDebts();
            setDebts(data.debts || []);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const metrics = useMemo(() => {
        const total = debts.reduce((acc, d) => acc + (d.totalAmount - d.amountPaid), 0);
        const critical = debts.filter(d => {
            const diff = new Date().getTime() - new Date(d.createdAt).getTime();
            return diff > 3 * 24 * 60 * 60 * 1000;
        }).length;
        return { total, critical, count: debts.length };
    }, [debts]);

    const handleWhatsApp = (phone: string, customer: string, amount: number, invId: string) => {
        if (!phone) { toast.error("Aucun numéro enregistré"); return; }
        const cleanPhone = phone.replace(/\D/g, '');
        const message = encodeURIComponent(`Bonjour ${customer}, c'est MINDOS ERP. Rappel facture #INV-${invId.slice(-6).toUpperCase()}. Solde : ${amount.toLocaleString()} FCFA. Merci ! ✨`);
        window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
    };

    const handlePayment = async (dId: string, amount: number, customer: string) => {
        const pay = prompt(`💸 ENCAISSEMENT : ${customer}\nSolde : ${amount.toLocaleString()} F\nMontant versé :`);
        if (!pay || isNaN(Number(pay))) return;
        try {
            const res = await registerDebtPayment(dId, Number(pay));
            if (res.success) { 
                toast.success(`Encaissement de ${pay} F validé ! ✨✅`); 
                fetchData(); 
            } else {
                toast.error(res.error);
            }
        } catch (e) { toast.error("Erreur technique"); }
    };

    const filteredDebts = debts.filter(d => (d.customerName || "").toLowerCase().includes(search.toLowerCase()) || d.id.includes(search));

    return (
        <div className="p-4 md:p-6 space-y-6 bg-background text-foreground transition-all duration-500 overflow-y-auto custom-scrollbar min-h-screen">
            
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
                <div className="space-y-0.5">
                    <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none text-foreground">
                        Protocole <span className="text-primary italic">Recouvrement.</span>
                    </h1>
                    <p className="text-[8px] text-muted-foreground/30 font-black tracking-[0.2em] uppercase">Monitor Alpha | {debts.length} Dossiers Actifs</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 p-1 bg-muted/20 border border-border rounded-lg group focus-within:ring-1 ring-primary/20 h-9">
                        <Search className="w-3.5 h-3.5 ml-2 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="FILTRER..." className="bg-transparent border-none outline-none py-1.5 px-0.5 w-32 text-[8px] uppercase font-black tracking-widest placeholder:text-muted-foreground/20" />
                    </div>
                    <button onClick={fetchData} className="p-2.5 bg-muted/30 border border-border rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm">
                        <RefreshCcw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                    { label: "Pool Recouvrement", value: metrics.total, icon: Banknote, color: "text-primary" },
                    { label: "Risque Critique (>3j)", value: metrics.critical, icon: AlertCircle, color: "text-red-500", animated: true },
                    { label: "Dossiers Actifs", value: metrics.count, icon: CreditCard, color: "text-muted-foreground" },
                ].map((m, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-4 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col gap-1.5">
                            <div className={cn("inline-flex items-center gap-2 opacity-50", m.color)}>
                                <AlertCircle className={cn("w-3.5 h-3.5", i === 1 && "animate-pulse")} />
                                <p className="text-[8px] font-black uppercase tracking-widest leading-none">{m.label}</p>
                            </div>
                            <h2 className="text-xl font-black text-foreground italic tracking-tight uppercase leading-none">
                                {typeof m.value === 'number' ? new Intl.NumberFormat('fr-FR').format(m.value) : m.value}
                                <span className="text-[9px] opacity-20 ml-1 font-black">{i === 0 ? 'F' : 'Units'}</span>
                            </h2>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {loading ? (
                    Array(4).fill(0).map((_, i) => <div key={i} className="h-48 bg-muted/20 animate-pulse rounded-xl border border-border" />)
                ) : filteredDebts.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl opacity-10 italic uppercase tracking-[0.4em] text-[10px]">Registry Empty</div>
                ) : filteredDebts.map((debt: any) => {
                    const remaining = debt.totalAmount - debt.amountPaid;
                    const diffDays = Math.floor((new Date().getTime() - new Date(debt.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                    const isCritical = diffDays > 3;

                    return (
                        <div key={debt.id} className="bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between h-full min-h-[200px]">
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-widest italic">#ID-{debt.id.slice(-4).toUpperCase()}</span>
                                        <h3 className="text-sm font-black text-foreground tracking-tighter uppercase italic leading-tight truncate max-w-[130px]">{debt.customerName || "Passant Alpha"}</h3>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className={cn( "w-1 h-1 rounded-full", isCritical ? "bg-red-500 animate-ping" : "bg-emerald-500" )} />
                                            <p className="text-[7px] font-black text-muted-foreground/30 uppercase tracking-widest italic leading-none">{diffDays} Jours</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "px-1.5 py-0.5 rounded text-[6px] font-black uppercase tracking-widest border shadow-inner",
                                        isCritical ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-muted/10 border-border text-muted-foreground/40"
                                    )}>
                                        {isCritical ? "CRITICAL" : "NORMAL"}
                                    </div>
                                </div>
                                <div className="p-3 bg-muted/5 border border-border/5 rounded-lg space-y-1">
                                    <div className="flex justify-between items-center text-[7px] font-black uppercase text-muted-foreground/30 italic">
                                        <span>Total</span>
                                        <span>{debt.totalAmount.toLocaleString()} F</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-0.5">
                                        <span className="text-[7px] font-black uppercase tracking-widest text-primary italic">Solde</span>
                                        <span className="text-lg font-black text-foreground tracking-tighter italic leading-none">{remaining.toLocaleString()} <span className="text-[7px] italic opacity-20 ml-0.5 uppercase">FCFA</span></span>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-3 grid grid-cols-2 gap-2 border-t border-border/10 mt-3">
                                <button onClick={() => handleWhatsApp(debt.customerPhone || "", debt.customerName, remaining, debt.id)} className="bg-emerald-500/10 border border-emerald-500/10 hover:bg-emerald-500 hover:text-white transition-all py-2.5 px-2 rounded-lg text-[7px] font-black uppercase tracking-widest shadow-sm active:scale-95 flex items-center justify-center gap-2 text-emerald-500">
                                    <MessageSquare className="w-3.5 h-3.5" /> RELANCE
                                </button>
                                <button onClick={() => handlePayment(debt.id, remaining, debt.customerName)} className="bg-primary text-black hover:bg-primary/90 transition-all py-2.5 px-2 rounded-lg text-[7px] font-black uppercase tracking-widest shadow-lg active:scale-95 flex items-center justify-center gap-2 italic">
                                    <Banknote className="w-3.5 h-3.5 stroke-[3]" /> PAY
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
