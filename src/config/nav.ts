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
    CreditCard,
    HeartHandshake,
    BadgeDollarSign,
    Gift,
    GraduationCap
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

// 1. NAVIGATION DÉDIÉE ESPACE DAARA (CORANIQUE & 60 HIZBS)
export const NAV_SECTIONS: NavSection[] = [
    {
        title: "VIE DU DAARA & EFFECTIF",
        titleAr: "شؤون المحضرة والطلاب",
        items: [
            { label: "Tableau de Bord", labelAr: "لوحة التحكم", icon: LayoutDashboard, href: "/dashboard" },
            { label: "Effectif du Daara", labelAr: "سجل الطلاب", icon: Users, href: "/students" },
            { label: "Halqas Coraniques", labelAr: "الحلقات القرآنيّة", icon: BookOpen, href: "/classes" },
            { label: "Oustazs", labelAr: "المشايخ", icon: UserCheck, href: "/oustazs" },
            { label: "Présences & Halqas", labelAr: "الحضور والتأخير", icon: CalendarCheck, href: "/attendance" },
        ]
    },
    {
        title: "MÉMORISATION & CORAN",
        titleAr: "القرآن الكريم والحفظ",
        items: [
            { label: "Suivi des 60 Hizb", labelAr: "متابعة ٦٠ حزباً", icon: BookOpen, href: "/hifz" },
            { label: "Répertoire des Huffaz (Khatm)", labelAr: "سجل الحفاظ (الختم)", icon: Award, href: "/khatm" },
        ]
    },
    {
        title: "FINANCES & CAISSE DAARA",
        titleAr: "المالية والخزينة",
        items: [
            { label: "Frais scolaires (12 mois)", labelAr: "الرسوم المدرسية", icon: CreditCard, href: "/tuition", roles: ["SERIGNE_DAARA", "SUPER_ADMIN", "GESTIONNAIRE"] },
            { label: "Salaires des Oustazs", labelAr: "أجور المشايخ", icon: BadgeDollarSign, href: "/hr", roles: ["SERIGNE_DAARA", "SUPER_ADMIN"] },
            { label: "Cas Sociaux & Exonérés", labelAr: "الحالات الاجتماعية", icon: HeartHandshake, href: "/cas-sociaux" },
            { label: "Parrainages & Ndeyi Daara", labelAr: "كفالة الطلاب", icon: HeartHandshake, href: "/parrainage", roles: ["SERIGNE_DAARA", "SUPER_ADMIN", "GESTIONNAIRE"] },
            { label: "Dons & Sadaqa", labelAr: "الصدقات", icon: Gift, href: "/sadaqa", roles: ["SERIGNE_DAARA", "SUPER_ADMIN", "GESTIONNAIRE"] },
            { label: "Trésorerie & Dépenses", labelAr: "المصروفات والخزينة", icon: TrendingUp, href: "/expenses", roles: ["SERIGNE_DAARA", "SUPER_ADMIN"] },
            { label: "Paramètres Daara", labelAr: "إعدادات المحضرة", icon: Settings, href: "/settings", roles: ["SERIGNE_DAARA", "SUPER_ADMIN"] },
        ]
    }
];

// 2. NAVIGATION DÉDIÉE ÉCOLE FRANCO-ARABE (PATHÉ POGNE / JANGU ERP)
export const SCHOOL_NAV_SECTIONS: NavSection[] = [
    {
        title: "CLASSES (CYCLE 3 ANS)",
        titleAr: "الفصول الدراسية",
        items: [
            { label: "CI – CP", labelAr: "التحضيري الأول والثاني", icon: GraduationCap, href: "/classes?classe=CI" },
            { label: "CE1 – CE2", labelAr: "الابتدائي الأول والثاني", icon: GraduationCap, href: "/classes?classe=CE1" },
            { label: "CM1 – CM2", labelAr: "المتوسط الأول والثاني", icon: GraduationCap, href: "/classes?classe=CM1" },
        ]
    },
    {
        title: "GESTION ÉCOLE FRANCO-ARABE",
        titleAr: "شؤون المدرسة والمراحل",
        items: [
            { label: "Tableau de Bord École", labelAr: "لوحة تحكم المدرسة", icon: LayoutDashboard, href: "/dashboard" },
            { label: "Effectif des Élèves", labelAr: "سجل التلاميذ", icon: Users, href: "/students" },
            { label: "Paramètres Salles", labelAr: "إدارة الفصول", icon: UserCheck, href: "/classes" },
            { label: "Présences & Absences", labelAr: "سجل الحضور والغياب", icon: CalendarCheck, href: "/attendance" },
        ]
    },
    {
        title: "PÉDAGOGIE & EXAMENS",
        titleAr: "الدرجات والامتحانات",
        items: [
            { label: "Examens & Bulletins", labelAr: "الامتحانات والدرجات", icon: BookOpen, href: "/grades" },
            { label: "Enseignants", labelAr: "المعلمون", icon: UserCheck, href: "/teachers" },
        ]
    },
    {
        title: "FINANCES & ÉCOLAGES",
        titleAr: "الرسوم والاشتراكات",
        items: [
            { label: "Recouvrement Écolages", labelAr: "تحصيل رسوم الدراسة", icon: CreditCard, href: "/tuition" },
            { label: "Cas Sociaux & Bourses", labelAr: "الحالات الاجتماعية", icon: HeartHandshake, href: "/cas-sociaux" },
            { label: "Trésorerie École", labelAr: "خزينة المدرسة", icon: TrendingUp, href: "/expenses" },
            { label: "Paramètres École", labelAr: "إعدادات المدرسة", icon: Settings, href: "/settings" },
        ]
    }
];

export const SUPER_ADMIN_NAV: NavSection[] = [
    {
        title: "PILOTAGE SAAS DIGIDAARA",
        titleAr: "إدارة النظام",
        items: [
            { label: "Console DigiDaara", labelAr: "وحدة التحكم", icon: LayoutDashboard, href: "/admin" },
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
    { label: "Effectif", icon: Users, href: "/students" },
    { label: "60 Hizb", icon: BookOpen, href: "/hifz" },
    { label: "Frais scolaires", icon: CreditCard, href: "/tuition" },
    { label: "Présences", icon: CalendarCheck, href: "/attendance" },
];
