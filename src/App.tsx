import { useEffect, useRef, useState } from 'react'
import { Prototype } from './game/prototype'
import { songs, difficultyLabels, loadSong, importErrors } from './songs/catalog'
import type { Difficulty, Song } from './songs/types'
import { readSettings, saveSettings, keyLabel } from './game/settings'
import { SettingsPanel } from './components/SettingsPanel'
import './App.css'
function App() {
  const canvas = useRef<HTMLCanvasElement>(null), engine = useRef<Prototype | null>(null)
  const [status, setStatus] = useState('Listo para tocar'), [running, setRunning] = useState(false)
  const [paused, setPaused] = useState(false)
  const [settings, setSettings] = useState(readSettings), [config, setConfig] = useState(false)
  const [error, setError] = useState(''), [difficulty, setDifficulty] = useState<Difficulty>(songs[0].difficulties[0])
  const [selected, setSelected] = useState(songs[0].id)
  const [loading, setLoading] = useState(false), [song, setSong] = useState<Song>(songs[0])
  const ready = Object.keys(song.charts).length > 0
  useEffect(() => {
    const game = new Prototype(canvas.current!, (message, active, paused = false) => { setStatus(message); setRunning(active); setPaused(paused) })
    engine.current = game
    return () => { game.destroy(); engine.current = null }
  }, [])
  useEffect(() => {
    let cancelled = false
    void loadSong(selected).then(song => { if (!cancelled) setSong(song) }).catch(error => { if (!cancelled) setError(String(error)) })
    return () => { cancelled = true }
  }, [selected])
  useEffect(() => { if (Object.keys(song.charts).length) engine.current?.configure(song, difficulty) }, [song, difficulty])
  useEffect(() => { engine.current?.setSettings(settings); saveSettings(settings) }, [settings])
  async function start() {
    setError(''); setLoading(true)
    try { await engine.current?.start(settings.volume / 100, song, difficulty) }
    catch (error) { setError(error instanceof Error ? error.message : 'No se pudo iniciar el audio.'); engine.current?.stop() }
    finally { setLoading(false) }
  }
  async function fullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen() }
    catch { setError('El navegador no permite pantalla completa. La pista sigue ocupando la ventana.') }
  }
  return <main className="game-shell">
    <header className="game-toolbar"><span className="brand">RIFF<span> / LAB</span></span><div className="track-info"><strong>{song.title}</strong><small>{song.artist} · {song.album}</small></div><div className="toolbar-actions">
      <select aria-label="Canción" disabled={loading || running} value={selected} onChange={event => { const next = songs.find(song => song.id === event.target.value)!; engine.current?.stop(false); setError(''); setSong(next); setDifficulty(next.difficulties[0]); setSelected(next.id) }}>{songs.map(song => <option key={song.id} value={song.id}>{song.artist} — {song.title}</option>)}</select>
      <select aria-label="Dificultad" disabled={loading || running || !ready} value={difficulty} onChange={event => setDifficulty(event.target.value as Difficulty)}>{(Object.keys(song.charts) as Difficulty[]).map(key => <option key={key} value={key}>{difficultyLabels[key]}</option>)}</select>
      <button disabled={running || loading} onClick={() => setConfig(true)}>Configuración</button><button onClick={fullscreen}>Pantalla completa</button>
    </div></header>
    <section className="stage" aria-label="Juego de guitarra"><canvas ref={canvas} tabIndex={0} aria-label={`Cinco carriles: ${settings.keys.map(keyLabel).join(', ')}. Espacio activa boost.`} />
      <div className="stage-status" aria-live="polite">{status}</div>
      {!running && <div className="song-notes">{song.reactiveGuitar === false && <span>Audio completo: la guitarra no se silencia por separado.</span>}{Boolean(song.openNotes) && <span>{song.openNotes} notas abiertas pendientes; jugamos los cinco colores.</span>}</div>}
      {paused && <div className="start-overlay pause-overlay" role="dialog" aria-modal="true" aria-label="Partida en pausa"><h1>En pausa</h1><p>ESC para continuar · Tu progreso está guardado</p><button className="primary" onClick={() => void engine.current?.togglePause()}>Continuar · ESC</button><button onClick={start}>Reiniciar canción</button><button onClick={() => engine.current?.stop()}>Volver al menú</button><small>Si pausaste una nota larga, mantén su tecla antes de continuar.</small></div>}
      {!running && <div className="start-overlay"><img src={song.artwork} alt={`Portada de ${song.album}`} /><h1>{song.title}</h1><p>{difficultyLabels[difficulty]} · {song.charts[difficulty]?.length ?? 0} grupos</p><button className="primary" disabled={loading || !ready} onClick={start}>{!ready ? 'Cargando chart…' : loading ? 'Cargando audio…' : 'Tocar canción'}</button><small>{settings.keys.map(keyLabel).join(' / ')} · Mantén las notas largas · ESPACIO: boost</small></div>}
    </section>
    <footer className="game-footer"><div><button disabled={loading || !ready} onClick={start}>Reiniciar</button><button disabled={!running} onClick={() => void engine.current?.togglePause()}>{paused ? 'Continuar · ESC' : 'Pausa · ESC'}</button></div><label>Volumen <input type="range" min="0" max="100" disabled={loading} value={settings.volume} onChange={event => setSettings({ ...settings, volume: Number(event.target.value) })} />{settings.volume}%</label><span>Pista {settings.speed.toFixed(1)}×</span></footer>
    {error && <div className="error" role="alert">{error}<button onClick={() => setError('')}>Cerrar</button></div>}
    {importErrors.length > 0 && !running && <div className="import-notice">{importErrors.length} carpeta(s) omitida(s). Revisa el informe de pnpm import:songs.</div>}
    {config && <SettingsPanel settings={settings} onSave={setSettings} onClose={() => setConfig(false)} />}
  </main>
}
export default App
