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
  CheckCircle2,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { register } from "@/lib/actions/auth";
import { useSearchParams } from "next/navigation";
import { useSpace } from "@/components/providers/space-provider";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planParam = searchParams?.get("plan")?.toUpperCase();
    const modeParam = searchParams?.get("mode");

    const { activeSpace, setActiveSpace } = useSpace();

    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(modeParam === "signup" || (planParam ? true : false));
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);

    const isDaara = activeSpace === "daara";

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
                
                window.location.href = "/dashboard";
            } else {
                let result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    if (email === "admin@taleem.app" || email === "directeur@pathepogne.sn") {
                        await register({
                            email,
                            password,
                            name: email.includes("pathepogne") ? "Directeur Pathé Pogne" : "Serigne Daara Ibnoul Khayim"
                        });
                        result = await signIn("credentials", {
                            email,
                            password,
                            redirect: false,
                        });
                    }
                }

                if (result?.error) {
                    throw new Error("Identifiants invalides (Email ou mot de passe incorrect)");
                }

                const spaceName = isDaara ? "Espace Daara Ibnoul Khayim" : "Espace École Pathé Pogne";
                toast.success(`Bienvenue sur ${spaceName} !`);
                window.location.href = "/dashboard";
            }
        } catch (err: any) {
            const message = err.message || "Une erreur est survenue lors de la connexion";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickFill = (target: "daara" | "school") => {
        setIsSignUp(false);
        setError(null);
        if (target === "daara") {
            setActiveSpace("daara");
            setEmail("admin@taleem.app");
            setPassword("password123");
            toast.info("Identifiants de démonstration Espace Daara préremplis !");
        } else {
            setActiveSpace("school");
            setEmail("directeur@pathepogne.sn");
            setPassword("password123");
            toast.info("Identifiants de démonstration École Pathé Pogne préremplis !");
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#050B14] text-white flex flex-col justify-between p-4 md:p-6 font-sans selection:bg-emerald-600 selection:text-white">
            
            {/* HEADER COMPACT */}
            <header className="w-full max-w-6xl mx-auto flex items-center justify-between pb-3 border-b border-emerald-900/40">
                <Link href="/" className="flex items-center gap-3">
                    <img 
                        src={isDaara ? "/logo-daara-ibnoul-khayim.png" : "/logo-pathe-pogne.png"} 
                        alt={isDaara ? "Daara Ibnoul Khayim" : "École Pathé Pogne"} 
                        className="h-12 md:h-14 w-auto object-contain shrink-0 rounded-lg drop-shadow-md transition-all duration-300" 
                    />
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-[#D4AF37] uppercase tracking-wider">
                            {isDaara ? "École Ibnoul Khayim Al Jawziya" : "École Franco-Arabe Pathé Pogne"}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 font-serif dir-rtl">
                            {isDaara ? "مدرسة ابن القيم الجوزية" : "المدرسة العربية الفرنسية PATHÉ POGNE"}
                        </span>
                    </div>
                </Link>

                <Link href="/" className="text-xs font-bold text-slate-300 hover:text-white transition-colors">
                    ← Accueil
                </Link>
            </header>

            {/* MAIN FORM CARD */}
            <main className="w-full max-w-xl mx-auto flex-1 flex flex-col items-center justify-center py-6">
                
                {/* 1. ESPACE SELECTOR CARDS */}
                <div className="w-full grid grid-cols-2 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveSpace("daara");
                            if (email === "directeur@pathepogne.sn") setEmail("admin@taleem.app");
                        }}
                        className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all text-center ${
                            isDaara
                                ? "bg-emerald-950/70 border-emerald-500 shadow-lg shadow-emerald-950/50 text-white ring-2 ring-emerald-500/30"
                                : "bg-[#081325] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                    >
                        {isDaara && (
                            <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </span>
                        )}
                        <img src="/logo-daara-ibnoul-khayim.png" alt="Daara" className="h-8 w-8 sm:h-10 sm:w-10 object-contain mb-1" />
                        <span className="text-[11px] sm:text-xs font-black">Espace Daara</span>
                        <span className="text-[9px] sm:text-[10px] text-emerald-400 font-medium opacity-90 leading-tight">60 Hizbs & Solidarité</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveSpace("school");
                            if (email === "admin@taleem.app") setEmail("directeur@pathepogne.sn");
                        }}
                        className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border transition-all text-center ${
                            !isDaara
                                ? "bg-amber-950/70 border-amber-500 shadow-lg shadow-amber-950/50 text-white ring-2 ring-amber-500/30"
                                : "bg-[#081325] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                        }`}
                    >
                        {!isDaara && (
                            <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 text-amber-400">
                                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </span>
                        )}
                        <img src="/logo-pathe-pogne.png" alt="École Pathé Pogne" className="h-8 w-8 sm:h-10 sm:w-10 object-contain mb-1" />
                        <span className="text-[11px] sm:text-xs font-black">École Pathé Pogne</span>
                        <span className="text-[9px] sm:text-[10px] text-amber-400 font-medium opacity-90 leading-tight">Franco-Arabe</span>
                    </button>
                </div>

                {/* 2. CARD FORM */}
                <div className="w-full bg-[#081325] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
                    
                    {/* TITLE */}
                    <div className="text-center space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-[#D4AF37] mb-1">
                            {isDaara ? "🕌 Espace Daara Ibnoul Khayim" : "🎓 Espace École Pathé Pogne"}
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight">
                            {isSignUp ? "Créer un Établissement" : "Connexion à la Direction"}
                        </h1>
                        <p className="text-xs text-slate-300 font-medium">
                            {isSignUp 
                                ? "Configurez votre accès de gestion" 
                                : isDaara 
                                    ? "Accès à la gestion coranique & Hifz" 
                                    : "Accès au portail de l'École Franco-Arabe"}
                        </p>
                    </div>

                    {/* GOOGLE SIGN IN */}
                    <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={loading || googleLoading}
                        className="w-full bg-[#0A192F] hover:bg-[#06381F] text-white font-bold text-xs h-11 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2.5 shadow-sm"
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

                    <div className="relative flex items-center justify-center text-[10px] font-bold text-slate-400">
                        <div className="w-full border-t border-slate-800" />
                        <span className="bg-[#081325] px-2.5 absolute">OU ADRESSE EMAIL</span>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleAuth} className="space-y-3.5">
                        <AnimatePresence mode="wait">
                            {isSignUp && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-1"
                                >
                                    <label className="text-[11px] font-bold text-slate-200">Nom Complet du Responsable</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Directeur Pathé Pogne"
                                            className="w-full bg-[#0A192F] border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 outline-none font-medium text-xs"
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
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    placeholder="contact@daara.sn"
                                    className="w-full bg-[#0A192F] border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 outline-none font-medium text-xs"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[11px] font-bold text-slate-200">Mot de Passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full bg-[#0A192F] border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-white placeholder:text-slate-500 focus:border-emerald-500 outline-none font-medium text-xs"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-2.5 bg-red-600/20 border border-red-500/40 rounded-xl text-red-200 text-[11px] font-bold text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className={`w-full text-white font-black text-xs uppercase tracking-wider h-11 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 mt-2 ${
                                isDaara ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"
                            }`}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <span>{isSignUp ? "Inscrire l'Établissement" : `Se Connecter - ${isDaara ? "Espace Daara" : "Espace École"}`}</span>
                                    <ArrowRight className="h-4 w-4 text-[#FFE57F]" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* QUICK DEMO BUTTONS */}
                    <div className="pt-3 border-t border-slate-800 flex flex-col gap-2 text-center">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            ⚡ Identifiants de Démonstration Rapide
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => handleQuickFill("daara")}
                                className="px-2.5 py-1.5 bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/60 rounded-xl text-[11px] font-bold text-emerald-300 flex items-center justify-center gap-1.5 transition-all"
                            >
                                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Demo Daara</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleQuickFill("school")}
                                className="px-2.5 py-1.5 bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/60 rounded-xl text-[11px] font-bold text-amber-300 flex items-center justify-center gap-1.5 transition-all"
                            >
                                <Zap className="w-3.5 h-3.5 text-amber-400" />
                                <span>Demo Pathé Pogne</span>
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                            }}
                            className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors mt-1"
                        >
                            {isSignUp ? (
                                <span>Déjà un accès ? <b className="text-[#F68048]">Se connecter</b></span>
                            ) : (
                                <span>Nouveau responsable ? <b className="text-[#F68048]">Créer un compte</b></span>
                            )}
                        </button>
                    </div>

                </div>
            </main>

            {/* FOOTER */}
            <footer className="w-full max-w-6xl mx-auto py-3 text-center text-[11px] font-medium text-slate-500 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p>© 2026 Daara Ibnoul Khayim & École Franco-Arabe Pathé Pogne</p>
                <p className="text-[10px] text-emerald-400/80 italic font-serif">"Pathé Pogne, c’est une éducation qui réunit savoir, valeurs et réussite."</p>
            </footer>

        </div>
    );
}
