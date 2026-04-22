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
    Users,
    ShieldCheck,
    CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/ui/safe-image";
import { useTheme } from "next-themes";

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const { theme } = useTheme();

    const logoSrc = theme === "light" ? "/logo-black.svg" : "/logo.svg";

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
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans overflow-x-hidden">

            {/* 1. NAVBAR (Flottante) */}
            <nav className={cn(
                "fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b",
                scrolled
                    ? "bg-background/80 backdrop-blur-xl border-border py-4"
                    : "bg-background/40 backdrop-blur-md border-transparent py-4"
            )}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <SafeImage
                            src={logoSrc}
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
                            className="text-[11px] font-black uppercase tracking-[0.2em] px-6 py-2.5 border border-primary/50 text-primary rounded-full hover:bg-primary/10 transition-all active:scale-95"
                        >
                            Se Connecter
                        </Link>
                        <Link
                            href="/login?mode=signup"
                            className="text-[11px] font-black uppercase tracking-[0.2em] px-6 py-2.5 bg-primary text-black rounded-full hover:bg-primary/80 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] active:scale-95"
                        >
                            Commencer
                        </Link>
                    </div>

                    {/* Mobile Login Button */}
                    <div className="md:hidden">
                        <Link
                            href="/login"
                            className="text-[10px] font-black uppercase tracking-[0.1em] px-4 py-2 bg-primary text-black rounded-full active:scale-95 shadow-lg shadow-primary/20"
                        >
                            Connexion
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* 2. HERO SECTION - High Impact */}
                <section className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden">
                    {/* Background Ambient Glows */}
                    <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[150px] rounded-full pointer-events-none animate-pulse" />
                    <div className="absolute bottom-[20%] right-[10%] w-[30%] h-[30%] bg-orange-600/10 blur-[120px] rounded-full pointer-events-none" />

                    <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-1 gap-12 text-center">
                        <motion.div
                            initial="initial"
                            animate="animate"
                            variants={{
                                animate: { transition: { staggerChildren: 0.15 } }
                            }}
                            className="space-y-8"
                        >
                            <motion.div 
                                variants={fadeInUp}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
                            >
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80 italic">L&apos;OS Ultime pour Entrepreneurs</span>
                            </motion.div>

                            <motion.h1
                                variants={fadeInUp}
                                className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase"
                            >
                                Dominez le <br />
                                <span className="text-primary italic relative">
                                    Marché.
                                    <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                        <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="2" />
                                    </svg>
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={fadeInUp}
                                className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground font-medium leading-relaxed"
                            >
                                Structurez votre génie, maîtrisez votre temps et vos profits. 
                                L&apos;infrastructure d&apos;élite pour les créateurs qui bâtissent l&apos;avenir.
                            </motion.p>

                            <motion.div
                                variants={fadeInUp}
                                className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
                            >
                                <Link
                                    href="/login?mode=signup"
                                    className="group w-full sm:w-auto px-10 py-5 bg-primary text-black rounded-[2rem] font-black text-lg hover:bg-primary/80 transition-all shadow-[0_20px_50px_rgba(249,115,22,0.3)] active:scale-95 flex items-center justify-center gap-3 uppercase italic"
                                >
                                    Prendre les Commandes <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <button className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 backdrop-blur-xl rounded-[2rem] font-black text-lg hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase italic">
                                    <Play className="w-4 h-4 fill-current" /> Explorer le Noyau
                                </button>
                            </motion.div>

                            {/* Dashboard Mockup Preview - Realistic Capture */}
                            <motion.div
                                initial={{ opacity: 0, y: 100, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="relative mt-20 group px-4 md:px-0"
                            >
                                <div className="absolute -inset-4 bg-gradient-to-b from-primary/30 to-transparent blur-3xl rounded-[3rem] opacity-30 group-hover:opacity-60 transition-opacity" />
                                <div className="relative bg-[#0A0A0B] border border-white/10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] max-w-6xl mx-auto">
                                    <SafeImage 
                                        src="/dashboard-capture.png" 
                                        alt="MINDOS Real-time Strategic Dashboard" 
                                        className="w-full h-auto transition-transform duration-[3s] group-hover:scale-105"
                                    />
                                    {/* Subtle Overlay reflection */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[2rem] md:rounded-[3rem]" />
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* 3. SECTION FONCTIONNALITÉS (Bento Grid) */}
                <section className="py-24 px-6 max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-muted-foreground italic mb-2">
                            Infrastructure Professionnelle
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Conçu pour la <span className="text-primary italic">Performance.</span></h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* VENTES & POS */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 bg-card border border-border shadow-md rounded-[2.5rem] space-y-6 group transition-all hover:border-primary/30"
                        >
                            <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                                <Zap className="w-7 h-7 text-emerald-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight text-foreground group-hover:text-emerald-500 transition-colors">VENTES & CAISSE</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                                    Encaissement ultra-rapide optimisé pour le terrain. Compatible Wave, Mobile Money et Cash.
                                </p>
                            </div>
                        </motion.div>

                        {/* STOCKS 360° */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 bg-card border border-border shadow-md rounded-[2.5rem] space-y-6 group transition-all hover:border-primary/30"
                        >
                            <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                                <BarChart3 className="w-7 h-7 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">INVENTAIRE IA</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                                    Alertes intelligentes de rupture de stock et valorisation de votre patrimoine commercial en temps réel.
                                </p>
                            </div>
                        </motion.div>

                        {/* MULTI-COMPTES */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="p-8 bg-card border border-border shadow-md rounded-[2.5rem] space-y-6 group transition-all hover:border-primary/30"
                        >
                            <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                                <Users className="w-7 h-7 text-blue-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black uppercase tracking-tight text-foreground group-hover:text-blue-500 transition-colors">CONTRÔLE TOTAL</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                                    Gestion fine des permissions pour vos employés. Suivez chaque action via nos rapports d&apos;audit.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* 4. POWER METRICS SECTION */}
                <section className="py-24 px-6 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { label: "Transactions", value: "2M+", sub: "Sécurisées / An" },
                            { label: "Utilisateurs", value: "15k+", sub: "Entrepreneurs Actifs" },
                            { label: "Disponibilité", value: "99.9%", sub: "SLA Garanti" },
                            { label: "Pays", value: "12+", sub: "Déploiement Afrique" }
                        ].map((stat, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center space-y-2 group"
                            >
                                <div className="text-4xl md:text-6xl font-black tracking-tighter text-white group-hover:text-primary transition-colors duration-500 italic">
                                    {stat.value}
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">{stat.label}</div>
                                    <div className="text-[8px] font-bold uppercase tracking-widest text-primary/40">{stat.sub}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* --- WHY MINDOS (COMPARISON) --- */}
                <section className="py-24 px-6 bg-white/[0.01] border-y border-white/5">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">
                                Arrêtez de deviner. <br />
                                <span className="text-primary">Commencez à savoir.</span>
                            </h2>
                            <p className="text-muted-foreground text-lg italic leading-relaxed">
                                Les systèmes manuels vous font perdre 15% de votre CA en erreurs et oublis. MINDOS automatise la rigueur.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Zéro oubli de facturation",
                                    "Calcul de marge millimeter-accurate",
                                    "Réconciliation automatique des paiements mobiles",
                                    "Accessibilité 24/7 sur mobile et PC"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-foreground">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full" /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative group p-1 bg-gradient-to-br from-primary/20 to-transparent rounded-[3rem]">
                            <div className="bg-card border border-white/5 rounded-[2.9rem] overflow-hidden shadow-2xl transition-transform group-hover:scale-[1.01]">
                                <PricingCard 
                                    title="Business Elite"
                                    price="7.000"
                                    planId="BUSINESS"
                                    description="Pour ceux qui ne font aucun compromis sur la gestion."
                                    features={["Multi-Boutiques", "IA Prédictive", "Audit Premium", "Support 24/7"]}
                                    color="orange"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3.5 PRICING SECTION (NOUVEAU) */}
                <section className="py-24 px-6 max-w-7xl mx-auto relative overflow-hidden">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Ouvrez les <span className="text-primary italic">Vannes du Profit.</span></h2>
                        <p className="max-w-xl mx-auto text-muted-foreground text-sm font-bold uppercase tracking-widest">Choisissez le plan adapté à la taille de votre ambition</p>
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
                    <div className="max-w-5xl mx-auto rounded-[2.5rem] md:rounded-[3.5rem] bg-gradient-to-br from-card to-background border border-border shadow-2xl p-8 md:p-20 text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-8 uppercase px-2">
                            Prêt à passer en <br />
                            <span className="text-primary italic">Vitesse Supérieure ?</span>
                        </h2>
                        <Link
                            href="/login?mode=signup"
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-4 px-8 py-4 md:px-12 md:py-6 bg-primary text-black rounded-2xl font-black text-lg md:text-xl hover:bg-primary/80 transition-all shadow-[0_20px_40px_rgba(249,115,22,0.3)] active:scale-95 uppercase"
                        >
                            Prendre les Commandes <ChevronRight className="w-6 h-6" />
                        </Link>
                    </div>
                </section>
            </main>

            {/* 4. FOOTER SIMPLE */}
            <footer className="py-16 px-6 border-t border-border bg-background relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 relative z-10">
                    <div className="flex items-center gap-3 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer">
                        <SafeImage src={logoSrc} alt="MINDOS Logo" width={100} height={25} className="h-6 w-auto" />
                        <span className="text-xs font-black tracking-[0.4em] uppercase">MINDOS</span>
                    </div>

                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em] text-center">
                        MINDOS 2026 · TOUS DROITS RÉSERVÉS
                    </p>

                    <div className="flex items-center gap-6 mt-4 opacity-20">
                         <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                         <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                         <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    </div>
                </div>
                
                {/* Subtle light effect at bottom */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </footer>

            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "MINDOS",
                        "operatingSystem": "Web, Android, iOS",
                        "applicationCategory": "BusinessApplication",
                        "offers": {
                            "@type": "Offer",
                            "price": "3000",
                            "priceCurrency": "XOF"
                        },
                        "description": "Système d'exploitation ultime pour les créateurs et entrepreneurs. Gestion de stock, POS, et analyses financières automatisées."
                    })
                }}
            />
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
                popular ? "bg-primary/10 border-primary/40 shadow-[0_30px_60px_rgba(249,115,22,0.15)]" : "bg-card border-border shadow-lg hover:border-primary/30"
            )}
        >
            {popular && (
                <div className="absolute top-6 right-8 px-4 py-1.5 bg-primary text-black text-[9px] font-black uppercase tracking-widest rounded-full">
                    RECOMMANDÉ
                </div>
            )}

            <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tighter text-foreground">{title}</h3>
                <p className="text-muted-foreground text-xs font-medium leading-relaxed">{description}</p>
            </div>

            <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">{price} <span className="text-xs">FCFA</span></span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">/ mois</span>
            </div>

            <div className="flex-1 space-y-4 py-6 border-t border-border/50">
                {features.map((feature: string, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className={cn("w-4 h-4 rounded-full flex items-center justify-center", isOrange ? "bg-primary/20" : "bg-foreground/10")}>
                            <ChevronRight className={cn("w-3 h-3", isOrange ? "text-primary" : "text-foreground/40")} />
                        </div>
                        <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wide">{feature}</span>
                    </div>
                ))}
            </div>

            <Link
                href={`/login?plan=${planId}`}
                className={cn(
                    "w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] text-center transition-all active:scale-95",
                    popular ? "bg-primary text-black hover:bg-primary/80" : "bg-foreground/5 text-foreground hover:bg-foreground/10 border border-border shadow-xl"
                )}
            >
                Activer ce Plan
            </Link>
        </motion.div>
    );
}
