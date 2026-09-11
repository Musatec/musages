"use client";

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function LanguageSwitcher() {
    const locale = useLocale();
    const [activeLocale, setActiveLocale] = useState<'fr' | 'ar'>(locale as 'fr' | 'ar');
    const [isChanging, setIsChanging] = useState(false);

    useEffect(() => {
        setActiveLocale(locale as 'fr' | 'ar');
    }, [locale]);

    const switchLocale = (newLocale: 'fr' | 'ar') => {
        if (newLocale === activeLocale || isChanging) return;

        setIsChanging(true);
        setActiveLocale(newLocale);

        // 1. Modifier la direction de la page immédiatement (LTR / RTL)
        document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLocale;

        // 2. Écrire le cookie NEXT_LOCALE pour le serveur Next.js & next-intl
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;

        // 3. Recharger la page proprement pour ré-exécuter le rendu serveur avec le dictionnaire correspondant (messages/ar.json ou fr.json)
        window.location.reload();
    };

    return (
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs text-xs sm:text-sm font-semibold">
            <button
                type="button"
                onClick={() => switchLocale('fr')}
                disabled={isChanging}
                className={cn(
                    "px-3 sm:px-4 py-1.5 rounded-lg transition-all duration-150 font-bold flex items-center gap-1.5 cursor-pointer select-none",
                    activeLocale === 'fr'
                        ? "bg-[#0C5A34] text-white shadow-sm font-bold scale-[1.02]"
                        : "text-slate-700 dark:text-slate-300 hover:text-[#0C5A34] hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                )}
            >
                {isChanging && activeLocale === 'fr' && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                )}
                <span>Français</span>
            </button>

            <button
                type="button"
                onClick={() => switchLocale('ar')}
                disabled={isChanging}
                className={cn(
                    "px-3 sm:px-4 py-1.5 rounded-lg font-arabic transition-all duration-150 font-bold flex items-center gap-1.5 cursor-pointer select-none",
                    activeLocale === 'ar'
                        ? "bg-[#0C5A34] text-white shadow-sm font-bold scale-[1.02]"
                        : "text-slate-700 dark:text-slate-300 hover:text-[#0C5A34] hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                )}
                dir="rtl"
            >
                {isChanging && activeLocale === 'ar' && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                )}
                <span>العربية</span>
            </button>
        </div>
    );
}
