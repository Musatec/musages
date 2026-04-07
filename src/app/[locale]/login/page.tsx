"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { signIn } from "next-auth/react";
import { 
  Loader2, 
  Lock, 
  Mail, 
  ArrowRight, 
  User,
  ShieldCheck,
  Zap,
  LayoutDashboard
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { register } from "@/lib/actions/auth";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import NextImage from "next/image";
import { useTheme } from "next-themes";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { theme } = useTheme();
    const planParam = searchParams?.get("plan")?.toUpperCase();

    const logoSrc = theme === "light" ? "/logo-black.svg" : "/logo.svg";
    
    // Memory: Save plan to cookie if present
    useEffect(() => {
        if (planParam) {
            document.cookie = `mindos_plan=${planParam}; path=/; max-age=3600`;
        }
    }, [planParam]);

    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(planParam ? true : false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [enterpriseName, setEnterpriseName] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                // Register flow
                const result = await register({
                    email,
                    password,
                    name: fullName,
                    enterpriseName
                });

                if (result.error) {
                    throw new Error(result.error);
                }

                toast.success("Compte créé avec succès ! Connectez-vous.");
                setIsSignUp(false);
            } else {
                // Login flow
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    throw new Error("Identifiants invalides");
                }

                toast.success(`Content de vous revoir ! ✨`);
                router.push("/dashboard");
            }
        } catch (err: any) {
            const message = err.message || "Une erreur est survenue";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative z-10 space-y-6">
                {/* Logo & Welcome */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="flex justify-center mb-6">
                        <div className="relative w-48 h-12">
                            <NextImage 
                                src={logoSrc} 
                                alt="Mindos Logo" 
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {isSignUp && planParam && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={cn(
                                    "p-6 rounded-[2rem] border-2 mb-8 relative overflow-hidden",
                                    planParam === "BUSINESS" ? "bg-blue-500/10 border-blue-500/30" : 
                                    planParam === "GROWTH" ? "bg-primary/10 border-primary/30" :
                                    "bg-foreground/5 border-border"
                                )}
                            >
                                <div className="relative z-10 text-center space-y-1">
                                    <h2 className={cn(
                                        "text-2xl font-black uppercase tracking-tighter italic",
                                        planParam === "BUSINESS" ? "text-blue-500" : 
                                        planParam === "GROWTH" ? "text-primary" : "text-foreground"
                                    )}>
                                        Plan {planParam}.
                                    </h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                                        Configuration de votre accès privilégié
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <h1 className="text-4xl font-black text-foreground tracking-tighter">
                        {isSignUp ? "Créez votre accès" : "Bienvenue Mentor"}
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        {isSignUp ? "Rejoignez l'écosystème de gestion intelligente" : "Accédez à votre centre de commandement"}
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-card border border-border shadow-2xl rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden"
                >
                    {/* Glassmorphism Effect */}
                    <div className="absolute inset-0 bg-foreground/[0.02] backdrop-blur-3xl" />
                    
                    <form onSubmit={handleAuth} className="relative z-10 space-y-4">
                        <AnimatePresence mode="wait">
                            {isSignUp && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nom Complet</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Ex: John Doe"
                                                    className="w-full bg-foreground/5 border border-border rounded-xl pl-10 pr-3 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-foreground/10 outline-none transition-all font-bold text-sm"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Entreprise</label>
                                            <div className="relative group">
                                                <LayoutDashboard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Focus Corp"
                                                    className="w-full bg-foreground/5 border border-border rounded-xl pl-10 pr-3 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-foreground/10 outline-none transition-all font-bold text-sm"
                                                    value={enterpriseName}
                                                    onChange={(e) => setEnterpriseName(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Email Professionnel</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="nom@entreprise.com"
                                    className="w-full bg-foreground/5 border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-foreground/10 outline-none transition-all font-bold text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Mot de Passe</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full bg-foreground/5 border border-border rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-foreground/10 outline-none transition-all font-bold text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[11px] font-black uppercase tracking-widest text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black text-xs uppercase tracking-[0.2em] h-14 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>{isSignUp ? "Créer l'Accès" : "Entrer dans l'ERP"}</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 relative z-10 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                            }}
                            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                        >
                            {isSignUp ? (
                                <span>Déjà membre ? <b className="text-foreground underline underline-offset-4">Se connecter</b></span>
                            ) : (
                                <span>Nouveau ici ? <b className="text-foreground underline underline-offset-4">Créer un compte</b></span>
                            )}
                        </button>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40"
                >
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3" />
                        SSL Secure
                    </div>
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-3 h-3" />
                        ERP Mode
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

function cn(...inputs: any) {
    return inputs.filter(Boolean).join(" ");
}
