"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Lock, Mail, ArrowRight, User } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";
import { toast } from "sonner";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Écoute les événements d'auth pour capturer la récupération de mot de passe
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === "PASSWORD_RECOVERY") {
                router.push("/auth/reset-password");
            }
        });

        return () => subscription.unsubscribe();
    }, [router]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        }
                    }
                });
                if (signUpError) throw signUpError;
                toast.success("Demande transmise ! Vérifie ton email.");
                setIsSignUp(false);
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                toast.success(`Content de vous revoir, Mentor ! ✨`);
                setTimeout(() => {
                    window.location.href = "/dashboard";
                }, 500);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Erreur inconnue";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            toast.error("Veuillez entrer votre email d'abord.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });
            if (error) throw error;
            toast.success("Lien de réinitialisation envoyé ! Vérifie tes emails.");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Erreur inconnue";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans selection:bg-primary/30 selection:text-foreground relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative z-10 space-y-8 animate-in fade-in zoom-in duration-700">
                {/* Header Branding */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center p-4 bg-card rounded-3xl border border-border shadow-2xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur-xl" />
                        <SafeImage
                            src="/logo.svg?v=4"
                            alt="Logo MINDOS"
                            width={120}
                            height={48}
                            className="relative z-10 drop-shadow-[0_0_15px_hsla(var(--primary)/0.5)] h-12 w-auto"
                            priority
                        />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">
                            {isSignUp ? "Nous rejoindre" : "MINDOS Workspace"}
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                            {isSignUp ? "Commencez votre voyage créatif" : "Votre sanctuaire de productivité"}
                        </p>
                    </div>
                </div>

                <div className="bg-card/50 backdrop-blur-3xl p-6 sm:p-8 rounded-[2rem] border border-border shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-4">
                            {isSignUp && (
                                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Nom Complet</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            required={isSignUp}
                                            placeholder="Musa Tech"
                                            className="w-full bg-background/40 border border-border rounded-2xl pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:bg-background/60 outline-none transition-all font-medium"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Adresse Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="nom@exemple.com"
                                        className="w-full bg-background/40 border border-border rounded-2xl pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:bg-background/60 outline-none transition-all font-medium"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mot de passe</label>
                                    {!isSignUp && (
                                        <button
                                            type="button"
                                            onClick={handleForgotPassword}
                                            className="text-[10px] font-bold text-primary/60 hover:text-primary uppercase tracking-widest transition-colors"
                                        >
                                            Oublié ?
                                        </button>
                                    )}
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-background/40 border border-border rounded-2xl pl-12 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground/30 focus:border-primary/50 focus:bg-background/60 outline-none transition-all font-medium"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-500 text-[11px] text-center font-medium animate-in shake duration-300">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:opacity-90 text-primary-foreground font-bold text-sm h-14 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>{isSignUp ? "Créer mon compte" : "Se connecter"}</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer Toggle */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                            }}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                            {isSignUp ? (
                                <span className="flex items-center justify-center gap-2 font-medium">
                                    Déjà membre ? <b className="text-foreground">Se connecter</b>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2 font-medium">
                                    Nouveau ici ? <b className="text-foreground">Créer un compte</b>
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Additional Links */}
                {!isSignUp && (
                    <div className="mt-8 text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] space-y-2">
                        <p>© 2026 MINDOS</p>
                    </div>
                )}
            </div>
        </div>
    );
}
