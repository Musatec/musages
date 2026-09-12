"use client";

import { Link, usePathname } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useSpace } from "@/components/providers/space-provider";
import { useLocale } from "next-intl";
import { 
    LayoutDashboard, 
    Users, 
    BookOpen, 
    CreditCard, 
    CalendarCheck,
    UserCheck
} from "lucide-react";

export function MobileNav() {
    const pathname = usePathname();
    const locale = useLocale();
    const isAr = locale === "ar";
    const { activeSpace } = useSpace();
    const isSchool = activeSpace === "school";

    if (!pathname || pathname === "/login" || pathname === "/") return null;

    const navItems = isSchool ? [
        { label: isAr ? "الرئيسية" : "Accueil", icon: LayoutDashboard, href: "/dashboard" },
        { label: isAr ? "التلاميذ" : "Élèves", icon: Users, href: "/students" },
        { label: isAr ? "الفصول" : "Classes", icon: UserCheck, href: "/classes" },
        { label: isAr ? "الرسوم" : "Écolages", icon: CreditCard, href: "/tuition" },
        { label: isAr ? "الامتحانات" : "Examens", icon: BookOpen, href: "/grades" },
    ] : [
        { label: isAr ? "الرئيسية" : "Accueil", icon: LayoutDashboard, href: "/dashboard" },
        { label: isAr ? "الطلاب" : "Talibés", icon: Users, href: "/students" },
        { label: isAr ? "٦٠ حزباً" : "60 Hizb", icon: BookOpen, href: "/hifz" },
        { label: isAr ? "الاشتراكات" : "Paiements", icon: CreditCard, href: "/tuition" },
        { label: isAr ? "الحضور" : "Présence", icon: CalendarCheck, href: "/attendance" },
    ];

    return (
        <div className="md:hidden fixed bottom-3 left-3 right-3 z-[40]">
            <div className="bg-slate-950/95 backdrop-blur-md px-2 py-2 rounded-2xl flex items-center justify-around border border-slate-800 shadow-2xl">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href as any}
                            className={cn(
                                "relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 min-w-[55px]",
                                isActive ? (isSchool ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-400") : "text-slate-400 hover:text-white"
                            )}
                        >
                            <Icon className={cn(
                                "h-4 h-4 transition-all duration-200",
                                isActive ? (isSchool ? "text-amber-300" : "text-emerald-400") : "text-slate-400"
                            )} />

                            <span className={cn(
                                "text-[9px] font-bold mt-0.5 transition-colors duration-200 truncate max-w-[55px] text-center",
                                isAr && "font-arabic text-[10px]",
                                isActive ? (isSchool ? "text-amber-300 font-extrabold" : "text-emerald-400 font-extrabold") : "text-slate-400"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
