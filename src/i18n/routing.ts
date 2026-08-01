import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    // Locales supportés pour TaleemApp (Français, Arabe, Anglais)
    locales: ['fr', 'ar', 'en'],

    // Langue par défaut
    defaultLocale: 'fr',
    localePrefix: 'never'
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing);
