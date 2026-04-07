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
    default: "MINDOS | The Creator OS",
    template: "%s | MINDOS"
  },
  description: "Le système d'exploitation ultime pour les créateurs. Organisez votre esprit, vos finances et vos contenus au même endroit.",
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
    title: "MINDOS | The Creator OS",
    description: "Organisez votre génie. Maîtrisez votre temps.",
    url: 'https://musages.vercel.app',
    siteName: 'MINDOS',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MINDOS | The Creator OS',
    description: 'Le centre de commandement pour les créateurs modernes.',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MINDOS",
    startupImage: [
      {
        url: '/icon.svg?v=6',
        media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)',
      },
    ],
  },
  icons: {
    icon: '/icon.svg?v=6',
    shortcut: '/icon.svg?v=6',
    apple: '/icon.svg?v=6',
    other: {
      rel: 'mask-icon',
      url: '/icon.svg?v=6',
      color: '#ea580c',
    },
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
            <NextIntlClientProvider messages={messages}>
              <AuthProvider>
                <SystemGuardian>
                  <SidebarProvider>
                    <PwaRegistrar />
                    <AppLayout>
                      {children}
                    </AppLayout>
                  </SidebarProvider>
                </SystemGuardian>
                <Toaster richColors position="bottom-right" />
              </AuthProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
