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
  Zap,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck
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
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);

    const isDaara = activeSpace === "daara";

    const handleGoogleAuth = async () => {
        setGoogleLoading(true);
        try {
            await signIn("google", { callbackUrl: "/dashboard" });
        } catch (err) {
            setGoogleLoading(false);
        }
    };

    const handleAuth = async (e?: React.FormEvent, overrideEmail?: string, overridePassword?: string) => {
        if (e) e.preventDefault();
        
        const targetEmail = overrideEmail || email;
        const targetPassword = overridePassword || password;

        if (!targetEmail || !targetPassword) {
            toast.error("Veuillez saisir votre email et mot de passe.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const result = await register({
                    email: targetEmail,
                    password: targetPassword,
                    name: fullName || (isDaara ? "Serigne Daara Ibnoul Khayim" : "Directeur Pathé Pogne")
                });

                if (result.error && !result.error.includes("déjà utilisé")) {
                    throw new Error(result.error);
                }

                toast.success("Établissement configuré ! Connexion en cours...");
            }

            // Authentification NextAuth Credentials
            let loginRes = await signIn("credentials", {
                email: targetEmail,
                password: targetPassword,
                redirect: false,
            });

            // Auto-création si utilisateur démo non présent dans la BD
            if (loginRes?.error) {
                if (targetEmail === "admin@taleem.app" || targetEmail === "directeur@pathepogne.sn") {
                    await register({
                        email: targetEmail,
                        password: targetPassword,
                        name: targetEmail.includes("pathepogne") ? "Directeur Pathé Pogne" : "Serigne Daara Ibnoul Khayim"
                    });
                    loginRes = await signIn("credentials", {
                        email: targetEmail,
                        password: targetPassword,
                        redirect: false,
                    });
                }
            }

            if (loginRes?.error) {
                throw new Error("Email ou mot de passe incorrect. Veuillez vérifier vos identifiants.");
            }

            const spaceName = isDaara ? "Espace Daara Ibnoul Khayim" : "Espace École Pathé Pogne";
            toast.success(`Bienvenue sur ${spaceName} !`);
            window.location.href = "/dashboard";
        } catch (err: any) {
            const message = err.message || "Une erreur est survenue lors de la connexion";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickDemoLogin = async (target: "daara" | "school") => {
        setIsSignUp(false);
        setError(null);
        
        let demoEmail = "admin@taleem.app";
        let demoPassword = "password123";

        if (target === "daara") {
            setActiveSpace("daara");
            setEmail(demoEmail);
            setPassword(demoPassword);
            toast.info("Connexion automatique Espace Daara en cours...");
        } else {
            setActiveSpace("school");
            demoEmail = "directeur@pathepogne.sn";
            setEmail(demoEmail);
            setPassword(demoPassword);
            toast.info("Connexion automatique École Pathé Pogne en cours...");
        }

        await handleAuth(undefined, demoEmail, demoPassword);
    };

    return (
        <div className={`min-h-screen w-full text-white flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans selection:bg-emerald-500 selection:text-black relative overflow-hidden transition-colors duration-700 ${
            isDaara ? "bg-[#030A14]" : "bg-[#0A0703]"
        }`}>
            
            {/* AMBIENT GLOW EFFECTS */}
            <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
                isDaara ? "bg-emerald-600/20" : "bg-amber-600/20"
            }`} />
            <div className={`absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
                isDaara ? "bg-teal-500/15" : "bg-yellow-600/15"
            }`} />

            {/* HEADER COMPACT & ELEGANT */}
            <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between pb-4 border-b border-white/10">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="relative">
                        <img 
                            src={isDaara ? "/logo-daara-ibnoul-khayim.png" : "/logo-pathe-pogne.png"} 
                            alt={isDaara ? "Daara Ibnoul Khayim" : "École Pathé Pogne"} 
                            className="h-11 sm:h-13 w-auto object-contain shrink-0 rounded-xl drop-shadow-xl transition-all duration-300 group-hover:scale-105" 
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-black text-[#D4AF37] uppercase tracking-wider">
                            {isDaara ? "École Ibnoul Khayim Al Jawziya" : "École Franco-Arabe Pathé Pogne"}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 font-serif dir-rtl opacity-90">
                            {isDaara ? "مدرسة ابن القيم الجوزية" : "المدرسة العربية الفرنسية PATHÉ POGNE"}
                        </span>
                    </div>
                </Link>

                <Link href="/" className="text-xs font-bold text-slate-300 hover:text-white transition-colors bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 flex items-center gap-1.5 shadow-sm">
                    ← <span className="hidden sm:inline">Retour à</span> l'Accueil
                </Link>
            </header>

            {/* MAIN FORM CARD */}
            <main className="relative z-10 w-full max-w-md sm:max-w-lg mx-auto flex-1 flex flex-col items-center justify-center py-6 sm:py-10">
                
                {/* 1. ESPACE SELECTOR TABS */}
                <div className="w-full grid grid-cols-2 gap-3 mb-6 p-1.5 bg-slate-950/70 border border-white/10 rounded-2xl backdrop-blur-xl shadow-xl">
                    <button
                        type="button"
                        onClick={() => {
                            setActiveSpace("daara");
                            if (email === "directeur@pathepogne.sn") setEmail("admin@taleem.app");
                        }}
                        className={`relative flex items-center justify-center gap-2.5 p-3 rounded-xl border transition-all duration-300 text-center ${
                            isDaara
                                ? "bg-gradient-to-r from-emerald-950 to-teal-900 border-emerald-500/80 shadow-lg shadow-emerald-950/80 text-white font-extrabold"
                                : "border-transparent text-slate-400 hover:text-white hover:bg-white/5 font-medium"
                        }`}
                    >
                        <img src="/logo-daara-ibnoul-khayim.png" alt="Daara" className="h-6 w-6 object-contain shrink-0" />
                        <div className="flex flex-col text-left">
                            <span className="text-xs font-black leading-tight">Espace Daara</span>
                            <span className="text-[9px] text-emerald-300 font-medium opacity-90">60 Hizbs</span>
                        </div>
                        {isDaara && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveSpace("school");
                            if (email === "admin@taleem.app") setEmail("directeur@pathepogne.sn");
                        }}
                        className={`relative flex items-center justify-center gap-2.5 p-3 rounded-xl border transition-all duration-300 text-center ${
                            !isDaara
                                ? "bg-gradient-to-r from-amber-950 to-yellow-900 border-amber-500/80 shadow-lg shadow-amber-950/80 text-white font-extrabold"
                                : "border-transparent text-slate-400 hover:text-white hover:bg-white/5 font-medium"
                        }`}
                    >
                        <img src="/logo-pathe-pogne.png" alt="École Pathé Pogne" className="h-6 w-6 object-contain shrink-0" />
                        <div className="flex flex-col text-left">
                            <span className="text-xs font-black leading-tight">École Pathé Pogne</span>
                            <span className="text-[9px] text-amber-300 font-medium opacity-90">Franco-Arabe</span>
                        </div>
                        {!isDaara && (
                            <CheckCircle2 className="w-4 h-4 text-amber-400 ml-auto shrink-0" />
                        )}
                    </button>
                </div>

                {/* 2. MAIN CARD FORM */}
                <div className={`w-full bg-slate-900/85 border rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 transition-all duration-500 ${
                    isDaara ? "border-emerald-500/30 shadow-emerald-950/50" : "border-amber-500/30 shadow-amber-950/50"
                }`}>
                    
                    {/* CARD TITLE & SPACE BADGE */}
                    <div className="text-center space-y-2">
                        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                            isDaara 
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                        }`}>
                            <Sparkles className="w-3.5 h-3.5" />
                            {isDaara ? "🕌 Espace Daara Ibnoul Khayim" : "🎓 Espace École Franco-Arabe Pathé Pogne"}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            {isSignUp ? "Créer un Établissement" : "Portail de Connexion"}
                        </h1>
                        <p className="text-xs text-slate-300 font-medium max-w-sm mx-auto">
                            {isSignUp 
                                ? "Configurez votre accès de direction et gérez votre établissement" 
                                : isDaara 
                                    ? "Accès sécurisé à la gestion coranique & Hifz 60 Hizbs" 
                                    : "Accès au portail de direction de l'École Franco-Arabe"}
                        </p>
                    </div>

                    {/* GOOGLE SIGN IN */}
                    <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={loading || googleLoading}
                        className="w-full bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-xs h-12 rounded-2xl border border-slate-700/80 transition-all flex items-center justify-center gap-3 shadow-md hover:border-slate-500 active:scale-[0.98]"
                    >
                        {googleLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Continuer avec Google</span>
                            </>
                        )}
                    </button>

                    <div className="relative flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <div className="w-full border-t border-slate-800" />
                        <span className="bg-slate-900 px-3 absolute text-slate-400">OU PAR EMAIL</span>
                    </div>

                    {/* CREDENTIALS FORM */}
                    <form onSubmit={handleAuth} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {isSignUp && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-1.5"
                                >
                                    <label className="text-xs font-bold text-slate-200">Nom Complet du Responsable</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: Directeur Pathé Pogne"
                                            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-xs transition-all"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-200">Adresse Email Professionnelle</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    placeholder={isDaara ? "admin@taleem.app" : "directeur@pathepogne.sn"}
                                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-xs transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-200">Mot de Passe</label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-10 pr-10 py-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-xs transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -5 }} 
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-300 text-xs font-bold text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className={`w-full text-black font-black text-xs uppercase tracking-widest h-12 rounded-2xl transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2 mt-2 ${
                                isDaara 
                                    ? "bg-emerald-400 hover:bg-emerald-300 shadow-emerald-500/20" 
                                    : "bg-amber-400 hover:bg-amber-300 shadow-amber-500/20"
                            }`}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-black" />
                            ) : (
                                <>
                                    <span>{isSignUp ? "Inscrire l'Établissement" : `Se Connecter au Portail`}</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* INSTANT ONE-CLICK DEMO LOGIN */}
                    <div className="pt-4 border-t border-slate-800 space-y-3">
                        <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">
                            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            <span>Accès Démo Instantané (1-Clic)</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={() => handleQuickDemoLogin("daara")}
                                disabled={loading}
                                className="p-3 bg-emerald-950/40 border border-emerald-500/40 hover:bg-emerald-900/60 rounded-2xl text-xs font-bold text-emerald-300 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                            >
                                <span className="flex items-center gap-1 font-black uppercase text-[10px] text-emerald-400">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Démo Daara
                                </span>
                                <span className="text-[9px] text-emerald-200/70 font-mono">admin@taleem.app</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleQuickDemoLogin("school")}
                                disabled={loading}
                                className="p-3 bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/60 rounded-2xl text-xs font-bold text-amber-300 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 shadow-sm"
                            >
                                <span className="flex items-center gap-1 font-black uppercase text-[10px] text-amber-400">
                                    <ShieldCheck className="w-3.5 h-3.5" /> Démo Pathé Pogne
                                </span>
                                <span className="text-[9px] text-amber-200/70 font-mono">directeur@pathepogne.sn</span>
                            </button>
                        </div>

                        <div className="text-center pt-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError(null);
                                }}
                                className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
                            >
                                {isSignUp ? (
                                    <span>Déjà un accès ? <b className="text-emerald-400 underline">Se connecter</b></span>
                                ) : (
                                    <span>Nouveau responsable ? <b className="text-amber-400 underline">Créer un compte</b></span>
                                )}
                            </button>
                        </div>
                    </div>

                </div>
            </main>

            {/* FOOTER */}
            <footer className="relative z-10 w-full max-w-5xl mx-auto py-3 text-center text-xs font-medium text-slate-500 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p>© 2026 Daara Ibnoul Khayim & École Franco-Arabe Pathé Pogne</p>
                <p className="text-[11px] text-emerald-400/90 italic font-serif">"Pathé Pogne, c’est une éducation qui réunit savoir, valeurs et réussite."</p>
            </footer>

        </div>
    );
}
