"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { signIn } from "next-auth/react";
import { 
  Loader2, 
  Lock, 
  Mail, 
  ArrowRight, 
  User
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { register } from "@/lib/actions/auth";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planParam = searchParams?.get("plan")?.toUpperCase();
    const modeParam = searchParams?.get("mode");

    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(modeParam === "signup" || (planParam ? true : false));
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleAuth = async () => {
        setGoogleLoading(true);
        await signIn("google", { callbackUrl: "/dashboard" });
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const result = await register({
                    email,
                    password,
                    name: fullName
                });

                if (result.error) {
                    throw new Error(result.error);
                }

                toast.success("Établissement configuré ! Connexion en cours...");
                
                const loginRes = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (loginRes?.error) {
                    setIsSignUp(false);
                    return;
                }
                
                router.push("/dashboard");
            } else {
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    throw new Error("Identifiants invalides (Email ou mot de passe incorrect)");
                }

                toast.success("Bienvenue sur DigiDaara !");
                router.push("/dashboard");
            }
        } catch (err: any) {
            const message = err.message || "Une erreur est survenue lors de la connexion";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickFill = () => {
        setEmail("admin@taleem.app");
        setPassword("password123");
        toast.info("Identifiants de test préremplis !");
    };

    return (
        <div className="h-screen max-h-screen w-full bg-[#0A192F] text-white flex flex-col justify-between p-4 md:p-6 overflow-hidden font-sans selection:bg-[#0C5A34] selection:text-white">
            
            {/* HEADER COMPACT (ZÉRO SCROLL) */}
            <header className="w-full flex items-center justify-between pb-2 border-b border-[#0C5A34]/50">
                <Link href="/" className="flex items-center gap-3">
                    <img src="/logo-daara-ibnoul-khayim.png" alt="Daara Ibnoul Khayim Al Diawziya" className="h-14 md:h-16 w-auto object-contain shrink-0" />
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-[#D4AF37] uppercase tracking-wider">
                            École Ibnoul Khayim
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 font-serif dir-rtl">
                            مدرسة ابن القيم الجوزية
                        </span>
                    </div>
                </Link>

                <Link href="/" className="text-xs font-bold text-slate-300 hover:text-white transition-colors">
                    ← Accueil
                </Link>
            </header>

            {/* MAIN FORM CARD - COMPACT 100% FIT IN VIEWPORT */}
            <main className="w-full flex-1 flex items-center justify-center py-2">
                <div className="w-full max-w-sm bg-[#081325] border border-[#0C5A34] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4">
                    
                    {/* TITLE */}
                    <div className="text-center space-y-1">
                        <h1 className="text-2xl font-black text-white tracking-tight">
                            {isSignUp ? "Créer un Daara" : "Connexion"}
                        </h1>
                        <p className="text-xs text-slate-300 font-medium">
                            {isSignUp ? "Inscrivez votre Daara pour démarrer" : "Accédez à votre espace E-Daara"}
                        </p>
                    </div>

                    {/* GOOGLE SIGN IN */}
                    <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={loading || googleLoading}
                        className="w-full bg-[#0A192F] hover:bg-[#06381F] text-white font-bold text-xs h-10 rounded-xl border border-[#0C5A34] transition-all flex items-center justify-center gap-2.5 shadow-sm"
                    >
                        {googleLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" className="w-4 h-4">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Continuer avec Google</span>
                            </>
                        )}
                    </button>

                    <div className="relative flex items-center justify-center text-[10px] font-bold text-slate-300">
                        <div className="w-full border-t border-[#0C5A34]/60" />
                        <span className="bg-[#081325] px-2.5 absolute">OU EMAIL</span>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleAuth} className="space-y-3">
                        <AnimatePresence mode="wait">
                            {isSignUp && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-1"
                                >
                                    <label className="text-[11px] font-bold text-slate-200">Directeur / Serigne Daara</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="El Hadji Mouhamadou Fall"
                                            className="w-full bg-[#0A192F] border border-[#0C5A34] rounded-xl pl-10 pr-3 py-2.5 text-white placeholder:text-slate-400 focus:border-[#D4AF37] outline-none font-medium text-xs"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-200">Adresse Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                <input
                                    type="email"
                                    required
                                    placeholder="contact@daara.sn"
                                    className="w-full bg-[#0A192F] border border-[#0C5A34] rounded-xl pl-10 pr-3 py-2.5 text-white placeholder:text-slate-400 focus:border-[#D4AF37] outline-none font-medium text-xs"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-200">Mot de Passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full bg-[#0A192F] border border-[#0C5A34] rounded-xl pl-10 pr-3 py-2.5 text-white placeholder:text-slate-400 focus:border-[#D4AF37] outline-none font-medium text-xs"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-2 bg-red-600/20 border border-red-500/40 rounded-lg text-red-200 text-[11px] font-bold text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className="w-full bg-[#0C5A34] hover:bg-[#06381F] text-white font-black text-xs uppercase tracking-wider h-11 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <span>{isSignUp ? "Inscrire mon Daara" : "Se Connecter"}</span>
                                    <ArrowRight className="h-4 w-4 text-[#FFE57F]" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* QUICK DEMO & TOGGLE */}
                    <div className="pt-2 border-t border-[#0C5A34]/60 flex flex-col gap-1.5 text-center">
                        <button
                            type="button"
                            onClick={handleQuickFill}
                            className="text-[11px] font-bold text-[#D4AF37] hover:underline"
                        >
                            ⚡ Identifiants de démonstration
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                            }}
                            className="text-[11px] font-bold text-slate-300 hover:text-white transition-colors"
                        >
                            {isSignUp ? (
                                <span>Déjà inscrit ? <b className="text-[#F68048]">Se connecter</b></span>
                            ) : (
                                <span>Nouveau ? <b className="text-[#F68048]">Inscrire un Daara</b></span>
                            )}
                        </button>
                    </div>

                </div>
            </main>

            {/* FOOTER COMPACT */}
            <footer className="w-full py-2 text-center text-[11px] font-medium text-slate-400 border-t border-[#1A2CA3]/80">
                <p>© 2026 DigiDaara — Connexion & Gestion des Daaras</p>
            </footer>

        </div>
    );
}
