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
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 shadow-xs text-xs sm:text-sm font-semibold">
            <button
                type="button"
                onClick={() => switchLocale('fr')}
                className={cn(
                    "px-3 sm:px-4 py-1.5 rounded-lg transition-all duration-200 font-bold",
                    locale === 'fr'
                        ? "bg-[#0C5A34] text-white shadow-xs font-bold"
                        : "text-slate-700 hover:text-[#0C5A34]"
                )}
            >
                Français
            </button>

            <button
                type="button"
                onClick={() => switchLocale('ar')}
                className={cn(
                    "px-3 sm:px-4 py-1.5 rounded-lg font-arabic transition-all duration-200 font-bold",
                    locale === 'ar'
                        ? "bg-[#0C5A34] text-white shadow-xs font-bold"
                        : "text-slate-700 hover:text-[#0C5A34]"
                )}
                dir="rtl"
            >
                العربية
            </button>
        </div>
    );
}
