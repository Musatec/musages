import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function PaymentSuccessPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
             {/* Mesh Background */}
             <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] opacity-20" />
             
            <div className="relative z-10 max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary italic">
                        <Sparkles className="w-3 h-3" />
                        Abonnement Activé
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                        ORDRE VALIDÉ. <br />
                        <span className="text-gray-500 text-2xl">SYSTÈME OPÉRATIONNEL.</span>
                    </h1>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] leading-relaxed italic">
                        Félicitations. Votre compte a été mis à niveau avec succès. <br />
                        Toutes les fonctionnalités de votre plan sont débloquées.
                    </p>
                </div>

                <Link 
                    href={`/${locale}/dashboard`}
                    className="flex w-full py-5 bg-white text-black rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] italic items-center justify-center gap-2 shadow-2xl hover:bg-gray-200 transition-all active:scale-95"
                >
                    Accéder au Dashboard
                    <ArrowRight className="w-4 h-4" />
                </Link>

                <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest italic pt-4 border-t border-white/5">
                    Un reçu de paiement vous a été envoyé par email.
                </p>
            </div>
        </div>
    );
}
