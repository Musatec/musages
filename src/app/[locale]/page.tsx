"use client";

import { Link } from "@/i18n/routing";
import {
    ArrowRight,
    Play,
    Zap,
    BarChart3,
    Layers,
    ChevronRight,
    Sparkles
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
        <div className="min-h-screen bg-black text-white selection:bg-orange-500/30 font-sans overflow-x-hidden">

            {/* 1. NAVBAR (Flottante) */}
            <nav className={cn(
                "fixed top-0 w-full z-50 transition-all duration-500 border-b",
                scrolled
                    ? "bg-black/80 backdrop-blur-xl border-white/10 py-4"
                    : "bg-transparent border-transparent py-6"
            )}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <img
                            src="/logo.svg?v=4"
                            alt="MINDOS Logo"
                            className="h-8 w-auto transition-transform group-hover:scale-105"
                        />
                    </Link>

                    <div className="hidden md:flex items-center gap-4">
                        <Link
                            href="/login"
                            className="text-[11px] font-black uppercase tracking-[0.2em] px-6 py-2.5 border border-orange-500/50 text-orange-500 rounded-full hover:bg-orange-500/10 transition-all active:scale-95"
                        >
                            Se Connecter
                        </Link>
                        <Link
                            href="/login"
                            className="text-[11px] font-black uppercase tracking-[0.2em] px-6 py-2.5 bg-orange-500 text-black rounded-full hover:bg-orange-400 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] active:scale-95"
                        >
                            Commencer
                        </Link>
                    </div>

                    {/* Mobile Login Button */}
                    <div className="md:hidden">
                        <Link
                            href="/login"
                            className="text-[10px] font-black uppercase tracking-[0.1em] px-4 py-2 bg-orange-500 text-black rounded-full active:scale-95 shadow-lg shadow-orange-500/20"
                        >
                            Connexion
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* 2. HERO SECTION */}
                <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center overflow-hidden">
                    {/* Visual: Glow orange derrière le titre */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />

                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={{
                            animate: { transition: { staggerChildren: 0.1 } }
                        }}
                        className="relative z-10 max-w-5xl space-y-8"
                    >
                        <motion.div
                            variants={fadeInUp}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/50 border border-white/10 text-zinc-400 mb-4"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol LAVA v4.2</span>
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[1] sm:leading-[0.9] uppercase px-4"
                        >
                            Transformez le <span className="text-orange-500 italic block sm:inline">Chaos</span> <br className="hidden sm:block" />
                            en <span className="relative inline-block mt-2 sm:mt-0">
                                Création
                                <div className="absolute -inset-2 bg-orange-500/20 blur-2xl rounded-full -z-10" />
                            </span>.
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 font-medium leading-relaxed"
                        >
                            Le système d'exploitation pour les créateurs qui ne s'arrêtent jamais.
                            Structurez votre génie, maîtrisez votre temps.
                        </motion.p>

                        <motion.div
                            variants={fadeInUp}
                            className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Link
                                href="/login"
                                className="group w-full sm:w-auto px-10 py-5 bg-orange-500 text-black rounded-2xl font-black text-lg hover:bg-orange-400 transition-all shadow-[0_20px_40px_rgba(249,115,22,0.2)] active:scale-95 flex items-center justify-center gap-3 uppercase"
                            >
                                Lancer mon Workspace <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/login"
                                className="w-full sm:w-auto px-10 py-5 bg-zinc-900 border border-white/5 text-white rounded-2xl font-black text-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 uppercase"
                            >
                                <Play className="w-4 h-4 text-orange-500 fill-orange-500" /> Voir la démo
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Decorative bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20" />
                </section>

                {/* 3. SECTION FONCTIONNALITÉS (Bento Grid) */}
                <section className="py-24 px-6 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* FOCUS */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] space-y-6 group transition-all hover:border-orange-500/30"
                        >
                            <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center">
                                <Zap className="w-7 h-7 text-orange-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-orange-500 transition-colors">FOCUS</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    "Mode Immersif & Pomodoro". Une concentration chirurgicale pour vos sessions les plus critiques.
                                </p>
                            </div>
                        </motion.div>

                        {/* FINANCES */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] space-y-6 group transition-all hover:border-orange-500/30"
                        >
                            <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center">
                                <BarChart3 className="w-7 h-7 text-orange-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-orange-500 transition-colors">FINANCES</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    "Suivi des revenus & Objectifs". Gardez un œil sur votre croissance financière en temps réel.
                                </p>
                            </div>
                        </motion.div>

                        {/* SYSTÈME */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] space-y-6 group transition-all hover:border-orange-500/30"
                        >
                            <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center">
                                <Layers className="w-7 h-7 text-orange-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-orange-500 transition-colors">SYSTÈME</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    "Organisation par Projets & Tâches". Le centre de commandement pour piloter votre empire créatif.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* CALL TO ACTION FINAL */}
                <section className="py-32 px-6">
                    <div className="max-w-5xl mx-auto rounded-[3.5rem] bg-gradient-to-br from-zinc-900 to-black border border-white/5 p-12 md:p-20 text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />

                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-8 uppercase px-4">
                            Prêt à passer en <br />
                            <span className="text-orange-500 italic">Vitesse Supérieure ?</span>
                        </h2>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-4 px-12 py-6 bg-orange-500 text-black rounded-2xl font-black text-xl hover:bg-orange-400 transition-all shadow-[0_20px_40px_rgba(249,115,22,0.3)] active:scale-95 uppercase"
                        >
                            Prendre les Commandes <ChevronRight className="w-6 h-6" />
                        </Link>
                    </div>
                </section>
            </main>

            {/* 4. FOOTER SIMPLE */}
            <footer className="py-12 px-6 border-t border-white/5 bg-black">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer mb-6 md:mb-0">
                        <img src="/logo.svg?v=4" alt="MINDOS Logo" className="h-5 w-auto" />
                        <span className="text-[11px] font-black tracking-[0.3em] uppercase">MINDOS</span>
                    </div>

                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em] text-center mb-6 md:mb-0 px-4">
                        © 2026 MINDOS SYNDICATE · TOUS DROITS RÉSERVÉS
                    </p>

                    <div className="flex gap-6">
                        <Link href="/login" className="text-zinc-600 hover:text-orange-500 text-[10px] font-black uppercase tracking-widest transition-colors">Politique</Link>
                        <Link href="/login" className="text-zinc-600 hover:text-orange-500 text-[10px] font-black uppercase tracking-widest transition-colors">Termes</Link>
                    </div>
                </div>
            </footer>

            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
}
