import { MetadataRoute } from 'next';

const locales = ['en', 'fr'];
const host = 'https://musages.vercel.app'; // Remplacez par votre domaine de production

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = ['', '/login', '/pricing', '/explore'].map((route) => ({
        url: `${host}${route}`,
        lastModified: new Date(),
        alternates: {
            languages: Object.fromEntries(
                locales.map((locale) => [locale, `${host}/${locale}${route}`])
            ),
        },
    }));

    return routes;
}
