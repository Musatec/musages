import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MINDOS | The Creator OS',
    short_name: 'MINDOS',
    description: "Le système d'exploitation ultime pour les créateurs. Organisez votre esprit, vos finances et vos contenus.",
    start_url: '/',
    display: 'standalone',
    background_color: '#050505',
    theme_color: '#ea580c',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/icon.svg?v=6',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: '/icon.svg?v=6',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/icon.svg?v=6',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  }
}
