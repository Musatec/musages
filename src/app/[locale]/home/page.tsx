import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { NAV_SECTIONS, SUPER_ADMIN_NAV } from "@/config/nav";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { getLocale } from "next-intl/server";
import { 
    LayoutDashboard, 
    CreditCard, 
    GraduationCap, 
    CalendarCheck, 
    Users, 
    BookOpen, 
    UserCheck, 
    TrendingUp, 
    Settings, 
    ShieldCheck, 
    Server, 
    Activity, 
    ArrowUpRight,
    ArrowUpLeft,
    Sparkles,
    CheckCircle2,
    Building2,
    Calendar,
    BadgeCheck
} from "lucide-react";

// Contextual metadata for cards
const ITEM_META: Record<string, { tagFr: string; tagAr: string; gradient: string; iconColor: string; bgSoft: string }> = {
    "/dashboard": {
        tagFr: "Vue Globale & KPIs de l'établissement",
        tagAr: "مؤشرات الأداء والإحصائيات العامة",
        gradient: "from-emerald-500/10 to-teal-500/5",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        bgSoft: "bg-emerald-500/10"
    },
    "/tuition": {
        tagFr: "Recouvrement Wave, OM & Reçus PDF",
        tagAr: "تحصيل واف، أورانج موني والإيصالات",
        gradient: "from-emerald-500/10 to-green-500/5",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        bgSoft: "bg-emerald-500/10"
    },
    "/grades": {
        tagFr: "Calcul des moyennes & Bulletins certifiés",
        tagAr: "حساب المعدلات وإصدار كشوف النقاط",
        gradient: "from-blue-500/10 to-indigo-500/5",
        iconColor: "text-blue-600 dark:text-blue-400",
        bgSoft: "bg-blue-500/10"
    },
    "/attendance": {
        tagFr: "Feuille d'appel & Relances WhatsApp",
        tagAr: "سجل الحضور وإشعارات الواتساب للغياب",
        gradient: "from-cyan-500/10 to-sky-500/5",
        iconColor: "text-cyan-600 dark:text-cyan-400",
        bgSoft: "bg-cyan-500/10"
    },
    "/students": {
        tagFr: "Inscriptions, fiches & dossiers scolaires",
        tagAr: "سجلات الطلاب، التسجيل والملفات",
        gradient: "from-indigo-500/10 to-violet-500/5",
        iconColor: "text-indigo-600 dark:text-indigo-400",
        bgSoft: "bg-indigo-500/10"
    },
    "/classes": {
        tagFr: "Niveaux, matières & emplois du temps",
        tagAr: "المستويات الدراسية، المواد والجداول",
        gradient: "from-violet-500/10 to-purple-500/5",
        iconColor: "text-violet-600 dark:text-violet-400",
        bgSoft: "bg-violet-500/10"
    },
    "/teachers": {
        tagFr: "Corps professoral, vacations & contrats",
        tagAr: "هيئة التدريس، الحصص والمستحقات",
        gradient: "from-fuchsia-500/10 to-pink-500/5",
        iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
        bgSoft: "bg-fuchsia-500/10"
    },
    "/expenses": {
        tagFr: "Journal de caisse & suivi budgétaire",
        tagAr: "سجل الخزينة والمصروفات اليومية",
        gradient: "from-amber-500/10 to-orange-500/5",
        iconColor: "text-amber-600 dark:text-amber-400",
        bgSoft: "bg-amber-500/10"
    },
    "/settings": {
        tagFr: "Informations école, années & sécurité",
        tagAr: "إعدادات المؤسسة، السنوات والأمان",
        gradient: "from-slate-500/10 to-slate-500/5",
        iconColor: "text-slate-700 dark:text-slate-300",
        bgSoft: "bg-slate-500/10"
    },
    "/admin": {
        tagFr: "Console SaaS Jangu Master",
        tagAr: "لوحة التحكم الرئيسية للمنصة",
        gradient: "from-emerald-500/10 to-teal-500/5",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        bgSoft: "bg-emerald-500/10"
    },
    "/admin/stores": {
        tagFr: "Écoles partenaires & abonnements",
        tagAr: "المدارس الشريكة والاشتراكات",
        gradient: "from-blue-500/10 to-indigo-500/5",
        iconColor: "text-blue-600 dark:text-blue-400",
        bgSoft: "bg-blue-500/10"
    },
    "/admin/audit": {
        tagFr: "Historique & sécurité des opérations",
        tagAr: "سجل العمليات والتدقيق الأمني",
        gradient: "from-purple-500/10 to-indigo-500/5",
        iconColor: "text-purple-600 dark:text-purple-400",
        bgSoft: "bg-purple-500/10"
    },
    "/admin/health": {
        tagFr: "Statut des serveurs & bases de données",
        tagAr: "حالة الخوادم وقواعد البيانات",
        gradient: "from-teal-500/10 to-emerald-500/5",
        iconColor: "text-teal-600 dark:text-teal-400",
        bgSoft: "bg-teal-500/10"
    }
};

