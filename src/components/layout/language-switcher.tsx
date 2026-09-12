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
        <div className="inline-flex items-center p-0.5 sm:p-1 rounded-xl bg-slate-900 border border-slate-800 shadow-xs text-xs font-semibold">
            <button
                type="button"
                onClick={() => switchLocale('fr')}
                disabled={isChanging}
                className={cn(
                    "px-2 sm:px-3 py-1 rounded-lg transition-all duration-150 font-bold flex items-center gap-1 cursor-pointer select-none text-[11px] sm:text-xs",
                    activeLocale === 'fr'
                        ? "bg-[#0C5A34] text-white shadow-xs font-bold"
                        : "text-slate-400 hover:text-white"
                )}
            >
                {isChanging && activeLocale === 'fr' && (
                    <Loader2 className="w-3 h-3 animate-spin text-white" />
                )}
                <span>FR</span>
            </button>

            <button
                type="button"
                onClick={() => switchLocale('ar')}
                disabled={isChanging}
                className={cn(
                    "px-2 sm:px-3 py-1 rounded-lg font-arabic transition-all duration-150 font-bold flex items-center gap-1 cursor-pointer select-none text-[11px] sm:text-xs",
                    activeLocale === 'ar'
                        ? "bg-[#0C5A34] text-white shadow-xs font-bold"
                        : "text-slate-400 hover:text-white"
                )}
                dir="rtl"
            >
                {isChanging && activeLocale === 'ar' && (
                    <Loader2 className="w-3 h-3 animate-spin text-white" />
                )}
                <span>عربي</span>
            </button>
        </div>
    );
}
