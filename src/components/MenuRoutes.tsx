'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from '../App'
import { loadSong } from '../songs/catalog'
import type { Song } from '../songs/types'
import { HomeScreen } from './HomeScreen'
import { SongCatalog } from './SongCatalog'
import { GameScreen } from './GameScreen'

export function HomeMenu() {
  const session = useSession(), router = useRouter()
  return <HomeScreen settings={session.settings} selected={session.selected} onSongChange={session.select} onVolumeChange={volume => session.setSettings({ ...session.settings, volume })} onPlay={songId => { if (session.selected !== songId) session.select(songId); router.push('/catalog') }} onConfig={session.configure} />
}
export function CatalogMenu() {
  const session = useSession(), router = useRouter()
  return <SongCatalog selected={session.selected} difficulty={session.difficulty} volume={session.settings.volume} loading={false} error="" onSelect={session.select} onDifficulty={session.setDifficulty} onStart={() => { if (session.beginPlay()) router.push('/play') }} onBack={() => router.push('/')} onConfig={session.configure} />
}
export function PlayMenu() {
  const session = useSession(), router = useRouter()
  const { attempt } = session
  const [song, setSong] = useState<Song | null>(null), [error, setError] = useState('')
  useEffect(() => {
    let cancelled = false
    if (!attempt) { router.replace('/catalog'); return }
    void loadSong(attempt.id).then(song => { if (!cancelled) setSong(song) }).catch(error => { if (!cancelled) setError(error instanceof Error ? error.message : 'No se pudo cargar el mapa.') })
    return () => { cancelled = true }
  }, [attempt, router])
  function exit() { session.clearAttempt(); router.push('/catalog') }
  async function fullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen() }
    catch { setError('El navegador no permite pantalla completa.') }
  }
  if (!song || !attempt) return <main className="menu-screen"><div className="home-content"><div><h1>{!attempt ? 'Elige una canción en el catálogo' : error ? 'No se pudo cargar la canción' : 'Cargando mapa…'}</h1>{error && <p role="alert">{error}</p>}<button onClick={exit}>Volver al catálogo</button></div></div></main>
  return <><GameScreen song={song} difficulty={attempt.difficulty} settings={session.settings} onConfig={session.configure} onExit={exit} onFullscreen={() => void fullscreen()} />{error && <div className="error" role="alert">{error}<button onClick={() => setError('')}>Cerrar</button></div>}</>
}
