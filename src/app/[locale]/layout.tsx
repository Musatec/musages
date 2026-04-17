import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

import AppLayout from "@/components/layout/app-layout";
import AuthProvider from "@/components/providers/auth-provider";
import { SystemGuardian } from "@/components/providers/system-guardian";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from 'next-intl';
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { SessionProvider } from "next-auth/react";
import { PwaRegistrar } from "@/components/providers/pwa-registrar";
import { PostHogProvider } from 'posthog-js/react'
import { CSPostHogProvider } from "@/components/providers/posthog-provider";
import PostHogPageView from "@/components/providers/posthog-pageview";
import { CrispProvider } from "@/components/providers/crisp-provider";
import { FeedbackButton } from "@/components/modules/feedback-button";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "MINDOS | L'ERP Nouvelle Génération pour l'Afrique",
    template: "%s | MINDOS"
  },
  description: "Le système d'exploitation ultime pour les boutiques, créateurs et entrepreneurs. Gérez votre stock, vos ventes et votre trésorerie avec l'intelligence artificielle.",
  keywords: ["ERP Afrique", "Logiciel de caisse Sénégal", "Gestion de stock mobile", "MINDOS", "Musages", "Point de vente Wave"],
  metadataBase: new URL('https://musages.vercel.app'),
  manifest: "/manifest.json",
  alternates: {
    canonical: '/',
    languages: {
      'fr': '/fr',
      'en': '/en',
    },
  },
  openGraph: {
    title: "MINDOS | Gérez votre Business comme un Pro",
    description: "Structurez votre génie. Maîtrisez votre temps et vos profits.",
    url: 'https://musages.vercel.app',
    siteName: 'MINDOS',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MINDOS | The Creator OS',
    description: 'Le centre de commandement pour les entrepreneurs modernes.',
  },
  icons: {
    icon: '/icon.svg?v=6',
    shortcut: '/icon.svg?v=6',
    apple: '/icon.svg?v=6',
  },
  applicationName: "MINDOS",
  formatDetection: {
    telephone: false,
  },
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  // Receiving messages provided in `i18n/request.ts`
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} bg-background text-foreground antialiased selection:bg-primary/30 selection:text-primary font-sans`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
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
                    <FeedbackButton />
                    <AppLayout>
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
