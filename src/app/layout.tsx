import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import App from '../App'
import '../index.css'
import '../App.css'
import '../menu.css'

export const metadata: Metadata = {
  title: { default: 'Riff Lab · Juego de guitarra', template: '%s · Riff Lab' },
  description: 'Juego de ritmo de guitarra con cinco colores, mapas de la comunidad, notas largas y boost. Elige una canción y toca desde tu teclado.',
  icons: { icon: '/favicon.svg' },
}
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="es"><body><App>{children}</App></body></html>
}
