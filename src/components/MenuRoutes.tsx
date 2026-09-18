'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '../App'
import { songs, loadSong } from '../songs/catalog'
import type { Song, Difficulty } from '../songs/types'
import { HomeScreen } from './HomeScreen'
import { SongCatalog } from './SongCatalog'
import { GameScreen } from './GameScreen'

export function HomeMenu() {
  const session = useSession(), router = useRouter()
  return <HomeScreen settings={session.settings} count={songs.length} onPlay={() => router.push('/catalog')} onConfig={session.configure} />
}
export function CatalogMenu() {
  const session = useSession(), router = useRouter()
  return <SongCatalog selected={session.selected} difficulty={session.difficulty} volume={session.settings.volume} loading={false} error="" onSelect={session.select} onDifficulty={session.setDifficulty} onStart={() => router.push(`/play/${session.selected}/${session.difficulty}`)} onBack={() => router.push('/')} onConfig={session.configure} />
}
export function PlayMenu({ id, difficulty }: { id: string; difficulty: Difficulty }) {
  const session = useSession(), router = useRouter()
  const [song, setSong] = useState<Song | null>(null), [error, setError] = useState('')
  useEffect(() => {
    let cancelled = false
    void loadSong(id).then(song => { if (!cancelled) setSong(song) }).catch(error => { if (!cancelled) setError(error instanceof Error ? error.message : 'No se pudo cargar el mapa.') })
    return () => { cancelled = true }
  }, [id])
  function exit() { session.select(id); session.setDifficulty(difficulty); router.push('/catalog') }
  async function fullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen() }
    catch { setError('El navegador no permite pantalla completa.') }
  }
  if (!song) return <main className="menu-screen"><div className="home-content"><div><h1>{error ? 'No se pudo cargar la canción' : 'Cargando mapa…'}</h1>{error && <p role="alert">{error}</p>}<button onClick={exit}>Volver al catálogo</button></div></div></main>
  return <><GameScreen song={song} difficulty={difficulty} settings={session.settings} onSettings={session.setSettings} onExit={exit} onFullscreen={() => void fullscreen()} />{error && <div className="error" role="alert">{error}<button onClick={() => setError('')}>Cerrar</button></div>}</>
}
