import { 
    LayoutDashboard, 
    BookOpen, 
    Award, 
    CalendarCheck, 
    Users, 
    UserCheck, 
    TrendingUp, 
    Settings, 
    ShieldCheck, 
    Server, 
    Activity,
    CreditCard
} from "lucide-react";

export interface NavItem {
    label: string;
    labelAr?: string;
    key?: string;
    icon: any;
    href: string;
    roles?: string[];
}

export interface NavSection {
    title: string;
    titleAr?: string;
    items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
    {
        title: "MÉMORISATION & CORAN",
        titleAr: "تحفيظ القرآن الكريم",
        items: [
            { label: "Tableau de Bord", labelAr: "لوحة التحكم", icon: LayoutDashboard, href: "/dashboard" },
            { label: "Suivi des 60 Hizb", labelAr: "متابعة الـ 60 حزباً", icon: BookOpen, href: "/hifz" },
            { label: "Diplômes & Khatm", labelAr: "إجازات وشهادات الإتمام", icon: Award, href: "/khatm" },
        ]
    },
    {
        title: "VIE DU DAARA & TALIBÉS",
        titleAr: "حياة المحضرة والطلاب",
        items: [
            { label: "Talibés (Pensionnaires)", labelAr: "إدارة الطلاب (الكتاتيب)", icon: Users, href: "/students" },
            { label: "Halqas & Maîtres (Oustaz)", labelAr: "الحلقات ومشايخ الإقراء", icon: UserCheck, href: "/classes" },
            { label: "Présences & Halqas", labelAr: "الحضور والتأخير", icon: CalendarCheck, href: "/attendance" },
        ]
    },
    {
        title: "FINANCES & CAISSE DAARA",
        titleAr: "المالية والرسوم Scolaires",
        items: [
            { label: "Scolarité & Mensualités", labelAr: "المصروفات والرسوم", icon: CreditCard, href: "/tuition", roles: ["SERIGNE_DAARA", "SUPER_ADMIN", "GESTIONNAIRE"] },
            { label: "Trésorerie & Dépenses", labelAr: "الخزينة والمصروفات", icon: TrendingUp, href: "/expenses", roles: ["SERIGNE_DAARA", "SUPER_ADMIN"] },
            { label: "Paramètres Daara", labelAr: "إعدادات المحضرة", icon: Settings, href: "/settings", roles: ["SERIGNE_DAARA", "SUPER_ADMIN"] },
        ]
    }
];

export const SUPER_ADMIN_NAV: NavSection[] = [
    {
        title: "PILOTAGE SAAS DAARA.NET",
        titleAr: "إدارة النظام",
        items: [
            { label: "Console Daara.net", labelAr: "وحدة التحكم", icon: LayoutDashboard, href: "/admin" },
            { label: "Daaras Partenaires", labelAr: "المحاضر الشريكة", icon: Server, href: "/admin/stores" },
            { label: "Audit Global", labelAr: "التدقيق الشامل", icon: Activity, href: "/admin/audit" },
        ]
    },
    {
        title: "INFRASTRUCTURE",
        titleAr: "البنية التحتية",
        items: [
            { label: "États des Systèmes", labelAr: "حالة الأنظمة", icon: ShieldCheck, href: "/admin/health" },
            { label: "Paramètres Noyau", labelAr: "إعدادات النظام", icon: Settings, href: "/settings" },
        ]
    }
];

export const BOTTOM_NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "60 Hizb", icon: BookOpen, href: "/hifz" },
    { label: "Talibés", icon: Users, href: "/students" },
    { label: "Scolarité", icon: CreditCard, href: "/tuition" },
    { label: "Présences", icon: CalendarCheck, href: "/attendance" },
];
