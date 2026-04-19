import { MetadataRoute } from 'next';

const host = 'https://musages.vercel.app'; // Remplacez par votre domaine de production

export default function sitemap(): MetadataRoute.Sitemap {
    const routes = ['', '/login', '/pricing', '/explore', '/terms', '/privacy'].map((route) => ({
        url: `${host}${route}`,
        lastModified: new Date(),
    }));

    return routes;
}
