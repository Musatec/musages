"use client";

import { useLocale } from 'next-intl';
import { routing, usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const nextLocale = locale === 'fr' ? 'en' : 'fr';

    const toggleLanguage = () => {
        router.replace(pathname, { locale: nextLocale });
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all border border-border/50 bg-background/50 hover:bg-accent group w-full"
            title={locale === 'fr' ? 'Switch to English' : 'Passer en Français'}
        >
            <div className="relative w-5 h-4 overflow-hidden rounded-sm shadow-sm border border-border/50">
                {locale === 'fr' ? (
                    /* French Flag SVG */
                    <svg viewBox="0 0 3 2" className="w-full h-full">
                        <path fill="#EC1920" d="M0 0h3v2H0z" />
                        <path fill="#fff" d="M0 0h2v2H0z" />
                        <path fill="#051440" d="M0 0h1v2H0z" />
                    </svg>
                ) : (
                    /* UK Flag SVG */
                    <svg viewBox="0 0 60 30" className="w-full h-full">
                        <clipPath id="s">
                            <path d="M0,0 v30 h60 v-30 z" />
                        </clipPath>
                        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
                        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" clipPath="url(#s)" />
                        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" clipPath="url(#s)" />
                        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
                        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
                    </svg>
                )}
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground">
                {locale === 'fr' ? 'FR' : 'EN'}
            </span>
        </button>
    );
}
