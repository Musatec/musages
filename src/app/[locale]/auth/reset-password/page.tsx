"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas.");
            return;
        }

        if (password.length < 6) {
            toast.error("Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: resetError } = await supabase.auth.updateUser({
                password: password
            });

            if (resetError) throw resetError;

            toast.success("Protocole de sécurité mis à jour ! ✨");
            // Rediriger vers le dashboard car l'utilisateur est techniquement connecté après un reset réussi
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans selection:bg-[#F97316] selection:text-white relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#F97316]/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative z-10 space-y-8 animate-in fade-in zoom-in duration-700">
                {/* Header Branding */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center p-4 bg-[#1C1C1E] rounded-3xl border border-white/5 shadow-2xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur-xl" />
                        <img
                            src="/logo.svg?v=4"
                            alt="Logo MINDOS"
                            className="relative z-10 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)] h-12 w-auto"
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-center gap-2 text-[#F97316] mb-2">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocole de Sécurité</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                            Restauration.
                        </h1>
                        <p className="text-gray-500 text-sm font-medium tracking-wide uppercase max-w-[280px] mx-auto">
                            Définissez votre nouveau mot de passe de Maîtrise pour réintégrer le Sanctuaire.
                        </p>
                    </div>
                </div>

                <div className="bg-[#1C1C1E]/50 backdrop-blur-3xl p-6 sm:p-8 rounded-[2rem] border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
                    <form onSubmit={handleReset} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nouveau Mot de passe</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-[#F97316] transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-700 focus:border-[#F97316]/50 focus:bg-black/60 outline-none transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirmer le Mot de passe</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-[#F97316] transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-700 focus:border-[#F97316]/50 focus:bg-black/60 outline-none transition-all"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                            className="w-full bg-[#F97316] hover:bg-orange-600 text-white font-bold text-sm h-14 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-orange-500/20 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Confirmer le nouveau code</span>
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => router.push('/login')}
                        className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-widest font-black"
                    >
                        Retourner à la porte
                    </button>
                </div>
            </div>
        </div>
    );
}
