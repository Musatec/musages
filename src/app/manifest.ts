import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Daara Ibnoul Khayim Al Diawziya',
    short_name: 'Daara Ibnoul Khayim',
    description: "Plateforme officielle de l'École Ibnoul Khayim Al Jawziya pour la Mémorisation du Saint Coran et l'Éducation Islamique.",
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#059669',
    orientation: 'portrait',
    scope: '/',
    icons: [
      {
        src: '/logo-daara-ibnoul-khayim.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/logo-daara-ibnoul-khayim.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
