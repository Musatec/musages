import type { NextConfig } from "next";
import withPWA from "next-pwa";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ephsigjminwavcymicxa.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.**', // Permettre d'autres sources https
      },
    ],
  },
  transpilePackages: ["react-icons", "@hello-pangea/dnd"],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://client.crisp.chat https://static.posthog.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co wss://client.crisp.chat https://eu.i.posthog.com https://*.sentry.io; img-src 'self' data: https://*.supabase.co https://client.crisp.chat https://grainy-gradients.vercel.app https://images.unsplash.com https://*.unsplash.com; style-src 'self' 'unsafe-inline' https://client.crisp.chat; font-src 'self' https://client.crisp.chat;",
          },
        ],
      },
    ];
  },
  // Forcer webpack pour next-pwa
  webpack: (config, { isServer }) => {
    return config;
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'https-calls',
        networkTimeoutSeconds: 15,
        expiration: {
          maxEntries: 150,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
});

import { withSentryConfig } from "@sentry/nextjs";

export default withSentryConfig(
  withNextIntl(pwaConfig(nextConfig)),
  {
    silent: true,
    org: "musatec",
    project: "musages",
    // SDK options
    widenClientFileUpload: true,
    tunnelRoute: "/monitoring",
  }
);
