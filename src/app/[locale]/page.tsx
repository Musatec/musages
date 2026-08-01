"use client";

import { Link } from "@/i18n/routing";
import {
    ArrowRight,
    Play,
    Zap,
    GraduationCap,
    BookOpen,
    ChevronRight,
    Sparkles,
    Users,
    ShieldCheck,
    CreditCard,
    MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30 font-sans overflow-x-hidden">

            {/* 1. NAVBAR (Dark Theme) */}
            <nav className={cn(
                "fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b",
                scrolled
                    ? "bg-[#0a0a0a]/90 backdrop-blur-xl border-white/10 py-4"
                    : "bg-[#0a0a0a]/40 backdrop-blur-md border-transparent py-4"
            )}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <img
                            src="/logo-taleem.png"
                            alt="TaleemApp Logo"
                            className="h-10 w-auto transition-transform group-hover:scale-105 drop-shadow-lg mix-blend-screen"
                        />
                        <span className="font-black text-xl tracking-tight text-white italic">
                            Taleem<span className="text-emerald-500">App</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-[11px] font-black uppercase tracking-[0.2em] px-6 py-2.5 border border-emerald-500/50 text-emerald-400 rounded-full hover:bg-emerald-500/10 transition-all active:scale-95"
                        >
                            Se Connecter
                        </Link>
                        <Link
                            href="/login?mode=signup"
                            className="text-[11px] font-black uppercase tracking-[0.2em] px-6 py-2.5 bg-emerald-500 text-black rounded-full hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95"
                        >
                            Inscrire l&apos;École
                        </Link>
                    </div>

                    <div className="md:hidden">
                        <Link
                            href="/login"
                            className="text-[10px] font-black uppercase tracking-[0.1em] px-4 py-2 bg-emerald-500 text-black rounded-full active:scale-95 shadow-lg"
                        >
                            Connexion
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* 2. HERO SECTION */}
                <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
                    <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-emerald-500/20 blur-[150px] rounded-full pointer-events-none animate-pulse" />
                    <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

                    <div className="max-w-7xl mx-auto w-full relative z-10 text-center space-y-8">
                        <motion.div
                            initial="initial"
                            animate="animate"
                            variants={{
                                animate: { transition: { staggerChildren: 0.15 } }
                            }}
                            className="space-y-8"
                        >


                            <motion.h1
                                variants={fadeInUp}
                                className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase"
                            >
                                Gérer votre École. <br />
                                <span className="text-emerald-500 italic relative">
                                    Sans Impayés.
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={fadeInUp}
                                className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed"
                            >
                                Recouvrement automatique des écolages par Wave & Orange Money, bulletins de notes bilingues (Français & Arabe) et relances WhatsApp directes aux parents.
                            </motion.p>

                            <motion.div
                                variants={fadeInUp}
                                className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
                            >
                                <Link
                                    href="/login?mode=signup"
                                    className="group w-full sm:w-auto px-10 py-5 bg-emerald-500 text-black rounded-[2rem] font-black text-lg hover:bg-emerald-400 transition-all shadow-[0_20px_50px_rgba(16,185,129,0.3)] active:scale-95 flex items-center justify-center gap-3 uppercase italic"
                                >
                                    Configurer mon École <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] font-black text-lg hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase italic"
                                >
                                    Accès Démo
                                </Link>
                            </motion.div>

                        </motion.div>
                    </div>
                </section>

                {/* 3. BENTO GRID FEATURES */}
                <section className="py-24 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Conçu pour les <span className="text-emerald-500 italic">Établissements Modernes.</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 bg-card border border-border shadow-md rounded-[2.5rem] space-y-6">
                            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                                <CreditCard className="w-7 h-7 text-emerald-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight">Recouvrement Wave</h3>
                                <p className="text-muted-foreground text-sm font-medium">
                                    Factures d&apos;écolage envoyées par WhatsApp avec lien Wave direct et reçus PDF automatisés.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 bg-card border border-border shadow-md rounded-[2.5rem] space-y-6">
                            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                                <GraduationCap className="w-7 h-7 text-amber-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight">Bulletins Bilingues</h3>
                                <p className="text-muted-foreground text-sm font-medium">
                                    Bulletins trimestriels certifiés en Français et en Arabe aux coefficients nationaux.
                                </p>
                            </div>
                        </div>

                        <div className="p-8 bg-card border border-border shadow-md rounded-[2.5rem] space-y-6">
                            <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                                <MessageSquare className="w-7 h-7 text-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight">Relances WhatsApp</h3>
                                <p className="text-muted-foreground text-sm font-medium">
                                    Alertes automatiques d&apos;absences, de retards et de rappel de cotisation envoyées aux parents.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-16 px-6 border-t border-border text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                    <img src="/logo-taleem.png" alt="TaleemApp" className="h-6 w-auto rounded" />
                    <span className="text-xs font-black tracking-[0.3em] uppercase">TaleemApp 2026</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                    SaaS de Gestion Scolaire Franco-Arabe & Général — Sénégal & Afrique de l&apos;Ouest
                </p>
            </footer>
        </div>
    );
}
