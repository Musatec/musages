import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/*/admin/', '/*/settings/'],
        },
        sitemap: 'https://musages.vercel.app/sitemap.xml', // Remplace avec ton URL réelle si différente
    };
}
