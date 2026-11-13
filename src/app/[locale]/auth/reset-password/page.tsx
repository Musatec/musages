"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, ArrowLeft } from "lucide-react";
import { SafeImage } from "@/components/ui/safe-image";

export default function ResetPasswordPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans selection:bg-[hsl(var(--primary))] selection:text-foreground relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[hsl(var(--primary))]/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative z-10 space-y-8 animate-in fade-in zoom-in duration-700">
                {/* Header Branding */}
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center justify-center p-4 bg-[#1C1C1E] rounded-3xl border border-border/50 shadow-2xl relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--primary))]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl blur-xl" />
                        <SafeImage
                            src="/logo-daara-ibnoul-khayim.png"
                            alt="Daara Ibnoul Khayim Al Diawziya"
                            width={140}
                            height={56}
                            className="relative z-10 drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] h-14 w-auto object-contain"
                            priority
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-center gap-2 text-[hsl(var(--primary))] mb-2">
                            <ShieldCheck className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocole de Sécurité</span>
                        </div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">
                            Réinitialisation assistée
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium max-w-sm mx-auto">
                            La réinitialisation autonome par e-mail est temporairement désactivée.
                        </p>
                    </div>
                </div>

                <div className="bg-[#1C1C1E]/50 backdrop-blur-3xl p-6 sm:p-8 rounded-[2rem] border border-border/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-5 text-center">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-[hsl(var(--primary))]/10 flex items-center justify-center text-[hsl(var(--primary))]">
                        <Lock className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Pour des raisons de sécurité, veuillez contacter le Serigne Daara ou l&apos;administrateur de votre établissement afin de réinitialiser votre accès ou d&apos;utiliser la connexion Google associée.
                    </p>
                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="w-full bg-[hsl(var(--primary))] hover:bg-primary text-foreground font-bold text-sm h-12 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Retourner à la connexion</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
