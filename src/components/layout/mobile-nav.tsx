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
        { label: isAr ? "الاشتراكات" : "Frais scolaires", icon: CreditCard, href: "/tuition" },
        { label: isAr ? "الحضور" : "Présence", icon: CalendarCheck, href: "/attendance" },
    ];

    return (
        <div className="md:hidden fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] left-3 right-3 z-[40]">
            <div className="bg-card/95 backdrop-blur-xl px-2 py-2 rounded-2xl flex items-center justify-around border border-border shadow-[0_12px_36px_-18px_rgba(15,45,33,0.38)]">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href as any}
                            className={cn(
                                "relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 min-w-[55px]",
                                isActive ? (isSchool ? "bg-[#f5eddc] text-[#775a2b] dark:bg-amber-400/15 dark:text-amber-200" : "bg-primary/10 text-primary") : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <Icon className={cn(
                                "h-4 h-4 transition-all duration-200",
                                isActive ? (isSchool ? "text-[#95723b] dark:text-amber-200" : "text-primary") : "text-muted-foreground"
                            )} />

                            <span className={cn(
                                "text-[10px] font-bold mt-0.5 transition-colors duration-200 truncate max-w-[60px] text-center",
                                isAr && "font-arabic text-[11px]",
                                isActive ? (isSchool ? "text-[#775a2b] dark:text-amber-200 font-bold" : "text-primary font-bold") : "text-muted-foreground"
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
