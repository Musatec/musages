import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MINDOS',
    short_name: 'MINDOS',
    description: "Le système d'exploitation ultime pour les écrivains et bâtisseurs d'univers.",
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#F97316',
    icons: [
      {
        src: '/icon.svg?v=6',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
