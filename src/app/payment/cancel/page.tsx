import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

export default async function PaymentCancelPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4">
            <div className="relative z-10 max-w-md w-full text-center space-y-8">
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic leading-none">
                        PAIEMENT <br />
                        <span className="text-gray-500 text-2xl">ANNULÉ.</span>
                    </h1>
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] leading-relaxed italic">
                        La transaction a été interrompue. Votre compte n'a pas été débité. <br />
                        Vous pouvez réessayer ou choisir un autre mode de paiement.
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <Link 
                        href={`/${locale}/pricing`}
                        className="flex w-full py-5 bg-primary text-black rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] italic items-center justify-center gap-2 shadow-2xl hover:scale-[1.02] transition-all active:scale-95"
                    >
                        Réessayer le Paiement
                        <RefreshCw className="w-4 h-4" />
                    </Link>

                    <Link 
                        href={`/${locale}/dashboard`}
                        className="flex w-full py-5 bg-white/5 border border-white/10 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] italic items-center justify-center gap-2 hover:bg-white/10 transition-all active:scale-95"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour au Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
