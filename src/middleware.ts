import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  
  const publicPathnames = ['/', '/login', '/auth/signup', '/auth/reset-password'];
  const isPublicPage = publicPathnames.some(path => 
    pathname === `/fr${path}` || pathname === `/en${path}` || pathname === path
  );

  if (!isLoggedIn && !isPublicPage) {
    const locale = pathname.split('/')[1] || 'fr';
    return Response.redirect(new URL(`/${locale}/login`, req.nextUrl.origin));
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
