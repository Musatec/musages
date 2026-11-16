import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Daara Ibnoul Khayim & École Pathé Pogne',
    short_name: 'Daara & École',
    description: "Plateforme officielle du Daara Ibnoul Khayim Al Diawziya et de l'École Franco-Arabe Pathé Pogne : Suivi Hifz, Évaluations GEC et Bulletins Bilingues.",
    start_url: '/',
    display: 'standalone',
    background_color: '#09090b',
    theme_color: '#059669',
    orientation: 'any',
    scope: '/',
    icons: [
      {
        src: '/logo-daara-ibnoul-khayim.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
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
