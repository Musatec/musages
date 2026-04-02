"use client";

import { Link } from "@/i18n/routing";
import {
    ArrowRight,
    Play,
    Zap,
    BarChart3,
    Layers,
    ChevronRight,
    Sparkles,
    Users
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/ui/safe-image";

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
                        <SafeImage
                            src="/logo.svg?v=4"
                            alt="MINDOS Logo"
                            width={120}
                            height={32}
                            className="h-8 w-auto transition-transform group-hover:scale-105"
                            priority
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

                        <motion.h1
                            variants={fadeInUp}
                            className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] uppercase px-2"
                        >
                            Transformez le <span className="text-orange-500 italic block sm:inline">Chaos</span> <br className="hidden sm:block" />
                            en <span className="relative inline-block mt-1 sm:mt-0">
                                Création
                                <div className="absolute -inset-2 bg-orange-500/20 blur-2xl rounded-full -z-10" />
                            </span>.
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 font-medium leading-relaxed"
                        >
                            Le système d&apos;exploitation pour les créateurs qui ne s&apos;arrêtent jamais.
                            Structurez votre génie, maîtrisez votre temps.
                        </motion.p>

                        <motion.div
                            variants={fadeInUp}
                            className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
                        >
                            <Link
                                href="/login"
                                className="group w-full sm:w-auto px-8 py-4 md:px-10 md:py-5 bg-orange-500 text-black rounded-2xl font-black text-base md:text-lg hover:bg-orange-400 transition-all shadow-[0_20px_40px_rgba(249,115,22,0.2)] active:scale-95 flex items-center justify-center gap-3 uppercase"
                            >
                                Lancer mon Workspace <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Decorative bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-20" />
                </section>

                {/* 3. SECTION FONCTIONNALITÉS (Bento Grid) */}
                <section className="py-24 px-6 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* VENTES & POS */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] space-y-6 group transition-all hover:border-orange-500/30"
                        >
                            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                                <Zap className="w-7 h-7 text-emerald-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-emerald-500 transition-colors">VENTES & POS</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                                    Encaissement ultra-rapide, gestion des tickets et calcul automatique de la TVA.
                                </p>
                            </div>
                        </motion.div>

                        {/* STOCKS 360° */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] space-y-6 group transition-all hover:border-orange-500/30"
                        >
                            <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center">
                                <BarChart3 className="w-7 h-7 text-orange-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-orange-500 transition-colors">STOCKS 360°</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                                    Suivi en temps réel des inventaires, alertes de rupture et calcul des marges bénéficiaires.
                                </p>
                            </div>
                        </motion.div>

                        {/* MULTI-COMPTES */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 bg-zinc-900 border border-white/5 rounded-[2.5rem] space-y-6 group transition-all hover:border-orange-500/30"
                        >
                            <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                                <Users className="w-7 h-7 text-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-blue-500 transition-colors">MULTI-COMPTES</h3>
                                <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                                    Gérez vos employés et leurs accès. Déléguez les ventes tout en gardant le contrôle total.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* 3.5 PRICING SECTION (NOUVEAU) */}
                <section className="py-24 px-6 max-w-7xl mx-auto relative overflow-hidden">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Ouvrez les <span className="text-orange-500 italic">Vannes du Profit.</span></h2>
                        <p className="max-w-xl mx-auto text-zinc-500 text-sm font-bold uppercase tracking-widest">Choisissez le plan adapté à la taille de votre ambition</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <PricingCard 
                            title="Starter"
                            price="3.000"
                            planId="STARTER"
                            description="Parfait pour les entrepreneurs solo qui lancent leur activité."
                            features={["1 Compte Gérant", "Ventes Illimitées", "Gestion de Stock", "Dashboard de Base"]}
                            color="zinc"
                        />
                        
                        {/* GROWTH */}
                        <PricingCard 
                            title="Growth"
                            price="5.000"
                            planId="GROWTH"
                            description="La solution idéale pour les petites boutiques en croissance."
                            features={["1 Compte Gérant", "+2 Comptes Employés", "Gestion de Stock Avancée", "Analyse des Marges", "Audit Logs"]}
                            color="orange"
                            popular
                        />

                        {/* BUSINESS */}
                        <PricingCard 
                            title="Business"
                            price="7.000"
                            planId="BUSINESS"
                            description="Le centre de commandement pour les entreprises établies."
                            features={["1 Compte Gérant", "+5 Comptes Employés", "Support Prioritaire", "Multi-Terminal POS", "Rapports Financiers PDF"]}
                            color="blue"
                        />
                    </div>
                </section>

                {/* CALL TO ACTION FINAL */}
                <section className="py-32 px-6">
                    <div className="max-w-5xl mx-auto rounded-[2.5rem] md:rounded-[3.5rem] bg-gradient-to-br from-zinc-900 to-black border border-white/5 p-8 md:p-20 text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />

                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-8 uppercase px-2">
                            Prêt à passer en <br />
                            <span className="text-orange-500 italic">Vitesse Supérieure ?</span>
                        </h2>
                        <Link
                            href="/login"
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-4 px-8 py-4 md:px-12 md:py-6 bg-orange-500 text-black rounded-2xl font-black text-lg md:text-xl hover:bg-orange-400 transition-all shadow-[0_20px_40px_rgba(249,115,22,0.3)] active:scale-95 uppercase"
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
                        <SafeImage src="/logo.svg?v=4" alt="MINDOS Logo" width={80} height={20} className="h-5 w-auto" />
                        <span className="text-[11px] font-black tracking-[0.3em] uppercase">MINDOS</span>
                    </div>

                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em] text-center mb-6 md:mb-0 px-4">
                        © 2026 MINDOS · TOUS DROITS RÉSERVÉS
                    </p>

                </div>
            </footer>

            {/* Cinematic Noise Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
}

interface PricingCardProps {
    title: string;
    price: string;
    planId: string;
    description: string;
    features: string[];
    color: "zinc" | "orange" | "blue";
    popular?: boolean;
}

function PricingCard({ title, price, planId, description, features, color, popular }: PricingCardProps) {
    const isOrange = color === "orange";
    const isBlue = color === "blue";

    return (
        <motion.div 
            whileHover={{ scale: 1.02 }}
            className={cn(
                "relative p-8 md:p-10 rounded-[3rem] border flex flex-col space-y-8 transition-all overflow-hidden h-full",
                popular ? "bg-orange-500/10 border-orange-500/40 shadow-[0_30px_60px_rgba(249,115,22,0.15)]" : "bg-zinc-900/50 border-white/10 hover:border-white/20"
            )}
        >
            {popular && (
                <div className="absolute top-6 right-8 px-4 py-1.5 bg-orange-500 text-black text-[9px] font-black uppercase tracking-widest rounded-full">
                    RECOMMANDÉ
                </div>
            )}

            <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{title}</h3>
                <p className="text-zinc-500 text-xs font-medium leading-relaxed">{description}</p>
            </div>

            <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-black tracking-tighter text-white">{price} <span className="text-xs">FCFA</span></span>
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">/ mois</span>
            </div>

            <div className="flex-1 space-y-4 py-6 border-t border-white/5">
                {features.map((feature: string, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", isOrange ? "bg-orange-500/20" : "bg-white/10")}>
                            <ChevronRight className={cn("w-3 h-3", isOrange ? "text-orange-500" : "text-white/40")} />
                        </div>
                        <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide">{feature}</span>
                    </div>
                ))}
            </div>

            <Link
                href={`/signup?plan=${planId}`}
                className={cn(
                    "w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] text-center transition-all active:scale-95",
                    popular ? "bg-orange-500 text-black hover:bg-orange-400" : "bg-white/5 text-white hover:bg-white/10 border border-white/10 shadow-xl"
                )}
            >
                Activer ce Plan
            </Link>
        </motion.div>
    );
}
