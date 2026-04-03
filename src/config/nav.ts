"use client";

import {
    LayoutDashboard, 
    Package, 
    Users, 
    FileText,
    AlertCircle,
    CalendarDays,
    ArrowDownCircle,
    Banknote,
    ChartLine
} from "lucide-react";

export const NAV_ITEMS = [
    {
        title: "Tableau de Bord",
        key: "dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Journal de Vente",
        key: "journal",
        href: "/sales/journal",
        icon: CalendarDays,
    },
    {
        title: "Facturation Studio",
        key: "invoices",
        href: "/sales/invoices",
        icon: FileText,
    },
    {
        title: "Gestion Dépenses",
        key: "expenses",
        href: "/expenses",
        icon: ArrowDownCircle,
    },
    {
        title: "Suivi des Dettes",
        key: "debts",
        href: "/sales/debts",
        icon: AlertCircle,
    },
    {
        title: "Stocks & Inventaire",
        key: "inventory",
        href: "/inventory",
        icon: Package,
    },
    {
        title: "Trésorerie & Capital",
        key: "capital",
        href: "/capital",
        icon: Banknote,
    },
    {
        title: "Ressources Humaines",
        key: "hr",
        href: "/hr",
        icon: Users,
    },
    {
        title: "Analyses & Rapports",
        key: "reports",
        href: "/reports",
        icon: ChartLine,
    }
];

export const BOTTOM_NAV_ITEMS = [
    NAV_ITEMS.find(i => i.key === 'dashboard')!,
    NAV_ITEMS.find(i => i.key === 'journal')!,
    NAV_ITEMS.find(i => i.key === 'invoices')!,
    NAV_ITEMS.find(i => i.key === 'expenses')!,
    NAV_ITEMS.find(i => i.key === 'inventory')!,
];
