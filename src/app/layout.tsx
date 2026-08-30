import type { Metadata, Viewport } from "next";
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
import { Suspense } from "react";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "Daara.net | SaaS de Gestion des Daaras & Écoles Coraniques",
    template: "%s | Daara.net"
  },
  description: "Plateforme SaaS tout-en-un de gestion des Daaras et Écoles Coraniques au Sénégal et dans le monde. Suivi des 60 Hizb, Allwa, Ndeyi Daara et collecte de Sadaqa par Wave & Orange Money.",
  keywords: ["Daara.net", "Daara Sénégal", "Suivi 60 Hizb", "Allwa Coran", "Ndeyi Daara", "Sadaqa Wave", "Gestion École Coranique"],
  metadataBase: new URL('https://musages.vercel.app'),
  manifest: "/manifest.json",
  icons: {
    icon: '/logo-taleem.png',
    shortcut: '/logo-taleem.png',
    apple: '/logo-taleem.png',
  },
  applicationName: "Daara.net",
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
      <body className="bg-background text-foreground antialiased selection:bg-emerald-500/30 selection:text-emerald-500 font-sans">
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
