import Link from 'next/link'
export default function NotFound() {
  return <main className="menu-screen"><div className="home-content"><div><h1>Esta página no existe</h1><p>La canción o dificultad solicitada no está en el catálogo.</p><Link href="/catalog">Volver al catálogo</Link></div></div></main>
}
