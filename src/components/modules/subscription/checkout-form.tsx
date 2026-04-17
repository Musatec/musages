"use client";

import { useState } from "react";
import { Zap, ShieldCheck, ArrowLeft, Loader2, CreditCard, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { initiatePayment } from "@/lib/actions/subscription";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CheckoutFormProps {
    plan: "STARTER" | "GROWTH" | "BUSINESS";
}

const PLAN_DETAILS = {
    starter: {
        name: "Starter",
        price: "3.000",
        description: "Protocole d'entrée pour créateur solo.",
    },
    growth: {
        name: "Growth",
        price: "5.000",
        description: "Expansion réseau et optimisation multi-sites.",
    },
    business: {
        name: "Business",
        price: "7.000",
        description: "Architecture empire pour domination totale.",
    }
};

export function CheckoutForm({ plan }: CheckoutFormProps) {
    const [loading, setLoading] = useState(false);
    const [method, setMethod] = useState<"CARD" | "MOBILE">("MOBILE");
    const router = useRouter();
    const planData = PLAN_DETAILS[plan.toLowerCase() as keyof typeof PLAN_DETAILS];

    const handlePayment = async () => {
        setLoading(true);
        try {
            const result = await initiatePayment(plan);
            
            if (result.error) {
                toast.error(result.error);
                return;
            }

            toast.info(result.message);
            
            // Simulation d'une redirection PayTech
            setTimeout(() => {
                window.location.href = result.paymentUrl || "#";
            }, 1500);

        } catch (error) {
            toast.error("Une erreur est survenue lors de l'initialisation.");
        } finally {
            // On ne remet pas loading à false car on redirige
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left Column: Summary */}
            <div className="space-y-8">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest italic"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Retour
                </button>

                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary italic">
                        <Zap className="w-3 h-3" />
                        Finalisation de l'ordre
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                        RÉCAPITULATIF <br />
                        <span className="text-gray-500 text-2xl">DE VOTRE PLAN.</span>
                    </h1>
                </div>

                <div className="bg-[#0A0A0B] border border-white/5 rounded-3xl p-8 space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                    
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">{planData.name}</h2>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                                {planData.description}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-2xl font-black text-primary italic">{planData.price}</span>
                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest block">FCFA / Mois</span>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-3">
                        <SummaryItem text="Facturation mensuelle récurrente" />
                        <SummaryItem text="Accès instantané après validation" />
                        <SummaryItem text="Support technique prioritaire" />
                    </div>

                    <div className="pt-6 flex justify-between items-center bg-white/[0.02] -mx-8 -mb-8 p-8 border-t border-white/5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total à payer</span>
                        <span className="text-3xl font-black text-white italic">{planData.price} FCFA</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Payment Methods */}
            <div className="bg-[#0A0A0B] border border-white/5 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
                <div className="space-y-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 italic">Mode de Paiement</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <MethodButton 
                            active={method === "MOBILE"} 
                            onClick={() => setMethod("MOBILE")}
                            icon={Wallet}
                            label="MOBILE MONEY"
                            sub="Orange, Wave, Free"
                        />
                        <MethodButton 
                            active={method === "CARD"} 
                            onClick={() => setMethod("CARD")}
                            icon={CreditCard}
                            label="CARTE BANCAIRE"
                            sub="Visa, Mastercard"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
                        <p className="text-[10px] font-bold text-gray-500 leading-relaxed uppercase tracking-widest italic pt-0.5">
                            Transaction sécurisée par protocole <span className="text-white italic">P-TECH SSL</span>. 
                            Vos coordonnées financières ne transitent jamais par nos serveurs.
                        </p>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className={cn(
                            "w-full py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 transition-all",
                            loading 
                                ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                                : "bg-primary text-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95"
                        )}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Initialisation...
                            </>
                        ) : (
                            <>
                                Procéder au paiement
                                <Zap className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    <p className="text-[9px] text-center font-bold text-gray-600 uppercase tracking-widest italic">
                        En cliquant, vous acceptez les conditions de service de l'écosystème MINDOS.
                    </p>
                </div>
            </div>
        </div>
    );
}

function SummaryItem({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest italic text-gray-400">{text}</span>
        </div>
    );
}

function MethodButton({ active, onClick, icon: Icon, label, sub }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "p-4 rounded-2xl border transition-all text-left space-y-3 relative overflow-hidden group",
                active 
                    ? "bg-primary/5 border-primary shadow-[0_0_20px_rgba(249,115,22,0.1)]" 
                    : "bg-white/[0.02] border-white/5 hover:border-white/10"
            )}
        >
            <Icon className={cn("w-5 h-5 transition-colors", active ? "text-primary" : "text-gray-500")} />
            <div>
                <div className={cn("text-[9px] font-black uppercase tracking-widest italic", active ? "text-white" : "text-gray-400")}>
                    {label}
                </div>
                <div className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">
                    {sub}
                </div>
            </div>
            {active && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(249,115,22,1)]" />
            )}
        </button>
    );
}
