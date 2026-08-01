import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // 1. Ignorer les routes API et assets statiques pour renvoyer du JSON et non du HTML
  if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // 2. Rediriger les anciennes routes legacy (ex: /sales) directement vers le Dashboard
  if (pathname === '/sales' || pathname.endsWith('/sales')) {
    return NextResponse.redirect(new URL('/fr/dashboard', req.nextUrl.origin));
  }

  // 3. Gérer l'internationalisation
  const response = intlMiddleware(req);

  // 4. Gérer la protection des routes (Auth)
  const isLoggedIn = !!req.auth;
  const publicPathnames = ['/', '/login', '/auth/signup', '/auth/reset-password'];
  
  const isPublicPage = publicPathnames.some(path => 
    pathname === path || 
    pathname.startsWith('/fr' + path) || 
    pathname.startsWith('/ar' + path) || 
    pathname.startsWith('/en' + path)
  );

  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL('/fr/login', req.nextUrl.origin));
  }

  return response;
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
