import { useEffect, useRef, useState } from 'react'
import { Prototype } from './game/prototype'
import { dragonforce, difficultyLabels, loadDragonforce } from './songs/catalog'
import type { Difficulty } from './songs/types'
import { readSettings, saveSettings, keyLabel } from './game/settings'
import { SettingsPanel } from './components/SettingsPanel'
import './App.css'
function App() {
  const canvas = useRef<HTMLCanvasElement>(null), engine = useRef<Prototype | null>(null)
  const [status, setStatus] = useState('Listo para tocar'), [running, setRunning] = useState(false)
  const [settings, setSettings] = useState(readSettings), [config, setConfig] = useState(false)
  const [error, setError] = useState(''), [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [loading, setLoading] = useState(false), [song, setSong] = useState(dragonforce)
  const ready = Object.keys(song.charts).length > 0
  useEffect(() => {
    const game = new Prototype(canvas.current!, (message, active) => { setStatus(message); setRunning(active) })
    engine.current = game
    let cancelled = false
    void loadDragonforce().then(song => { if (!cancelled) setSong(song) }).catch(error => { if (!cancelled) setError(String(error)) })
    return () => { cancelled = true; game.destroy(); engine.current = null }
  }, [])
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
      <select aria-label="Dificultad" disabled={loading || running || !ready} value={difficulty} onChange={event => setDifficulty(event.target.value as Difficulty)}>{(Object.keys(song.charts) as Difficulty[]).map(key => <option key={key} value={key}>{difficultyLabels[key]}</option>)}</select>
      <button disabled={running || loading} onClick={() => setConfig(true)}>Configuración</button><button onClick={fullscreen}>Pantalla completa</button>
    </div></header>
    <section className="stage" aria-label="Juego de guitarra"><canvas ref={canvas} tabIndex={0} aria-label={`Cinco carriles: ${settings.keys.map(keyLabel).join(', ')}. Espacio activa boost.`} />
      <div className="stage-status" aria-live="polite">{status}</div>
      {!running && <div className="start-overlay"><img src={song.artwork} alt={`Portada de ${song.album}`} /><h1>{song.title}</h1><p>{difficultyLabels[difficulty]} · {song.charts[difficulty]?.length ?? 0} grupos</p><button className="primary" disabled={loading || !ready} onClick={start}>{!ready ? 'Cargando chart…' : loading ? 'Cargando audio…' : 'Tocar canción'}</button><small>{settings.keys.map(keyLabel).join(' / ')} · Mantén las notas largas · ESPACIO: boost</small></div>}
    </section>
    <footer className="game-footer"><div><button disabled={loading || !ready} onClick={start}>Reiniciar</button><button disabled={!running} onClick={() => engine.current?.stop()}>Detener</button><button className="boost-button" disabled={!running} onClick={() => engine.current?.activateBoost()}>⚡ Boost · Espacio</button></div><label>Volumen <input type="range" min="0" max="100" disabled={loading} value={settings.volume} onChange={event => setSettings({ ...settings, volume: Number(event.target.value) })} />{settings.volume}%</label><span>Pista {settings.speed.toFixed(1)}×</span></footer>
    {error && <div className="error" role="alert">{error}<button onClick={() => setError('')}>Cerrar</button></div>}
    {config && <SettingsPanel settings={settings} onSave={setSettings} onClose={() => setConfig(false)} />}
  </main>
}
export default App
