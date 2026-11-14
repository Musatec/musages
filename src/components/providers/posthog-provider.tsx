'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { ReactNode } from 'react'

const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const isPostHogConfigured = typeof window !== 'undefined' && !!posthogKey && posthogKey !== 'phc_placeholder';

if (isPostHogConfigured) {
  posthog.init(posthogKey, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
    person_profiles: 'always',
    capture_pageview: false
  });
}

export function CSPostHogProvider({ children }: { children: ReactNode }) {
  if (!isPostHogConfigured) {
    return <>{children}</>;
  }
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
