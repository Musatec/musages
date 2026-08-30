"use client";

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const switchLocale = (newLocale: 'fr' | 'ar') => {
        if (newLocale === locale) return;
        router.replace(pathname, { locale: newLocale });
    };

    return (
        <div className="inline-flex items-center p-0.5 rounded-full bg-slate-100 dark:bg-muted border border-slate-200 dark:border-border shadow-xs text-xs font-bold">
            <button
                type="button"
                onClick={() => switchLocale('fr')}
                className={cn(
                    "px-3 py-1 rounded-full transition-all duration-200 font-bold",
                    locale === 'fr'
                        ? "bg-emerald-600 text-white shadow-xs font-black"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
            >
                Français
            </button>

            <button
                type="button"
                onClick={() => switchLocale('ar')}
                className={cn(
                    "px-3 py-1 rounded-full font-arabic transition-all duration-200 font-bold",
                    locale === 'ar'
                        ? "bg-emerald-600 text-white shadow-xs font-black"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
                dir="rtl"
            >
                العربية
            </button>
        </div>
    );
}
