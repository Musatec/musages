import { createServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs';
import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    // 1. Handle i18n routing
    const response = handleI18nRouting(request);

    // 2. Handle Supabase Session
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const pathname = request.nextUrl.pathname;

    // Strip locale from pathname for easier checking
    const pathnameWithoutLocale = pathname.replace(/^\/(en|fr)/, '') || '/';

    // Redirection si non connecté
    if (!session && !pathnameWithoutLocale.startsWith('/login') && !pathnameWithoutLocale.startsWith('/auth') && pathnameWithoutLocale !== '/') {
        // If we redirect, we should keep the locale if possible
        const locale = pathname.split('/')[1] || 'fr';
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    /* 
    // Commenté suite à la demande utilisateur : Rester sur la page de login même si session active
    // Redirection si déjà connecté
    if (session && pathnameWithoutLocale.startsWith('/login')) {
        const locale = pathname.split('/')[1] || 'fr';
        const redirectUrl = new URL(`/${locale}/dashboard`, request.url);
        const redirectResponse = NextResponse.redirect(redirectUrl);
        // Transférer les cookies
        response.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie);
        });
        return redirectResponse;
    }
    */

    return response;
}

export const config = {
    // Matcher ignorant :
    // - api (routes API)
    // - _next (fichiers internes Next.js)
    // - _vercel (fichiers internes Vercel)
    // - fichiers avec extension (.*\\..*) comme .svg, .png, .jpg
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
