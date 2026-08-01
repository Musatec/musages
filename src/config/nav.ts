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
    Receipt
} from "lucide-react";

export interface NavItem {
    label: string;
    key?: string;
    icon: any;
    href: string;
    roles?: string[];
}

export interface NavSection {
    title: string;
    items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
    {
        title: "VIE SCOLAIRE & FINANCES",
        items: [
            { label: "Tableau de Bord", icon: LayoutDashboard, href: "/dashboard" },
            { label: "Recouvrement Écolages", icon: CreditCard, href: "/tuition" },
            { label: "Notes & Bulletins", icon: GraduationCap, href: "/grades" },
            { label: "Présences & Retards", icon: CalendarCheck, href: "/attendance" },
        ]
    },
    {
        title: "PÉDAGOGIE & EFFECTIFS",
        items: [
            { label: "Élèves & Inscriptions", icon: Users, href: "/students" },
            { label: "Classes & Matières", icon: BookOpen, href: "/classes" },
            { label: "Enseignants & Vacations", icon: UserCheck, href: "/teachers" },
        ]
    },
    {
        title: "DIRECTION",
        items: [
            { label: "Trésorerie & Dépenses", icon: TrendingUp, href: "/expenses", roles: ["DIRECTEUR", "SUPER_ADMIN"] },
            { label: "Paramètres École", icon: Settings, href: "/settings", roles: ["DIRECTEUR", "SUPER_ADMIN"] },
        ]
    }
];

export const SUPER_ADMIN_NAV: NavSection[] = [
    {
        title: "PILOTAGE SAAS JANGU",
        items: [
            { label: "Console SaaS", icon: LayoutDashboard, href: "/admin" },
            { label: "Écoles Partenaires", icon: Server, href: "/admin/stores" },
            { label: "Audit Global", icon: Activity, href: "/admin/audit" },
        ]
    },
    {
        title: "INFRASTRUCTURE",
        items: [
            { label: "États des Systèmes", icon: ShieldCheck, href: "/admin/health" },
            { label: "Paramètres Noyau", icon: Settings, href: "/settings" },
        ]
    }
];

export const BOTTOM_NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Écolages", icon: CreditCard, href: "/tuition" },
    { label: "Bulletins", icon: GraduationCap, href: "/grades" },
    { label: "Présences", icon: CalendarCheck, href: "/attendance" },
    { label: "Élèves", icon: Users, href: "/students" },
];
