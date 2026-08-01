import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import fs from "fs";
import path from "path";

// Hack pour forcer la suppression de l'ancien favicon s'il existe toujours (contourne les ACL Windows locaux)
try {
  fs.unlinkSync(path.join(process.cwd(), 'public', 'favicon.ico'));
} catch (e) {}

import AppLayout from "@/components/layout/app-layout";
import AuthProvider from "@/components/providers/auth-provider";
import { SystemGuardian } from "@/components/providers/system-guardian";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from 'next-intl';
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { getMessages, getLocale } from 'next-intl/server';
import { SessionProvider } from "next-auth/react";
import { PwaRegistrar } from "@/components/providers/pwa-registrar";
import { CSPostHogProvider } from "@/components/providers/posthog-provider";
import PostHogPageView from "@/components/providers/posthog-pageview";
import { CrispProvider } from "@/components/providers/crisp-provider";
import { GuidedTour } from "@/components/ui/guided-tour";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#10B981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "TaleemApp | SaaS de Gestion Scolaire Franco-Arabe",
    template: "%s | TaleemApp"
  },
  description: "Plateforme SaaS tout-en-un de gestion pour les écoles franco-arabes et établissements privés au Sénégal. Recouvrement des écolages Wave/OM, bulletins de notes et relances WhatsApp.",
  keywords: ["TaleemApp", "École Franco-Arabe Sénégal", "Gestion écolage Wave", "Logiciel école Dakar", "Médersa Sénégal", "Bulletins scolaires PDF"],
  metadataBase: new URL('https://musages.vercel.app'),
  manifest: "/manifest.json",
  icons: {
    icon: '/logo-taleem.png',
    shortcut: '/logo-taleem.png',
    apple: '/logo-taleem.png',
  },
  applicationName: "TaleemApp",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const messages = await getMessages();

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${inter.variable} bg-background text-foreground antialiased selection:bg-emerald-500/30 selection:text-emerald-500 font-sans`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <CSPostHogProvider>
              <Suspense fallback={null}>
                <PostHogPageView />
              </Suspense>
              <NextIntlClientProvider messages={messages}>
              <AuthProvider>
                <SystemGuardian>
                  <SidebarProvider>
                    <PwaRegistrar />
                    <CrispProvider />
                    <AppLayout>
                      <GuidedTour />
                      {children}
                    </AppLayout>
                  </SidebarProvider>
                </SystemGuardian>
                <Toaster richColors position="bottom-right" />
              </AuthProvider>
            </NextIntlClientProvider>
            </CSPostHogProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
