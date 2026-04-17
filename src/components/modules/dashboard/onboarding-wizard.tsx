"use client";

import { CheckCircle2, ChevronRight, Package, Users, ShoppingBag, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface OnboardingWizardProps {
    metrics: {
        activeInventory: number;
        totalEmployees: number;
        totalSales: number;
    };
}

export function OnboardingWizard({ metrics }: OnboardingWizardProps) {
    // Current logic: Onboarding is active if there are no products
    const showWizard = metrics.activeInventory === 0;

    if (!showWizard) return null;

    const steps = [
        {
            id: "store",
            title: "Configuration",
            desc: "Personnalisez l'identité de votre boutique.",
            icon: Settings,
            href: "/settings",
            completed: true, // They have a store if they are in the dashboard
        },
        {
            id: "product",
            title: "Premier Produit",
            desc: "Ajoutez un article pour commencer à vendre.",
            icon: Package,
            href: "/inventory",
            completed: metrics.activeInventory > 0,
        },
        {
            id: "employee",
            title: "Équipe",
            desc: "Invitez vos collaborateurs (Optionnel).",
            icon: Users,
            href: "/hr",
            completed: metrics.totalEmployees > 0,
        },
        {
            id: "sale",
            title: "Première Vente",
            desc: "Encaissez votre premier client au POS.",
            icon: ShoppingBag,
            href: "/dashboard", // Usually triggers the POS modal or page
            completed: metrics.totalSales > 0,
        }
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const progress = (completedCount / steps.length) * 100;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 rounded-[2.5rem] p-8 md:p-12 mb-10 overflow-hidden relative group"
        >
            {/* Background Sparkles */}
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                <Sparkles className="w-40 h-40 text-primary rotate-12" />
            </div>

            <div className="relative z-10 space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-black uppercase tracking-[0.2em] text-primary italic">
                            Mission de Lancement
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                            VOTRE EMPIRE <br />
                            <span className="text-foreground">COMMENCE ICI.</span>
                        </h2>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-right">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Progression du Setup</span>
                        <div className="w-48 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-primary shadow-[0_0_10px_rgba(234,88,12,0.5)]" 
                            />
                        </div>
                        <span className="text-xs font-bold text-primary italic">{completedCount} / {steps.length} Étapes</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {steps.map((step, i) => (
                        <Link 
                            key={step.id} 
                            href={step.href}
                            className={cn(
                                "p-6 rounded-3xl border transition-all group/card relative",
                                step.completed 
                                    ? "bg-emerald-500/5 border-emerald-500/20 opacity-60 grayscale hover:grayscale-0" 
                                    : "bg-white/5 border-white/10 hover:border-primary/50 hover:bg-white/[0.08]"
                            )}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover/card:scale-110",
                                    step.completed ? "bg-emerald-500 text-white" : "bg-primary/20 text-primary"
                                )}>
                                    <step.icon className="w-5 h-5" />
                                </div>
                                {step.completed && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                            </div>
                            
                            <h3 className={cn("text-xs font-black uppercase tracking-widest italic mb-1", step.completed ? "text-emerald-500" : "text-foreground")}>
                                {step.title}
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed uppercase tracking-tight">
                                {step.desc}
                            </p>

                            {!step.completed && (
                                <div className="mt-4 flex items-center gap-1 text-[9px] font-black text-primary uppercase tracking-widest group-hover/card:translate-x-1 transition-transform">
                                    Configurer <ChevronRight className="w-3 h-3" />
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
