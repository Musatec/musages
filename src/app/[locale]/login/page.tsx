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
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { register } from "@/lib/actions/auth";
import { useSearchParams } from "next/navigation";

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
                // Inscription
                const result = await register({
                    email,
                    password,
                    name: fullName
                });

                if (result.error) {
                    throw new Error(result.error);
                }

                toast.success("Établissement configuré ! Connexion en cours... ✨");
                
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
                // Connexion
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    throw new Error("Identifiants invalides (Email ou mot de passe incorrect)");
                }

                toast.success("Content de vous revoir sur TaleemApp ! ✨");
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
        <div className="h-screen w-full bg-[#0a0a0a] flex overflow-hidden font-sans text-white">
            
            {/* LEFT PANEL - BRANDING (Hidden on mobile) */}
            <div className="hidden lg:flex w-1/2 relative flex-col items-center justify-center p-12 border-r border-white/5 bg-[#0a0a0a]">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[10%] -left-[20%] w-[80%] h-[80%] bg-emerald-600/20 blur-[150px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[10%] -right-[20%] w-[80%] h-[80%] bg-blue-600/10 blur-[150px] rounded-full" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    <img 
                        src="/logo-taleem.png" 
                        alt="TaleemApp Logo" 
                        className="h-32 md:h-40 w-auto object-contain mb-8 drop-shadow-2xl mix-blend-screen"
                    />
                    
                    <h1 className="text-5xl font-black italic tracking-tighter mb-6">
                        Taleem<span className="text-emerald-400">App</span>
                    </h1>
                    
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                        SaaS de Gestion Scolaire Franco-Arabe
                    </h2>
                    
                    <h3 className="text-2xl md:text-3xl font-black text-emerald-400 mb-8" dir="rtl">
                        برنامج الإدارة المدرسية فرنسي-عربي
                    </h3>
                    
                    <p className="text-white/50 text-sm max-w-md font-medium leading-relaxed">
                        Gérez vos inscriptions, notes, présences et trésorerie sur une plateforme bilingue conçue sur mesure pour les écoles franco-arabes et Daaras.
                    </p>
                </div>
            </div>

            {/* RIGHT PANEL - FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative overflow-y-auto">
                {/* Mobile Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
                    <div className="absolute top-[20%] left-[10%] w-[70%] h-[70%] bg-emerald-600/10 blur-[100px] rounded-full" />
                </div>

                <div className="w-full max-w-sm relative z-10">
                    {/* Mobile Logo Header */}
                    <div className="lg:hidden flex flex-col items-center mb-8">
                        <img 
                            src="/logo-taleem.png" 
                            alt="TaleemApp Logo" 
                            className="h-24 w-auto object-contain mb-4 drop-shadow-xl mix-blend-screen"
                        />
                        <h1 className="text-3xl font-black italic tracking-tighter">
                            Taleem<span className="text-emerald-400">App</span>
                        </h1>
                        <h3 className="text-sm font-black text-emerald-400 mt-2" dir="rtl">الإدارة المدرسية</h3>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black tracking-tight mb-2 flex flex-col gap-1">
                            <span>{isSignUp ? "Créez votre École" : "Bon retour"}</span>
                            <span className="text-lg text-white/50 font-arabic" dir="rtl">{isSignUp ? "أنشئ مدرستك" : "أهلاً بك مجدداً"}</span>
                        </h2>
                    </div>

                    {/* Google Auth */}
                    <button
                        type="button"
                        onClick={handleGoogleAuth}
                        disabled={loading || googleLoading}
                        className="w-full bg-white text-black hover:bg-gray-100 font-bold text-sm h-12 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl disabled:opacity-50 mb-6"
                    >
                        {googleLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" className="w-5 h-5">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="flex items-center gap-2">Continuer avec Google <span className="text-[10px] text-gray-500 font-arabic border-l border-gray-300 pl-2 ml-1" dir="rtl">جوجل</span></span>
                            </>
                        )}
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-white/40">
                            <span className="bg-[#0a0a0a] px-4">Ou Email / أو البريد الإلكتروني</span>
                        </div>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {isSignUp && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-1.5 pb-2">
                                        <div className="flex justify-between items-center px-1">
                                            <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Nom</label>
                                            <label className="text-[10px] font-black text-white/50 font-arabic" dir="rtl">الاسم</label>
                                        </div>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Directeur"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/20 focus:border-emerald-400/50 outline-none transition-all font-bold text-sm"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Email</label>
                                <label className="text-[10px] font-black text-white/50 font-arabic" dir="rtl">البريد الإلكتروني</label>
                            </div>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    placeholder="ecole@taleem.sn"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/20 focus:border-emerald-400/50 outline-none transition-all font-bold text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Mot de Passe</label>
                                <label className="text-[10px] font-black text-white/50 font-arabic" dir="rtl">كلمة المرور</label>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••••••"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/20 focus:border-emerald-400/50 outline-none transition-all font-bold text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || googleLoading}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-[0.2em] h-14 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50 mt-6"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>{isSignUp ? "S'inscrire" : "Connexion"}</span>
                                    <span className="font-arabic tracking-normal text-[14px]" dir="rtl">{isSignUp ? "تسجيل" : "دخول"}</span>
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center flex flex-col gap-4">
                        <button
                            type="button"
                            onClick={handleQuickFill}
                            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                            ⚡ Remplir Compte Démo / حساب تجريبي
                        </button>

                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                            }}
                            className="text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                        >
                            {isSignUp ? (
                                <span>Déjà inscrit ? <b className="text-emerald-400">Se connecter</b></span>
                            ) : (
                                <span>Nouveau ? <b className="text-emerald-400">Inscrire une école</b></span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
