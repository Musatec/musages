import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { CheckoutForm } from "@/components/modules/subscription/checkout-form";

const VALID_PLANS = ["starter", "growth", "business"];

export default async function CheckoutPage({
    params,
}: {
    params: Promise<{ locale: string; plan: string }>;
}) {
    const session = await auth();
    const { locale, plan } = await params;

    if (!session) {
        redirect(`/${locale}/login?callbackUrl=/${locale}/checkout/${plan}`);
    }

    if (!VALID_PLANS.includes(plan.toLowerCase())) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 relative overflow-hidden flex flex-col p-4 sm:p-8">
            {/* Mesh Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] opacity-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px] opacity-10" />

            <div className="relative z-10 w-full max-w-6xl mx-auto py-12">
                <CheckoutForm plan={plan.toUpperCase() as any} />
            </div>
        </div>
    );
}
