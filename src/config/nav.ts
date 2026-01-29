import {
    LayoutDashboard, Share2, ListTodo, Wallet, LayoutGrid, Book, Briefcase
} from "lucide-react";

export const NAV_ITEMS = [
    {
        title: "Accueil",
        key: "dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Mes Tâches",
        key: "pilote",
        href: "/pilote",
        icon: ListTodo,
    },
    {
        title: "Finances",
        key: "capital",
        href: "/capital",
        icon: Wallet,
    },
    {
        title: "Projets",
        key: "labo",
        href: "/labo",
        icon: Briefcase,
    },
    {
        title: "Galerie",
        key: "studio",
        href: "/studio",
        icon: LayoutGrid,
    },
    {
        title: "Livres",
        key: "books",
        href: "/books",
        icon: Book,
    },
    {
        title: "Réseaux Sociaux",
        key: "social",
        href: "/social",
        icon: Share2,
    },
];

export const BOTTOM_NAV_ITEMS = [
    NAV_ITEMS[0], // Dashboard
    NAV_ITEMS[1], // Pilote
    NAV_ITEMS[2], // Labo
    NAV_ITEMS[5], // Studio (Index adjusted due to insertion)
    NAV_ITEMS[3], // Capital
];
