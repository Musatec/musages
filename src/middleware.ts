import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  
  const publicPathnames = ['/', '/login', '/auth/signup', '/auth/reset-password'];
  const isPublicPage = publicPathnames.some(path => 
    pathname === path
  );

  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL(`/login`, req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
