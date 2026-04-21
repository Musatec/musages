"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { getSalePublicData } from "@/lib/actions/sales";
import { 
    Printer, 
    Download, 
    Loader2, 
    ShieldCheck, 
    Calendar, 
    Hash,
    Building2,
    MapPin,
    AlertCircle,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SaleItem {
    id: string;
    quantity: number;
    price: number;
    product: { name: string };
}

interface SaleReceipt {
    id: string;
    totalAmount: number;
    createdAt: string | Date;
    customerName: string | null;
    items: SaleItem[];
    store: {
        name: string;
        address: string | null;
        config: any;
    } | null;
}

function ReceiptContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [sale, setSale] = useState<SaleReceipt | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSale = async () => {
            if (!params.id) return;
            const res = await getSalePublicData(params.id as string);
            if (res.success) {
                setSale(res.sale as any);
            } else {
                setError(res.error || "Référence de facture introuvable.");
            }
            setLoading(false);
        };
        fetchSale();
    }, [params.id]);

    useEffect(() => {
        if (!loading && sale && searchParams.get('print') === 'true') {
            const timeout = setTimeout(() => window.print(), 800);
            return () => clearTimeout(timeout);
        }
    }, [loading, sale, searchParams]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 space-y-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">Récupération de votre facture...</p>
            </div>
        );
    }

    if (error || !sale) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-8">
                <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <div className="space-y-3">
                    <h1 className="text-3xl font-bold text-foreground">Accès Impossible</h1>
                    <p className="text-sm font-medium text-muted-foreground max-w-xs mx-auto">{error || "Cette transaction n'existe pas ou le lien a expiré."}</p>
                </div>
                <div className="h-px w-16 bg-border mx-auto" />
            </div>
        );
    }

    const vatRate = sale.store?.config?.vatRate || 18;
    const subtotal = sale.totalAmount / (1 + (vatRate / 100)); 
    const tax = sale.totalAmount - subtotal;
    const date = new Date(sale.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="min-h-screen bg-muted/30 text-foreground selection:bg-primary selection:text-primary-foreground print:bg-white">
            
            <nav className="max-w-4xl mx-auto px-6 py-8 md:px-0 flex items-center justify-between print:hidden">
                <div className="flex flex-col">
                    <div className="text-2xl font-bold tracking-tight">
                        {sale.store?.name || 'MINDOS'} <span className="text-primary">ERP.</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Portail Client Sécurisé</span>
                </div>
                
                <button 
                    onClick={handlePrint}
                    className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl flex items-center gap-3 text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all outline-none"
                >
                    <Printer className="w-4 h-4" />
                    IMPRIMER
                </button>
            </nav>

            <main className="max-w-4xl mx-auto p-6 md:pb-24 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
                
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 print:hidden">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-0.5 bg-emerald-500 rounded-full" />
                             <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Paiement Confirmé</span>
                             <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground uppercase">
                           Facture <span className="text-primary block md:inline">#REF-{sale.id.slice(-6).toUpperCase()}</span>
                        </h2>
                    </div>

                    <div className="flex flex-col gap-3">
                         <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground uppercase tracking-tight">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{date}</span>
                         </div>
                         <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground uppercase tracking-tight">
                            <Hash className="w-4 h-4 text-primary" />
                            <span>Client : {sale.customerName || 'Standard'}</span>
                         </div>
                    </div>
                </header>

                <div className="relative">
                    <div className="absolute -top-12 inset-x-0 h-40 bg-gradient-to-b from-primary/5 to-transparent blur-3xl pointer-events-none opacity-50" />
                    
                    <div className={cn(
                        "bg-white text-zinc-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-20 shadow-2xl relative overflow-hidden font-sans border border-border/50",
                        "print:rounded-none print:shadow-none print:w-full print:p-8 print:border-none"
                    )}>
                        
                        <div className="text-center mb-10 md:mb-16 border-b border-zinc-100 pb-10 md:pb-16 space-y-4">
                            {sale.store?.config?.logo ? (
                                <div className="flex justify-center mb-6">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden relative border border-zinc-100 shadow-sm p-2 bg-white">
                                         <img src={sale.store.config.logo} alt="Logo" className="w-full h-full object-contain" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-center mb-6">
                                    <Building2 className="w-10 h-10 md:w-12 md:h-12 text-zinc-200" />
                                </div>
                            )}
                            <div className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 uppercase leading-tight">{sale.store?.name || 'MINDOS STORE'}</div>
                            
                            <div className="flex flex-col items-center gap-1.5 pt-4">
                                <span className="flex items-start gap-2 text-[10px] md:text-xs font-semibold text-zinc-400 max-w-sm mx-auto text-center px-4">
                                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 hidden sm:block" /> {sale.store?.address || 'Adresse non renseignée'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-12 gap-2 pb-4 border-b border-zinc-100 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                <div className="col-span-2 md:col-span-1">Qté</div>
                                <div className="col-span-6 md:col-span-7">Désignation</div>
                                <div className="col-span-4 text-right">Montant</div>
                            </div>

                            {sale.items.map((item: any) => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-2 md:col-span-1">
                                        <span className="w-7 h-7 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center text-[10px] font-bold text-zinc-600">{item.quantity}</span>
                                    </div>
                                    <div className="col-span-6 md:col-span-7 pr-2 md:pr-4">
                                        <p className="font-bold uppercase tracking-tight text-xs md:text-sm text-zinc-900 leading-tight">{item.product?.name || 'Article'}</p>
                                        <p className="text-[8px] md:text-[9px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">{item.price.toLocaleString()} F / UNITE</p>
                                    </div>
                                    <div className="col-span-4 font-bold text-sm md:text-base tabular-nums tracking-tight text-right">{(item.price * item.quantity).toLocaleString()} F</div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 md:mt-16 pt-8 md:pt-12 border-t border-zinc-100 space-y-4">
                            <div className="flex justify-between text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                                <span>Total Hors Taxe</span>
                                <span className="tabular-nums">{Math.round(subtotal).toLocaleString()} F</span>
                            </div>
                            <div className="flex justify-between text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-400">
                                <span>TVA ({vatRate}%)</span>
                                <span className="tabular-nums">{Math.round(tax).toLocaleString()} F</span>
                            </div>
                            
                            <div className="flex justify-between items-end pt-8 border-t-4 border-double border-zinc-100 mt-8 md:mt-10">
                                <span className="text-sm md:text-lg font-black uppercase tracking-tighter text-zinc-400">Total payé</span>
                                <span className="text-3xl md:text-5xl font-black tracking-tighter tabular-nums text-zinc-900 leading-none">
                                    {sale.totalAmount.toLocaleString()} <span className="text-[10px] md:text-sm font-bold opacity-30">FCFA</span>
                                </span>
                            </div>

                            <div className="pt-12 md:pt-20 flex flex-col items-center gap-6 opacity-40">
                                <div className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] text-center px-4">Merci de votre confiance !</div>
                                <div className="h-px w-16 md:w-20 bg-zinc-200" />
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="pt-12 flex flex-col items-center gap-6 print:hidden">
                    <div className="flex items-center gap-6">
                        <button onClick={handlePrint} className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                            <Download className="w-4 h-4" /> Télécharger en PDF
                        </button>
                        <div className="w-1 h-1 bg-border rounded-full" />
                        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                             <ShieldCheck className="w-4 h-4" /> Document Officiel
                        </span>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.3em]">MINDOS ERP • Plateforme de Gestion Unifiée</p>
                </footer>
            </main>
        </div>
    );
}

export default function PublicReceiptPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 space-y-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        }>
            <ReceiptContent />
        </Suspense>
    );
}
