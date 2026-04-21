import { 
    LayoutDashboard, 
    ShoppingCart, 
    Package, 
    ArrowLeftRight, 
    TrendingUp, 
    Users, 
    ChevronLeft, 
    Settings,
    Activity,
    PlusCircle,
    FileText,
    CreditCard,
    Server,
    Truck,
    ShieldCheck,
    Crown,
    Zap,
    CalendarDays,
    ArrowDownCircle,
    Banknote,
    ChartLine,
    History,
    Receipt,
    Wallet
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
        title: "OPÉRATIONS",
        items: [
            { label: "Tableau de Bord", icon: LayoutDashboard, href: "/dashboard" },
            { label: "Journal des Ventes", icon: ArrowLeftRight, href: "/sales/journal" },
            { label: "Factures & Devis", icon: FileText, href: "/sales/invoices" },
            { label: "Suivi des Dettes", icon: CreditCard, href: "/sales/debts" },
        ]
    },
    {
        title: "LOGISTIQUE",
        items: [
            { label: "Inventaire Global", icon: Package, href: "/inventory" },
            { label: "Nouvel Arrivage", icon: ShoppingCart, href: "/logistics/purchases" },
            { label: "Mouvements & Audit", icon: PlusCircle, href: "/inventory/movements" },
            { label: "Gestion Fournisseurs", icon: Truck, href: "/logistics/suppliers" },
        ]
    },
    {
        title: "DIRECTION",
        items: [
            { label: "Moniteur d'Audit", icon: Activity, href: "/admin", roles: ["ADMIN", "SUPER_ADMIN"] },
            { label: "Caisse & Dépenses", icon: TrendingUp, href: "/expenses", roles: ["ADMIN", "MANAGER"] },
            { label: "Rapports & Analytics", icon: ChartLine, href: "/reports", roles: ["ADMIN"] },
            { label: "Gestion Équipe", icon: Users, href: "/hr", roles: ["ADMIN", "MANAGER"] },
            { label: "Centrale Réseau", icon: Server, href: "/admin/stores", roles: ["ADMIN", "SUPER_ADMIN"] },
            { label: "Paramètres Globaux", icon: Settings, href: "/settings", roles: ["ADMIN"] },
        ]
    }
];

export const SUPER_ADMIN_NAV: NavSection[] = [
    {
        title: "PILOTAGE PROPRIÉTAIRE",
        items: [
            { label: "Console SaaS", icon: LayoutDashboard, href: "/admin" },
            { label: "Centrale Réseau", icon: Server, href: "/admin/stores" },
            { label: "Audit Global", icon: Activity, href: "/admin/audit" },
        ]
    },
    {
        title: "INFRASTRUCTURE",
        items: [
            { label: "États des Systèmes", icon: ShieldCheck, href: "/admin/health" },
            { label: "Rapports SaaS", icon: TrendingUp, href: "/admin/analytics" },
            { label: "Paramètres Noyau", icon: Settings, href: "/settings" },
        ]
    }
];

export const BOTTOM_NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Journal", icon: History, href: "/sales/journal" },
    { label: "Factures", icon: Receipt, href: "/sales/invoices" },
    { label: "Dépenses", icon: Wallet, href: "/expenses" },
    { label: "Stock", icon: Package, href: "/inventory" },
];
