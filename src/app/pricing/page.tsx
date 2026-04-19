"use client";

import { Check, Zap, Sparkles, Building2, Crown, ArrowRight, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 relative overflow-hidden flex flex-col p-4 sm:p-8">
            
            {/* Mesh Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] opacity-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px] opacity-10" />

            <div className="relative z-10 w-full max-w-6xl mx-auto space-y-16 py-12">
                
                {/* Header Section */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                        <Zap className="w-3 h-3" />
                        Expansion Commerciale illimitée
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                        PROTÉGEZ & DÉPLOYEZ <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">VOTRE RÉSEAU.</span>
                    </h1>
                    <p className="text-gray-500 text-[11px] max-w-xl mx-auto font-bold uppercase tracking-[0.2em] leading-relaxed italic opacity-80">
                        Choisissez la puissance adaptée à votre ambition. <br className="hidden md:block" />
                        Du point de vente unique à l'empire multi-boutiques.
                    </p>
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* STARTER */}
                    <div className="bg-[#0A0A0B]/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between transition-all duration-500 hover:border-white/10 hover:translate-y-[-4px] shadow-2xl">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Entry Protocol</div>
                                <h2 className="text-4xl font-black italic tracking-tighter uppercase">Starter.</h2>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-primary italic">3.000</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">FCFA / Mois</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <FeatureItem text="1 Boutique Unique" active />
                                <FeatureItem text="Tableau de Bord Standard" active />
                                <FeatureItem text="Gestion Stock & Ventes" active />
                                <FeatureItem text="Dettes & WhatsApp" active />
                                <FeatureItem text="Multi-Boutiques" />
                                <FeatureItem text="Accès Gérants" />
                            </div>
                        </div>
                        <Link href="/checkout/starter" className="mt-10 w-full py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-center text-[11px] font-black uppercase tracking-widest transition-all italic flex items-center justify-center gap-2">
                            Démarrer Solo
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* GROWTH - Popular */}
                    <div className="bg-[#0A0A0B] border-2 border-primary rounded-[2.5rem] p-8 flex flex-col justify-between transition-all duration-500 scale-105 shadow-[0_0_80px_rgba(249,115,22,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-primary text-black px-6 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-bl-2xl italic">
                            Le plus populaire
                        </div>
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <div className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" />
                                    Optimisation Réseau
                                </div>
                                <h2 className="text-4xl font-black italic tracking-tighter uppercase">Growth.</h2>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-primary italic">5.000</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">FCFA / Mois</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <FeatureItem text="3 Boutiques (1+2)" active />
                                <FeatureItem text="Dashboard DG Avancé" active />
                                <FeatureItem text="2 Accès Managers Isolés" active />
                                <FeatureItem text="Centrale Réseau Interactive" active />
                                <FeatureItem text="Rapports consolidés" active />
                                <FeatureItem text="Support Prioritaire" active />
                            </div>
                        </div>
                        <Link href="/checkout/growth" className="mt-10 w-full py-4 bg-primary text-black rounded-2xl text-center text-[11px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                            Activer l'Expansion
                            <Zap className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    {/* BUSINESS */}
                    <div className="bg-[#0A0A0B]/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between transition-all duration-500 hover:border-primary/20 hover:translate-y-[-4px] shadow-2xl">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Empire Architecture</div>
                                <h2 className="text-4xl font-black italic tracking-tighter uppercase flex items-center gap-2">
                                    Business.
                                    <Crown className="w-6 h-6 text-primary" />
                                </h2>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-black text-primary italic">7.000</span>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">FCFA / Mois</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <FeatureItem text="6 Boutiques Réseau" active />
                                <FeatureItem text="Supervision Totale" active />
                                <FeatureItem text="5 Accès Managers Isolés" active />
                                <FeatureItem text="Analytics Empire" active />
                                <FeatureItem text="Gestion RH multi-sites" active />
                                <FeatureItem text="Hautes Performances" active />
                            </div>
                        </div>
                        <Link href="/checkout/business" className="mt-10 w-full py-4 bg-white text-black hover:bg-gray-200 rounded-2xl text-center text-[11px] font-black uppercase tracking-widest transition-all italic flex items-center justify-center gap-2">
                            Lancer l'Empire
                            <Building2 className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                </div>

                {/* Bottom Trust Icons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-16 border-t border-white/5 opacity-40">
                    <TrustItem icon={ShieldCheck} title="Sécurité Bancaire" desc="Données isolées et protégées." />
                    <TrustItem icon={Zap} title="Vitesse Alpha" desc="Performance instantanée." />
                    <TrustItem icon={Star} title="Support Expert" desc="À vos côtés 24/7." />
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ text, active }: { text: string; active?: boolean }) {
    return (
        <div className={cn("flex items-center gap-3", !active && "opacity-20 transition-opacity")}>
            <div className={cn("w-4 h-4 rounded-full flex items-center justify-center border", active ? "bg-primary/10 border-primary/20" : "border-white/10")}>
                <Check className={cn("w-2.5 h-2.5", active ? "text-primary" : "text-gray-800")} />
            </div>
            <span className={cn("text-[10px] font-bold uppercase tracking-widest italic", active ? "text-gray-300" : "text-gray-600 line-through")}>{text}</span>
        </div>
    );
}

function TrustItem({ icon: Icon, title, desc }: { icon: any; title: string, desc: string }) {
    return (
        <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                <Icon className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" />
            </div>
            <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">{title}</h4>
                <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mt-0.5">{desc}</p>
            </div>
        </div>
    );
}