const CATEGORY_STYLES = [
    {
        bg: "bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 dark:from-emerald-950/20 dark:via-card dark:to-teal-950/10",
        border: "border-emerald-100/80 dark:border-emerald-900/30",
        badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40",
        dot: "bg-emerald-500",
        title: "text-emerald-950 dark:text-emerald-100",
        glow: "hover:shadow-[0_12px_32px_rgba(16,185,129,0.1)]",
        cardHoverBorder: "group-hover:border-emerald-300 dark:group-hover:border-emerald-700"
    },
    {
        bg: "bg-gradient-to-br from-sky-50/60 via-white to-indigo-50/40 dark:from-sky-950/20 dark:via-card dark:to-indigo-950/10",
        border: "border-sky-100/80 dark:border-sky-900/30",
        badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/40",
        dot: "bg-sky-500",
        title: "text-sky-950 dark:text-sky-100",
        glow: "hover:shadow-[0_12px_32px_rgba(14,165,233,0.1)]",
        cardHoverBorder: "group-hover:border-sky-300 dark:group-hover:border-sky-700"
    },
    {
        bg: "bg-gradient-to-br from-amber-50/60 via-white to-orange-50/40 dark:from-amber-950/20 dark:via-card dark:to-orange-950/10",
        border: "border-amber-100/80 dark:border-amber-900/30",
        badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40",
        dot: "bg-amber-500",
        title: "text-amber-950 dark:text-amber-100",
        glow: "hover:shadow-[0_12px_32px_rgba(245,158,11,0.1)]",
        cardHoverBorder: "group-hover:border-amber-300 dark:group-hover:border-amber-700"
    },
    {
        bg: "bg-gradient-to-br from-purple-50/60 via-white to-violet-50/40 dark:from-purple-950/20 dark:via-card dark:to-violet-950/10",
        border: "border-purple-100/80 dark:border-purple-900/30",
        badge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/40",
        dot: "bg-purple-500",
        title: "text-purple-950 dark:text-purple-100",
        glow: "hover:shadow-[0_12px_32px_rgba(168,85,247,0.1)]",
        cardHoverBorder: "group-hover:border-purple-300 dark:group-hover:border-purple-700"
    }
];

