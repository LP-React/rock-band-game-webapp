import { useEffect, useRef, useState } from 'react'
import { songs, loadSong } from './songs/catalog'
import type { Difficulty, Song } from './songs/types'
import { readSettings, saveSettings } from './game/settings'
import { SettingsPanel } from './components/SettingsPanel'
import { HomeScreen } from './components/HomeScreen'
import { SongCatalog } from './components/SongCatalog'
import { GameScreen } from './components/GameScreen'
import './App.css'
import './menu.css'
function App() {
  const [screen, setScreen] = useState<'home' | 'catalog' | 'game'>('home')
  const [settings, setSettings] = useState(readSettings), [config, setConfig] = useState(false)
  const [selected, setSelected] = useState(songs[0].id), [difficulty, setDifficulty] = useState<Difficulty>(songs[0].difficulties[0])
  const [song, setSong] = useState<Song | null>(null), [loading, setLoading] = useState(false), [error, setError] = useState('')
  const request = useRef(0)
  useEffect(() => { saveSettings(settings) }, [settings])
  function select(id: string) { if (loading) return; const entry = songs.find(song => song.id === id)!; setSelected(id); setDifficulty(entry.difficulties[0]); setError('') }
  function home() { request.current++; setLoading(false); setError(''); setScreen('home') }
  async function start() {
    if (loading) return
    const generation = ++request.current
    setLoading(true); setError('')
    try { const loaded = await loadSong(selected); if (generation === request.current) { setSong(loaded); setScreen('game') } }
    catch (error) { if (generation === request.current) setError(error instanceof Error ? error.message : 'No se pudo cargar la canción.') }
    finally { if (generation === request.current) setLoading(false) }
  }
  async function fullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen() }
    catch { setError('El navegador no permite pantalla completa.') }
  }
  return <>
    {screen === 'home' && <HomeScreen settings={settings} count={songs.length} onPlay={() => setScreen('catalog')} onConfig={() => setConfig(true)} />}
    {screen === 'catalog' && <SongCatalog selected={selected} difficulty={difficulty} volume={settings.volume} loading={loading} error={error} onSelect={select} onDifficulty={setDifficulty} onStart={() => void start()} onBack={home} onConfig={() => setConfig(true)} />}
    {screen === 'game' && song && <GameScreen song={song} difficulty={difficulty} settings={settings} onSettings={setSettings} onExit={() => { setError(''); setScreen('catalog') }} onFullscreen={() => void fullscreen()} />}
    {screen === 'game' && error && <div className="error" role="alert">{error}<button onClick={() => setError('')}>Cerrar</button></div>}
    {config && <SettingsPanel settings={settings} onSave={setSettings} onClose={() => setConfig(false)} />}
  </>
}
export default App
