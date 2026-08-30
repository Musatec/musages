import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full min-h-[calc(100vh-80px)] bg-background relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
            </div>

            <div className="relative z-10 flex flex-col items-center space-y-10 max-w-md w-full px-6 text-center">
                
                {/* Logo and Spinner */}
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                    <div className="w-20 h-20 bg-card border border-border shadow-2xl rounded-3xl flex items-center justify-center relative z-10">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    </div>
                </div>

                {/* Typography Container */}
                <div className="space-y-6 w-full">
                    {/* Arabic Section */}
                    <div className="space-y-2 animate-in slide-in-from-bottom-4 fade-in duration-700">
                        <h2 className="text-2xl font-black text-foreground font-arabic tracking-wide" dir="rtl">
                            أهلاً بك في مساحتك
                        </h2>
                        <p className="text-sm font-bold text-muted-foreground/80 font-arabic" dir="rtl">
                            جاري تحميل البيانات، يرجى الانتظار لحظات...
                        </p>
                    </div>

                    <div className="w-12 h-px bg-border mx-auto opacity-50" />

                    {/* French Section */}
                    <div className="space-y-2 animate-in slide-in-from-bottom-6 fade-in duration-1000 delay-150">
                        <h2 className="text-xl font-black text-foreground tracking-tight uppercase">
                            Bienvenue dans votre espace
                        </h2>
                        <p className="text-xs font-bold text-muted-foreground/80 tracking-widest uppercase">
                            Chargement des données en cours...
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
