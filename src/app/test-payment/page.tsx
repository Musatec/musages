"use client";

import { useState } from "react";
import { initiatePayment } from "@/lib/actions/subscription";
import { CreditCard, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
export default function TestPaymentPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; url?: string; error?: string } | null>(null);

    const handleTestPayment = async () => {
        setIsLoading(true);
        setResult(null);
        try {
            const res = await initiatePayment("STARTER");
            if (res.success && res.url) {
                setResult({ success: true, url: res.url });
                toast.success("Redirection vers PayTech...");
                setTimeout(() => {
                    window.location.href = res.url!;
                }, 2000);
            } else {
                setResult({ success: false, error: res.error });
                toast.error(res.error || "Une erreur est survenue");
            }
        } catch (error) {
            setResult({ success: false, error: "Erreur de communication" });
            toast.error("Erreur de communication avec le serveur");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100 p-4 font-sans">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl bg-opacity-80">
                <div className="p-8">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                        <CreditCard className="w-7 h-7 text-orange-500" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                        Test PayTech
                    </h1>
                    <p className="text-zinc-400 mb-8 leading-relaxed">
                        Vérifiez votre configuration de paiement en lançant une transaction de test réelle.
                    </p>

                    <div className="space-y-4">
                        <div className="p-5 rounded-xl bg-zinc-800/30 border border-zinc-700/50 space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500">Produit</span>
                                <span className="font-medium">Pack Starter</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500">Montant</span>
                                <span className="font-bold text-orange-500 text-lg">3 000 FCFA</span>
                            </div>
                            <div className="flex justify-between items-center text-xs pt-2 border-t border-zinc-700/30">
                                <span className="text-zinc-500">Environnement</span>
                                <span className="px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300">
                                    {process.env.NODE_ENV === 'production' ? 'PROD' : 'TEST'}
                                </span>
                            </div>
                        </div>

                        {result && !result.success && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-bold mb-1">Échec de l'initialisation</p>
                                    <p className="opacity-80">{result.error}</p>
                                </div>
                            </div>
                        )}

                        {result && result.success && (
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-emerald-400 animate-in fade-in slide-in-from-top-2">
                                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-bold mb-1">Lien généré avec succès</p>
                                    <p className="opacity-80">Redirection vers PayTech dans quelques instants...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 pt-0">
                    <button 
                        onClick={handleTestPayment} 
                        className="group relative w-full h-14 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)] active:scale-[0.98]" 
                        disabled={isLoading || (result?.success ?? false)}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span>Traitement...</span>
                            </>
                        ) : (
                            <>
                                <span>Lancer le paiement test</span>
                                <CreditCard className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </button>
                    
                    <p className="mt-4 text-center text-[10px] text-zinc-600 uppercase tracking-widest">
                        Système Sécurisé par PayTech SN
                    </p>
                </div>
            </div>
        </div>
    );
}

