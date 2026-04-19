import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  
  // 1. Gérer l'internationalisation d'abord
  const response = intlMiddleware(req);
  
  // 2. Gérer la protection des routes (Auth)
  const publicPathnames = ['/', '/login', '/auth/signup', '/auth/reset-password', '/api/webhooks/paytech'];
  
  const isPublicPage = publicPathnames.some(path => 
    pathname === path || pathname.startsWith('/fr' + path)
  );

  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL(`/login`, req.nextUrl.origin));
  }

  return response;
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
