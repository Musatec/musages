"use client";

import { Check, Zap, Rocket, Star, ArrowRight, ShieldCheck, Sparkles, Clock3 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function PricingPage() {
    const handleWaitlist = () => {
        toast.success("Demande enregistrée ! ✨", {
            description: "Vous êtes sur la liste d'attente Alpha.",
            duration: 5000,
        });
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8">

            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
            <div className="relative z-10 w-full max-w-4xl space-y-12">

                {/* Header Compact */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent/5 border border-border/50 text-[8px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">
                        <Zap className="w-2.5 h-2.5" />
                        Accès Beta Ouvert
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase text-white leading-tight">
                        ÉLEVEZ VOTRE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/40 italic">SYSTÈME CRÉATIF.</span>
                    </h1>
                    <p className="text-muted-foreground/60 text-[10px] max-w-lg mx-auto font-black uppercase tracking-widest italic leading-relaxed">
                        MINDOS est gratuit pendant la phase de lancement Alpha. <br className="hidden md:block" />
                        Préparez-vous à débloquer la puissance ultime.
                    </p>
                </div>

                {/* Pricing Grid Compact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

                    {/* Free Plan */}
                    <div className="group relative bg-[#0A0A0B]/80 backdrop-blur-3xl border border-border/10 rounded-[2rem] p-6 md:p-8 flex flex-col justify-between transition-all duration-500 hover:border-primary/20 shadow-2xl">
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <div className="text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">Plan Actuel Alpha</div>
                                <h2 className="text-3xl font-black text-white italic tracking-tighter">FREE.</h2>
                                <p className="text-[10px] text-muted-foreground/50 font-bold uppercase italic">Pour les bâtisseurs solitaires.</p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    "Labo de recherche illimité",
                                    "Éditeur de manuscrits complet",
                                    "Pomodoro & Eisenhower",
                                    "Capture Studio (Essentiel)",
                                    "1 Go stockage média",
                                    "Gamification Alpha"
                                ].map((feature) => (
                                    <div key={feature} className="flex items-center gap-2.5 group/item">
                                        <div className="w-4 h-4 rounded-full bg-accent/5 flex items-center justify-center border border-border/10">
                                            <Check className="w-2.5 h-2.5 text-muted-foreground/40 group-hover/item:text-primary transition-colors" />
                                        </div>
                                        <span className="text-[10px] text-white/60 font-black uppercase tracking-tight italic">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Link href="/dashboard" className="mt-8 w-full py-4 bg-transparent border border-white/5 hover:bg-white/5 rounded-xl text-center text-[10px] font-black uppercase tracking-widest transition-all italic flex items-center justify-center gap-2">
                            Dashboard
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* Pro Plan */}
                    <div className="group relative bg-[#0A0A0B] border border-primary/20 rounded-[2rem] p-6 md:p-8 flex flex-col justify-between transition-all duration-500 hover:border-primary shadow-[0_0_60px_rgba(249,115,22,0.05)] overflow-hidden">
                        <div className="absolute top-4 right-4">
                            <span className="bg-primary text-black text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                                Bientôt
                            </span>
                        </div>

                        <div className="space-y-6 relative z-10">
                            <div className="space-y-1">
                                <div className="text-[8px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Star className="w-2.5 h-2.5 fill-current" />
                                    Accès Prioritaire
                                </div>
                                <h2 className="text-3xl font-black text-white italic tracking-tighter">PRO.</h2>
                                <p className="text-[10px] text-primary/50 font-bold uppercase italic">Pour les visionnaires insatiables.</p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    "Studio & Capture illimités",
                                    "Compagnon IA Stratégique",
                                    "Analytics Alpha Avancés",
                                    "Export PDF Premium",
                                    "10 Go Stockage Cloud",
                                    "Badge 'Mentor Fondateur'",
                                    "Collaboration d'équipe"
                                ].map((feature) => (
                                    <div key={feature} className="flex items-center gap-2.5 group/item">
                                        <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                                            <Sparkles className="w-2 h-2 text-primary" />
                                        </div>
                                        <span className="text-[10px] text-white/80 font-black uppercase tracking-tight italic">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleWaitlist}
                            className="mt-8 w-full py-4 bg-primary hover:bg-primary/90 text-black rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-2 italic"
                        >
                            Waitlist Alpha
                            <Clock3 className="w-3.5 h-3.5" />
                        </button>
                    </div>

                </div>

                {/* Trust Elements Compact */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity duration-700">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-muted-foreground/30" />
                        <div>
                            <h4 className="text-[8px] font-black uppercase tracking-widest text-white/60 leading-none">Security Alpha</h4>
                            <p className="text-[7px] text-muted-foreground/40 font-black uppercase mt-1">Cryptage Supabase.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Rocket className="w-6 h-6 text-muted-foreground/30" />
                        <div>
                            <h4 className="text-[8px] font-black uppercase tracking-widest text-white/60 leading-none">Ultra Fast</h4>
                            <p className="text-[7px] text-muted-foreground/40 font-black uppercase mt-1">Zero Friction Start.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Star className="w-6 h-6 text-muted-foreground/30" />
                        <div>
                            <h4 className="text-[8px] font-black uppercase tracking-widest text-white/60 leading-none">Beta Club</h4>
                            <p className="text-[7px] text-muted-foreground/40 font-black uppercase mt-1">Évolution Continue.</p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Link href="/" className="text-[8px] font-black text-muted-foreground/40 hover:text-white uppercase tracking-[0.4em] transition-colors">
                        ← Retour Portail
                    </Link>
                </div>
            </div>
        </div>
    );
}