export default async function HomePage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const locale = await getLocale();
    const isAr = locale === "ar";

    const userRole = session.user.role || "DIRECTEUR";
    const userName = session.user.name || (isAr ? "المدير العام" : "Directeur");
    const currentNav = userRole === "SUPER_ADMIN" ? SUPER_ADMIN_NAV : NAV_SECTIONS;

    return (
        <div 
            className={cn(
                "w-full max-w-7xl mx-auto py-6 sm:py-8 space-y-8 animate-in fade-in duration-500",
                isAr && "font-arabic"
            )}
            dir={isAr ? "rtl" : "ltr"}
        >
            {/* 1. HERO HEADER: Welcome Banner with High-End Glassmorphism */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 sm:p-10 shadow-[0_20px_50px_rgba(16,185,129,0.2)]">
                {/* Visual ambient glow behind banner */}
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    {/* Left: Greeting & Title */}
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wide">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                            <span>{isAr ? "منصة تَعْلِيم لإدارة المدارس الأهلية والفرنكوأعرابية" : "Système de Gestion Scolaire Franco-Arabe & Général"}</span>
                        </div>

                        <div className="space-y-1">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                                {isAr ? (
                                    <>
                                        أهلاً بك، <span className="underline decoration-emerald-300 decoration-wavy decoration-2 underline-offset-4">{userName}</span>
                                    </>
                                ) : (
                                    <>
                                        Bonjour, <span className="underline decoration-emerald-300 decoration-wavy decoration-2 underline-offset-4">{userName}</span>
                                    </>
                                )}
                            </h1>
                            <p className="text-emerald-100 text-sm sm:text-base font-medium max-w-xl">
                                {isAr 
                                    ? "مرحباً بكم في لوحة القيادة المركزية. يرجى اختيار القسم المطلوب للمتابعة وإدارة المؤسسة بكل سهولة." 
                                    : "Bienvenue sur votre portail de pilotage central. Choisissez un module ci-dessous pour gérer votre établissement en toute sérénité."}
                            </p>
                        </div>
                    </div>

                    {/* Right: Info Badge */}
                    <div className={cn("flex flex-col sm:flex-row md:flex-col justify-center gap-2 shrink-0", isAr ? "items-start md:items-start" : "items-start md:items-end")}>
                        <div className={cn("bg-black/20 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3", isAr ? "text-right" : "text-right")}>
                            <div className="flex items-center gap-2 text-xs font-black text-emerald-200 uppercase tracking-wider">
                                <BadgeCheck className="w-4 h-4 text-emerald-300" />
                                <span>{isAr ? "العام الدراسي ٢٠٢٥ - ٢٠٢٦" : "Année Scolaire 2025 - 2026"}</span>
                            </div>
                            <div className="text-sm font-bold text-white/90 mt-0.5">
                                {isAr ? "النظام السحابي النشط" : "Session Active & Certifiée"}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-emerald-100 font-semibold px-3">
                            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                            <span>{isAr ? "النظام متصل ويعمل بشكل ممتاز" : "Serveur Synchronisé & En Ligne"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. CATEGORY SECTIONS WITH SLEEK BENTO CARDS */}
            <div className="space-y-8">
                {currentNav.map((section, sectionIndex) => {
                    const visibleItems = section.items.filter(item => {
                        const hasRole = !item.roles || item.roles.includes(userRole);
                        return hasRole;
                    });

                    if (visibleItems.length === 0) return null;

                    const style = CATEGORY_STYLES[sectionIndex % CATEGORY_STYLES.length];
                    const categoryTitle = isAr ? (section.titleAr || section.title) : section.title;

                    return (
                        <section 
                            key={section.title} 
                            className={cn(
                                "p-6 sm:p-8 rounded-[2.5rem] border transition-all duration-300 shadow-sm",
                                style.bg,
                                style.border
                            )}
                        >
                            {/* Section Header */}
                            <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
                                <div className="flex items-center gap-3">
                                    <span className={cn("w-3 h-3 rounded-full shadow-sm", style.dot)} />
                                    <h2 className={cn("text-base sm:text-lg font-black uppercase tracking-wider", style.title)}>
                                        {categoryTitle}
                                    </h2>
                                </div>

                                <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-xs", style.badge)}>
                                    <span>{visibleItems.length} {isAr ? "أقسام" : "modules"}</span>
                                </div>
                            </div>

                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                                {visibleItems.map((item) => {
                                    const Icon = item.icon;
                                    const meta = ITEM_META[item.href] || {
                                        tagFr: "Module de gestion",
                                        tagAr: "إدارة القسم",
                                        gradient: "from-slate-500/10 to-slate-500/5",
                                        iconColor: "text-primary",
                                        bgSoft: "bg-primary/10"
                                    };

                                    const itemLabel = isAr ? (item.labelAr || item.label) : item.label;
                                    const itemTag = isAr ? meta.tagAr : meta.tagFr;
                                    const ArrowIcon = isAr ? ArrowUpLeft : ArrowUpRight;

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "group relative flex flex-col justify-between p-5 bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.98] overflow-hidden",
                                                style.glow,
                                                style.cardHoverBorder
                                            )}
                                        >
                                            {/* Subtle Inner Accent Gradient Glow on Hover */}
                                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none", meta.gradient)} />

                                            {/* Top Row: Icon + Arrow Action */}
                                            <div className="relative z-10 flex items-start justify-between mb-4">
                                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs ring-1 ring-black/5 dark:ring-white/10", meta.bgSoft)}>
                                                    <Icon className={cn("w-6 h-6 transition-colors", meta.iconColor)} />
                                                </div>

                                                <div className={cn(
                                                    "w-8 h-8 rounded-full bg-slate-100 dark:bg-muted text-slate-400 group-hover:text-foreground group-hover:bg-white dark:group-hover:bg-slate-800 shadow-xs flex items-center justify-center transition-all duration-300",
                                                    isAr ? "group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                                )}>
                                                    <ArrowIcon className="w-4 h-4" />
                                                </div>
                                            </div>

                                            {/* Middle: Title */}
                                            <div className="relative z-10 space-y-1 my-1">
                                                <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors line-clamp-1">
                                                    {itemLabel}
                                                </h3>
                                            </div>

                                            {/* Bottom: Micro Feature Badge */}
                                            <div className="relative z-10 pt-3 mt-3 border-t border-slate-100 dark:border-border/50 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-muted-foreground">
                                                <span className="truncate">{itemTag}</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* 3. FOOTER INFO */}
            <div className="pt-4 pb-8 text-center text-xs text-muted-foreground font-medium flex flex-col items-center gap-1.5">
                <p>{isAr ? "نظام تَعْلِيم — المنصة المتكاملة لإدارة المدارس والكتاتيب" : "TaleemApp — Plateforme Intégrée de Gestion Scolaire Franco-Arabe"}</p>
                <p className="text-[10px] opacity-70">
                    {isAr ? "جميع الحقوق محفوظة © ٢٠٢٦" : "Tous droits réservés © 2026 TaleemApp"}
                </p>
            </div>
        </div>
    );
}
