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
  Eye,
  EyeOff,
  BookOpen,
  GraduationCap
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

    return (
        <div className="w-full min-h-screen md:h-screen md:overflow-hidden bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-emerald-500 selection:text-black">
            
            {/* LEFT PANEL: FORM & AUTH (Desktop 5 cols / 6 cols) */}
            <div className={`w-full md:w-1/2 lg:w-5/12 flex flex-col justify-between p-6 sm:p-8 lg:p-10 relative z-10 transition-colors duration-700 overflow-y-auto ${
                isDaara ? "bg-[#040d09]" : "bg-[#0c0904]"
            }`}>
                
                {/* Header Link */}
                <div className="flex items-center justify-between pb-4">
                    <Link href="/" className="flex items-center gap-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full">
                        <span>←</span>
                        <span>Retour à l'Accueil</span>
                    </Link>

                    {/* Mobile Logo Only */}
                    <div className="md:hidden flex items-center gap-2">
                        <img 
                            src={isDaara ? "/logo-daara-ibnoul-khayim.png" : "/logo-pathe-pogne.png"} 
                            alt="Logo" 
                            className="h-7 w-auto object-contain" 
                        />
                        <span className="text-xs font-bold text-amber-300">
                            {isDaara ? "Daara Ibnoul Khayim" : "Pathé Pogne"}
                        </span>
                    </div>
                </div>

                {/* Form Container */}
                <div className="my-auto py-4 space-y-5 max-w-sm w-full mx-auto">
                    
                    {/* Space Switcher Segmented Control */}
                    <div className="p-1.5 bg-slate-950 border border-white/10 rounded-2xl grid grid-cols-2 gap-2 shadow-inner">
                        <button
                            type="button"
                            onClick={() => setActiveSpace("daara")}
                            className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl transition-all duration-300 ${
                                isDaara
                                    ? "bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 border border-emerald-500/60 text-white shadow-md shadow-emerald-950/60"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div className="flex flex-col text-left">
                                <span className="text-xs sm:text-sm font-bold leading-tight">Espace Daara</span>
                                <span className="text-[11px] font-medium text-emerald-300/90 leading-none">Gestion Coranique</span>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveSpace("school")}
                            className={`flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-xl transition-all duration-300 ${
                                !isDaara
                                    ? "bg-gradient-to-r from-amber-950 via-yellow-950 to-amber-900 border border-amber-500/60 text-white shadow-md shadow-amber-950/60"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
                            <div className="flex flex-col text-left">
                                <span className="text-xs sm:text-sm font-bold leading-tight">Pathé Pogne</span>
                                <span className="text-[11px] font-medium text-amber-300/90 leading-none">Franco-Arabe</span>
                            </div>
                        </button>
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            {isSignUp ? "Créer un Établissement" : "Connexion au Portail"}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-300 font-medium">
                            {isDaara ? "Accès sécurisé à la gestion coranique & Hifz 60 Hizbs" : "Accès au portail de direction de l'École Franco-Arabe"}
                        </p>
                    </div>

                    {/* Google OAuth Button */}
                    <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={loading || googleLoading}
                        className="w-full bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-xs sm:text-sm h-11 rounded-xl border border-slate-800 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.99]"
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

                    {/* Divider */}
                    <div className="relative flex items-center justify-center text-[10px] font-bold text-slate-500 uppercase tracking-widest my-1">
                        <div className="w-full border-t border-slate-800" />
                        <span className="bg-[#040d09] px-3 absolute text-slate-500">OU PAR EMAIL</span>
                    </div>

                    {/* Credentials Form */}
                    <form onSubmit={handleAuth} className="space-y-3.5">
                        <AnimatePresence mode="wait">
                            {isSignUp && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-1"
                                >
                                    <label className="text-xs font-semibold text-slate-300">Nom Complet du Responsable</label>
                                    <div className="relative">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: Responsable Établissement"
                                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-xs sm:text-sm transition-all"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-300">Adresse Email Professionnelle</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    placeholder="votre@email.com"
                                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-xs sm:text-sm transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-300">Mot de Passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder:text-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium text-xs sm:text-sm transition-all"
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
                                className="p-2.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs font-semibold text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className={`w-full text-slate-950 font-extrabold text-xs uppercase tracking-wider h-11 rounded-xl transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 mt-2 ${
                                isDaara 
                                    ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 hover:from-emerald-300 hover:to-teal-300 shadow-emerald-950/50" 
                                    : "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 hover:from-amber-300 hover:to-yellow-300 shadow-amber-950/50"
                            }`}
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                            ) : (
                                <>
                                    <span>{isSignUp ? "Inscrire l'Établissement" : `Se Connecter au Portail`}</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Signup / Signin */}
                    <div className="pt-3 border-t border-slate-800 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                            }}
                            className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            {isSignUp ? (
                                <span>Déjà un accès ? <b className="text-emerald-400 font-bold underline">Se connecter</b></span>
                            ) : (
                                <span>Nouveau responsable ? <b className="text-amber-400 font-bold underline">Créer un compte</b></span>
                            )}
                        </button>
                    </div>

                </div>

                {/* Footer */}
                <footer className="pt-4 text-center text-[11px] text-slate-500 font-medium">
                    <p>© 2026 Daara Ibnoul Khayim & École Pathé Pogne</p>
                </footer>

            </div>

            {/* RIGHT PANEL: MINIMALIST BRANDING SHOWCASE (Desktop) */}
            <div className={`hidden md:flex md:w-1/2 lg:w-7/12 flex-col justify-between p-10 lg:p-16 relative overflow-hidden text-white border-l transition-colors duration-700 ${
                isDaara 
                    ? "bg-gradient-to-br from-[#051c13] via-[#07291b] to-[#03130c] border-emerald-500/20" 
                    : "bg-gradient-to-br from-[#1c1305] via-[#291b07] to-[#130c03] border-amber-500/20"
            }`}>

                {/* Background Ambient Glow Lights */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className={`absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[150px] animate-pulse ${
                        isDaara ? "bg-emerald-500/15" : "bg-amber-500/15"
                    }`} />
                    <div className={`absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full blur-[150px] animate-pulse ${
                        isDaara ? "bg-teal-500/10" : "bg-yellow-500/10"
                    }`} />
                </div>

                {/* Grid Overlay */}
                <div 
                    className="absolute inset-0 opacity-[0.025] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.4) 1px, transparent 0)`,
                        backgroundSize: "32px 32px",
                    }}
                />

                {/* Top Header Branding */}
                <div className="relative z-10 flex items-center gap-4">
                    <div className="p-3 bg-slate-900/60 border border-white/10 rounded-2xl backdrop-blur-xl shadow-xl">
                        <img 
                            src={isDaara ? "/logo-daara-ibnoul-khayim.png" : "/logo-pathe-pogne.png"} 
                            alt="Logo Établissement" 
                            className="h-12 w-auto object-contain shrink-0" 
                        />
                    </div>
                    <div>
                        <h2 className="text-base font-extrabold text-amber-300 tracking-tight">
                            {isDaara ? "ÉCOLE IBNOUL KHAYIM AL JAWZIYA" : "ÉCOLE FRANCO-ARABE PATHÉ POGNE"}
                        </h2>
                        <p className="text-xs text-emerald-400 font-arabic font-bold opacity-90" dir="rtl">
                            {isDaara ? "مدرسة ابن القيم الجوزية" : "المدرسة العربية الفرنسية PATHÉ POGNE"}
                        </p>
                    </div>
                </div>

                {/* Center Hero Title */}
                <div className="relative z-10 my-auto py-10 space-y-4 max-w-lg">
                    <h3 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
                        {isDaara 
                            ? "Le suivi d'excellence pour votre Daara." 
                            : "L'éducation qui réunit savoir, valeurs et réussite."}
                    </h3>
                    <p className="text-sm text-slate-300/80 leading-relaxed font-normal">
                        {isDaara
                            ? "Plateforme sécurisée de gestion coranique, suivi du Hifz 60 Hizbs et pilotage pédagogique."
                            : "Portail de direction et de gestion de l'Établissement Franco-Arabe Pathé Pogne."}
                    </p>
                </div>

                {/* Bottom Minimal Hadith / Citation */}
                <div className="relative z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col space-y-1 max-w-md">
                    <p className="text-xs font-arabic font-bold text-amber-200" dir="rtl">
                        {isDaara ? "« خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ »" : "« مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ »"}
                    </p>
                    <p className="text-xs text-slate-300 italic">
                        {isDaara 
                            ? "« Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne. »" 
                            : "« Une éducation de qualité et d'excellence. »"}
                    </p>
                </div>

            </div>

        </div>
    );
}
