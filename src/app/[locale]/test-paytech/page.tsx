"use client";

import { useState } from "react";
import { initiatePayment, type PaymentResponse } from "@/lib/actions/subscription";
import { CreditCard, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function TestPaytechPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PaymentResponse | null>(null);

    const handleTestPayment = async () => {
        setLoading(true);
        setResult(null);
        try {
            // Test avec le plan STARTER (3000 FCFA)
            const res = await initiatePayment("STARTER");
            setResult(res);
            if (res.success && res.url) {
                toast.success("Redirection vers PayTech...");
                // On peut décider de ne pas rediriger automatiquement pour rester sur la page de test
                // window.location.href = res.url;
            } else {
                toast.error(res.error || "Erreur inconnue");
            }
        } catch (error) {
            setResult({ success: false, error: "Erreur lors de l'appel à l'action." });
            toast.error("Erreur de connexion.");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full bg-card border border-white/5 rounded-[2.5rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[100px] rounded-full -mr-16 -mt-16" />
                
                <div className="text-center space-y-2 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary italic">
                        Laboratoire de Paiement
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic">
                        TEST <span className="text-primary">PAYTECH.</span>
                    </h1>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                        Vérification de l'initiation de commande.
                    </p>
                </div>

                <div className="space-y-6 relative z-10">
                    <button
                        onClick={handleTestPayment}
                        disabled={loading}
                        className="w-full py-5 bg-primary text-black rounded-2xl font-black uppercase tracking-widest italic flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                        Lancer un Test (3000 F)
                    </button>

                    {result && (
                        <div className={`p-6 rounded-2xl border ${result.success ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"} animate-in fade-in slide-in-from-bottom-2`}>
                            <div className="flex items-start gap-4">
                                {result.success ? <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" /> : <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />}
                                <div className="space-y-2 overflow-hidden">
                                    <p className="text-xs font-black uppercase tracking-widest italic">
                                        {result.success ? "Initiation Réussie" : "Échec de l'Initiation"}
                                    </p>
                                    {result.success ? (
                                        <div className="space-y-4">
                                            <p className="text-[10px] text-emerald-500/70 font-bold uppercase leading-relaxed">
                                                L'URL de paiement a été générée. Vos clés API sont valides.
                                            </p>
                                            <a 
                                                href={result.url} 
                                                className="block w-full py-3 bg-white/5 border border-white/10 rounded-xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all truncate"
                                            >
                                                Ouvrir PayTech
                                            </a>
                                        </div>
                                    ) : (
                                        <p className="text-[10px] text-red-500/70 font-bold uppercase leading-relaxed break-words">
                                            {result.error}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-[9px] text-muted-foreground uppercase text-center font-black tracking-widest opacity-20">
                    MINDOS Security Lab · 2026
                </div>
            </div>
        </div>
    );
}
