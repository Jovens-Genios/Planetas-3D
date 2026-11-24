import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Planetas 3D · Exploradores',
  description: 'Os planetas 3D girando dos Exploradores (Jovens Gênios): vitrine, kit para a engenharia e catálogo.',
  icons: { icon: '/planetas/planeta-emocoes/poster.webp' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}
