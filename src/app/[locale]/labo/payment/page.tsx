"use client";

import { useState, useEffect } from "react";
import { 
    CreditCard, 
    Smartphone, 
    Wallet, 
    Banknote, 
    CheckCircle2, 
    ChevronRight, 
    ArrowLeft,
    ShieldCheck,
    Lock,
    QrCode,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

const PAYMENT_METHODS = [
    { id: "cash", label: "Espèces", icon: Banknote, color: "bg-emerald-500", desc: "Encaissement direct en caisse" },
    { id: "wave", label: "Wave", icon: Smartphone, color: "bg-blue-400", desc: "Paiement via QR Code / Réseau" },
    { id: "om", icon: Wallet, label: "Orange Money", color: "bg-orange-500", desc: "Paiement via mobile" },
    { id: "card", label: "Carte Bancaire", icon: CreditCard, color: "bg-indigo-600", desc: "Visa, Mastercard, GIM-UEMOA" },
];

export default function PaymentSimulator() {
    const [step, setStep] = useState<"select" | "process" | "success">("select");
    const [selectedMethod, setSelectedMethod] = useState<typeof PAYMENT_METHODS[0] | null>(null);
    const [amount, setAmount] = useState(15750);
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = () => {
        setIsLoading(true);
        setStep("process");
        // Simulate network delay
        setTimeout(() => {
            setIsLoading(false);
            setStep("success");
            toast.success("Paiement validé avec succès ! ✨");
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-[#070707] text-white p-4 md:p-8 flex items-center justify-center font-sans">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-xl relative z-10">
                <AnimatePresence mode="wait">
                    {step === "select" && (
                        <motion.div 
                            key="select"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight">Checkout Sécurisé</h1>
                                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Simulator v1.0</p>
                                </div>
                            </div>

                            {/* Order Summary Card */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 backdrop-blur-3xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <QrCode className="w-24 h-24" />
                                </div>
                                <div className="space-y-1 relative z-10">
                                    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Montant Total à régler</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black tracking-tighter">{amount.toLocaleString()}</span>
                                        <span className="text-xl font-bold text-primary">FCFA</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-2 mb-1">Choisir la méthode de paiement</p>
                                {PAYMENT_METHODS.map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedMethod(method)}
                                        className={cn(
                                            "flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 group",
                                            selectedMethod?.id === method.id 
                                                ? "bg-primary border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                                                : "bg-white/5 border-white/10 hover:border-white/30"
                                        )}
                                    >
                                        <div className="flex items-center gap-4 text-left">
                                            <div className={cn(
                                                "w-12 h-12 rounded-xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110",
                                                selectedMethod?.id === method.id ? "bg-white/20" : method.color
                                            )}>
                                                <method.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm tracking-tight">{method.label}</p>
                                                <p className={cn(
                                                    "text-[10px] opacity-60",
                                                    selectedMethod?.id === method.id ? "text-white/80" : "text-white/40"
                                                )}>{method.desc}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className={cn(
                                            "w-5 h-5 transition-transform",
                                            selectedMethod?.id === method.id ? "translate-x-1" : "opacity-20 group-hover:opacity-100"
                                        )} />
                                    </button>
                                ))}
                            </div>

                            <button 
                                disabled={!selectedMethod}
                                onClick={handlePayment}
                                className="w-full py-5 bg-white text-black rounded-[1.5rem] font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-20 disabled:grayscale mt-4 relative overflow-hidden group"
                            >
                                <span className="relative z-10">Confirmer le paiement</span>
                                <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                            </button>
                        </motion.div>
                    )}

                    {step === "process" && (
                        <motion.div 
                            key="process"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-12 backdrop-blur-3xl text-center space-y-8 min-h-[400px] flex flex-col items-center justify-center"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                                <div className="w-24 h-24 rounded-full border-2 border-white/5 flex items-center justify-center relative z-10">
                                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-black tracking-tight italic">Traitement en cours...</h2>
                                <p className="text-white/40 text-sm max-w-[280px] mx-auto font-medium">Communication sécurisée avec les serveurs de {selectedMethod?.label}. Ne fermez pas cette fenêtre.</p>
                            </div>
                        </motion.div>
                    )}

                    {step === "success" && (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-12 backdrop-blur-3xl text-center space-y-8"
                        >
                            <div className="relative flex justify-center">
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12 }}
                                    className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                                >
                                    <CheckCircle2 className="w-12 h-12 text-white" />
                                </motion.div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-black tracking-tighter">Paiement Réussi !</h2>
                                <p className="text-white/40 text-sm font-medium">Votre transaction a été validée et enregistrée.</p>
                            </div>

                            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/30 font-bold uppercase tracking-widest">ID Transaction</span>
                                    <span className="font-mono text-primary">#TXN-9824777</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-white/30 font-bold uppercase tracking-widest">Méthode</span>
                                    <span className="font-bold italic">{selectedMethod?.label}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm pt-2 border-t border-white/5">
                                    <span className="text-white/60 font-bold">Total Payé</span>
                                    <span className="text-xl font-black">{amount.toLocaleString()} FCFA</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setStep("select")}
                                    className="py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all"
                                >
                                    Faire un autre test
                                </button>
                                <Link 
                                    href="/dashboard"
                                    className="py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                                >
                                    Dashboard
                                    <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-12 flex items-center justify-between px-4 opacity-30 group">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">MindOS Secure Core</span>
                    </div>
                    <Link href="/dashboard" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest hover:opacity-100 transition-opacity">
                        <ArrowLeft className="w-3 h-3" />
                        Retour Boutique
                    </Link>
                </div>
            </div>
        </div>
    );
}
