import { getRequestConfig } from 'next-intl/server';
import { routing, type Locale } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically corresponds to the `[locale]` segment
    let locale = (await requestLocale) as string;

    // Ensure that a valid locale is used
    if (!locale || !routing.locales.includes(locale as Locale)) {
        locale = routing.defaultLocale;
    }

    const messages = locale === 'ar'
        ? (await import('../../messages/ar.json')).default
        : (await import('../../messages/fr.json')).default;

    return { locale, messages };
});
