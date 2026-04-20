"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { 
    CreditCard, Search, Banknote, 
    AlertCircle, MessageSquare,
    RefreshCcw, Clock, ArrowRight,
    TrendingDown, ShieldAlert,
    Filter,
    ChevronRight,
    ExternalLink
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { getDebts, registerDebtPayment } from "@/lib/actions/debts";
import { toast } from "sonner";
import { cn, formatMoney } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { EliteMetricCard } from "@/components/ui/metric-card";
import { ElitePageHeader } from "@/components/ui/page-header";

interface Debt {
    id: string;
    customerName: string | null;
    customerPhone: string | null;
    totalAmount: number;
    amountPaid: number;
    status: string;
    createdAt: string | Date;
}

export default function DebtsPage() {
    const [loading, setLoading] = useState(true);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [search, setSearch] = useState("");
    const [paymentSheet, setPaymentSheet] = useState({ isOpen: false, id: "", maxAmount: 0, customer: "" });
    const [payAmount, setPayAmount] = useState("");

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
        if (!phone) { 
            toast.error("Aucun numéro de téléphone enregistré."); 
            return; 
        }
        
        const cleanPhone = phone.replace(/\D/g, '');
        const invoiceRef = invId.slice(-6).toUpperCase();
        const receiptUrl = `${window.location.origin}/r/${invId}`;
        
        const message = `*RAPPEL DE PAIEMENT - MUSAGES*\n\n` +
            `Bonjour ${customer || 'Cher Client'},\n\n` +
            `Nous vous contactons concernant votre facture *#INV-${invoiceRef}*.\n` +
            `Un solde de *${amount.toLocaleString()} FCFA* reste en attente de règlement.\n\n` +
            `🔗 Détails complets de votre facture :\n${receiptUrl}\n\n` +
            `Merci de bien vouloir passer à la boutique pour régulariser votre situation.\n\n` +
            `_Ceci est un message automatique de votre système de gestion Musages._`;

        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handlePayment = (dId: string, amount: number, customer: string) => {
        setPaymentSheet({ isOpen: true, id: dId, maxAmount: amount, customer: customer || 'Client' });
        setPayAmount(amount.toString());
    };

    const submitPayment = async () => {
        const numAmount = Number(payAmount);
        if (isNaN(numAmount) || numAmount <= 0) return toast.error("Montant invalide");
        
        try {
            const res = await registerDebtPayment(paymentSheet.id, numAmount);
            if (res.success) { 
                toast.success(`Encaissement validé.`); 
                setPaymentSheet(prev => ({ ...prev, isOpen: false }));
                fetchData(); 
            } else {
                toast.error(res.error);
            }
        } catch (e) { toast.error("Erreur technique"); }
    };

    const filteredDebts = debts.filter(d => (d.customerName || "").toLowerCase().includes(search.toLowerCase()) || d.id.includes(search));

    return (
        <div className="flex-1 flex flex-col h-full bg-background transition-all duration-300 overflow-y-auto p-6 md:p-8 space-y-4">
            <ElitePageHeader 
                title="Recouvrements & Créances."
                subtitle="Suivi de Trésorerie"
                description="Supervisez les factures impayées, gérez les relances clients et suivez l'évolution de vos créances en temps réel."
                actions={
                    <div className="flex items-center gap-3">
                         <div className="relative group w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <input 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                                placeholder="Rechercher #INV / Client..." 
                                className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/40 shadow-sm"
                            />
                        </div>
                        <button onClick={() => fetchData()} className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                            <RefreshCcw className="w-5 h-5" />
                        </button>
                    </div>
                }
            />

            {/* --- STRATEGIC METRICS (Elite SaaS) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <EliteMetricCard 
                    label="Total à Recouvrer" 
                    value={`${formatMoney(metrics.total)} F`} 
                    icon={Banknote} 
                    variant="blue"
                    sub="Cumul des dettes actives"
                />
                <EliteMetricCard 
                    label="Dossiers Critiques" 
                    value={metrics.critical} 
                    icon={AlertCircle} 
                    variant="red"
                    sub="Plus de 3 jours de retard"
                />
                <EliteMetricCard 
                    label="Nombre de Créances" 
                    value={metrics.count} 
                    icon={CreditCard} 
                    variant="purple"
                    sub="Dossiers en cours"
                />
            </div>

            {/* --- DEBT TABLE --- */}
            <div className="bg-card border border-border shadow-sm rounded-xl overflow-hidden min-h-[500px] flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-separate border-spacing-0">
                        <thead className="bg-muted/10 text-muted-foreground text-xs font-semibold border-b border-border">
                            <tr>
                                <th className="px-6 py-4">Dossier / Facture</th>
                                <th className="px-6 py-4">Client / Contact</th>
                                <th className="px-6 py-4 text-center">Âge Créance</th>
                                <th className="px-6 py-4 text-center">Niveau Risque</th>
                                <th className="px-6 py-4 text-right">Reste à payer</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-6"><div className="h-10 bg-muted/30 rounded-lg w-full" /></td>
                                    </tr>
                                ))
                            ) : filteredDebts.length === 0 ? (
                                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground italic">Aucune créance détectée.</td></tr>
                            ) : filteredDebts.map((debt: any) => {
                                const remaining = debt.totalAmount - debt.amountPaid;
                                const diffDays = Math.floor((new Date().getTime() - new Date(debt.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                                const isCritical = diffDays > 3;

                                return (
                                    <tr key={debt.id} className="group hover:bg-muted/20 transition-all">
                                        <td className="px-6 py-5 font-mono text-xs text-foreground font-bold italic">
                                            #INV-{debt.id.slice(-6).toUpperCase()}
                                            <span className="block text-[10px] font-normal text-muted-foreground not-italic mt-0.5">{new Date(debt.createdAt).toLocaleDateString('fr-FR')}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="block font-bold text-foreground text-sm uppercase mb-0.5">{debt.customerName || "CLIENT PASSANT"}</span>
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase font-mono tracking-tight">{debt.customerPhone || 'AUCUN CONTACT'}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={cn("text-base font-bold", isCritical ? "text-red-500" : "text-foreground")}>{diffDays} Jours</span>
                                                <div className={cn("h-1 w-12 rounded-full", isCritical ? "bg-red-500" : "bg-muted")} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={cn(
                                                "px-3 py-1 rounded-md text-[10px] font-bold border block w-fit mx-auto shadow-sm",
                                                isCritical ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                            )}>
                                                {isCritical ? 'CRITIQUE' : 'NORMAL'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-4">
                                                <div className="text-right">
                                                    <span className="block text-lg font-bold text-foreground">{formatMoney(remaining)} F</span>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleWhatsApp(debt.customerPhone || "", debt.customerName, remaining, debt.id)}
                                                        className="p-2 border border-emerald-500/20 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors shadow-sm"
                                                        title="Envoyer rappel"
                                                    >
                                                        <FaWhatsapp className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handlePayment(debt.id, remaining, debt.customerName)}
                                                        className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-2"
                                                    >
                                                        <Banknote className="w-3.5 h-3.5" /> ENCAISSER
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Sheet open={paymentSheet.isOpen} onOpenChange={(isOpen) => setPaymentSheet(prev => ({ ...prev, isOpen }))}>
                <SheetContent side="right" className="sm:max-w-md bg-card border-l border-border p-8">
                    <SheetHeader className="mb-10 text-left">
                         <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl w-fit mb-4">
                            <Banknote className="w-5 h-5 text-primary" />
                        </div>
                        <SheetTitle className="text-2xl font-bold">Règlement de Créance</SheetTitle>
                        <SheetDescription className="text-sm text-muted-foreground">Enregistrez un versement total ou partiel du client.</SheetDescription>
                    </SheetHeader>

                    <div className="space-y-8">
                         <div className="bg-muted/30 border border-border rounded-2xl p-6 space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-muted-foreground uppercase">Client</span>
                                <span className="font-bold text-foreground uppercase">{paymentSheet.customer}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-border/50">
                                <span className="font-semibold text-muted-foreground uppercase">Reste à payer</span>
                                <span className="font-bold text-lg text-red-500">{formatMoney(paymentSheet.maxAmount)} F</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground ml-1 uppercase">Montant encaissé :</label>
                            <div className="relative">
                                <input 
                                    type="number"
                                    value={payAmount}
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    max={paymentSheet.maxAmount}
                                    className="w-full bg-muted/20 border border-border focus:ring-1 focus:ring-primary/20 focus:border-primary/50 text-foreground p-5 rounded-xl text-3xl font-bold text-center outline-none transition-all"
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground opacity-40">F</div>
                            </div>
                        </div>

                        <button 
                            onClick={submitPayment}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all active:scale-95"
                        >
                            Valider l'encaissement
                        </button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
