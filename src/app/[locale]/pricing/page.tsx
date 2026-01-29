"use client";

import { Check, Zap, Rocket, Star, ArrowRight, ShieldCheck, Sparkles, Clock3 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PricingPage() {
    const handleWaitlist = () => {
        toast.success("Demande enregistrée ! ✨", {
            description: "Vous êtes sur la liste d'attente. Nous vous préviendrons dès l'ouverture du plan Pro.",
            duration: 5000,
        });
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-12">

            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 blur-[120px] rounded-full" />

            <div className="relative z-10 w-full max-w-5xl space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">

                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-border text-[10px] font-black uppercase tracking-[0.2em] text-primary animate-pulse">
                        <Zap className="w-3 h-3 transition-transform group-hover:scale-125" />
                        Accès Beta Ouvert
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black tracking-tighter italic uppercase text-foreground leading-tight">
                        ÉLEVEZ VOTRE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/40">SYSTÈME CRÉATIF.</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed italic">
                        MINDOS est gratuit pendant la phase de lancement Beta. <br className="hidden md:block" />
                        Préparez-vous à débloquer la puissance ultime.
                    </p>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                    {/* Free Plan */}
                    <div className="group relative bg-card/50 backdrop-blur-3xl border border-border rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between transition-all duration-500 hover:border-primary/20 hover:bg-card/80 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Plan Actuel</div>
                                <h2 className="text-4xl font-black text-foreground italic tracking-tighter">FREE.</h2>
                                <p className="text-muted-foreground text-sm font-medium">Pour les bâtisseurs solitaires.</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    "Labo de recherche illimité",
                                    "Éditeur de manuscrits complet",
                                    "Pomodoro & Matrice d'Eisenhower",
                                    "Capture Studio (Essentiel)",
                                    "1 Go de stockage média",
                                    "Gamification de base"
                                ].map((feature) => (
                                    <div key={feature} className="flex items-center gap-3 group/item">
                                        <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center border border-border group-hover/item:bg-accent/20 transition-colors">
                                            <Check className="w-3 h-3 text-muted-foreground group-hover/item:text-primary" />
                                        </div>
                                        <span className="text-sm text-foreground/80 font-medium">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Link href="/dashboard" className="mt-12 w-full py-5 bg-transparent border border-zinc-700 hover:border-zinc-500 hover:text-white rounded-2xl text-center text-sm font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3">
                            Commencer maintenant
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Pro Plan */}
                    <div className="group relative bg-card border border-primary/30 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between transition-all duration-500 hover:border-primary shadow-[0_0_50px_hsla(var(--primary)/0.1)] overflow-hidden">
                        {/* Badge Bientôt */}
                        <div className="absolute top-6 right-6">
                            <span className="bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
                                Bientôt
                            </span>
                        </div>

                        {/* Animated Glow */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="space-y-8 relative z-10">
                            <div className="space-y-2">
                                <div className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                    <Star className="w-3 h-3 fill-current" />
                                    Accès Prioritaire
                                </div>
                                <h2 className="text-4xl font-black text-foreground italic tracking-tighter">PRO.</h2>
                                <p className="text-muted-foreground text-sm font-medium">Pour les visionnaires insatiables.</p>
                            </div>

                            <div className="space-y-4">
                                {[
                                    "Studio & Capture illimités",
                                    "Compagnon IA Stratégique",
                                    "Analytics & Heatmaps avancés",
                                    "Export PDF Premium & Personnalisé",
                                    "10 Go de stockage cloud",
                                    "Badge 'Mentor Fondateur'",
                                    "Collaboration d'équipe"
                                ].map((feature) => (
                                    <div key={feature} className="flex items-center gap-3 group/item">
                                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover/item:bg-primary/20 transition-colors">
                                            <Sparkles className="w-3 h-3 text-primary" />
                                        </div>
                                        <span className="text-sm text-foreground font-bold">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleWaitlist}
                            className="mt-12 w-full py-5 bg-primary hover:opacity-90 text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                        >
                            Liste d'attente
                            <Clock3 className="w-4 h-4" />
                        </button>
                    </div>

                </div>

                {/* FAQ / Trust elements */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-border opacity-50 hover:opacity-100 transition-opacity duration-500">
                    <div className="flex items-center gap-4">
                        <ShieldCheck className="w-8 h-8 text-muted-foreground" />
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">SaaS Sécurisé</h4>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase trekking-tighter">Données cryptées via Supabase.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Rocket className="w-8 h-8 text-muted-foreground" />
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Zéro Friction</h4>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase trekking-tighter">Démarrage en 30 secondes.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Star className="w-8 h-8 text-muted-foreground" />
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground">Beta Club</h4>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase trekking-tighter">Participez à l'évolution de l'OS.</p>
                        </div>
                    </div>
                </div>

                {/* Footer text */}
                <div className="text-center">
                    <Link href="/" className="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-[0.3em] transition-colors">
                        ← Retour au Portail
                    </Link>
                </div>
            </div>
        </div>
    );
}
