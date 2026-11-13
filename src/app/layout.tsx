import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

import AppLayout from "@/components/layout/app-layout";
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
import { SpaceProvider, ActiveSpace } from "@/components/providers/space-provider";
import { OfflineBanner } from "@/components/ui/offline-banner";
import { Suspense } from "react";
import { cookies } from "next/headers";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: {
    default: "Daara Ibnoul Khayim Al Diawziya | École Ibnoul Khayim Al Jawziya (مدرسة ابن القيم الجوزية)",
    template: "%s | Daara Ibnoul Khayim Al Diawziya"
  },
  description: "Plateforme officielle de l'École Ibnoul Khayim Al Jawziya pour la Mémorisation du Saint Coran et l'Éducation Islamique. Suivi des 60 Hizbs, Ahkam, Tajweed et portail E-Daara.",
  keywords: ["Daara Ibnoul Khayim Al Diawziya", "Ecole Ibnoul Khayim Al Jawziya", "مدرسة ابن القيم الجوزية", "Mémorisation Coran", "60 Hizbs", "Tajweed", "E-Daara"],
  metadataBase: new URL('https://musages.vercel.app'),
  manifest: "/manifest.json",
  icons: {
    icon: '/logo-daara-ibnoul-khayim.png',
    shortcut: '/logo-daara-ibnoul-khayim.png',
    apple: '/logo-daara-ibnoul-khayim.png',
  },
  applicationName: "Daara Ibnoul Khayim Al Diawziya",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const messages = await getMessages();
  const cookieStore = await cookies();
  const spaceCookie = cookieStore.get("musages_active_space")?.value;
  const initialSpace: ActiveSpace = spaceCookie === "school" ? "school" : "daara";

  return (
    <html lang={locale} dir={dir} className={plusJakartaSans.variable} suppressHydrationWarning>
      <body className={cn(plusJakartaSans.className, "bg-background text-foreground antialiased selection:bg-emerald-500/30 selection:text-emerald-500 font-sans")}>
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
                <SpaceProvider initialSpace={initialSpace}>
                  <SidebarProvider>
                    <PwaRegistrar />
                    <CrispProvider />
                    <OfflineBanner />
                    <AppLayout>
                      {children}
                    </AppLayout>
                  </SidebarProvider>
                </SpaceProvider>
                <Toaster richColors position="bottom-right" />
              </NextIntlClientProvider>
            </CSPostHogProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
