import { useEffect, useRef, useState } from 'react'
import { Prototype } from '../game/prototype'
import { keyLabel } from '../game/settings'
import type { Settings } from '../game/settings'
import type { Difficulty, Song } from '../songs/types'
import { difficultyLabels } from '../songs/catalog'

export function GameScreen({ song, difficulty, settings, onSettings, onExit, onFullscreen }: { song: Song; difficulty: Difficulty; settings: Settings; onSettings: (value: Settings) => void; onExit: () => void; onFullscreen: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null), engine = useRef<Prototype | null>(null), initial = useRef(settings)
  const [status, setStatus] = useState('Cargando audio…'), [running, setRunning] = useState(false), [paused, setPaused] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState('')
  useEffect(() => {
    let cancelled = false
    const game = new Prototype(canvas.current!, (message, active, paused = false) => { if (!cancelled) { setStatus(message); setRunning(active); setPaused(paused) } })
    engine.current = game
    game.setSettings(initial.current); game.configure(song, difficulty)
    void game.start(initial.current.volume / 100, song, difficulty).catch(error => { if (!cancelled) setError(error.message) }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true; game.destroy(); engine.current = null }
  }, [song, difficulty])
  useEffect(() => { engine.current?.setSettings(settings) }, [settings])
  async function restart() {
    setError(''); setLoading(true)
    try { await engine.current?.start(settings.volume / 100, song, difficulty) }
    catch (error) { setError(error instanceof Error ? error.message : 'No se pudo cargar el audio.') }
    finally { setLoading(false) }
  }
  return <main className="game-shell">
    <header className="game-toolbar"><span className="brand">RIFF<span> / LAB</span></span><div className="track-info"><strong>{song.title}</strong><small>{song.artist} · {difficultyLabels[difficulty]}</small></div><div className="toolbar-actions"><button disabled={loading || (running && !paused)} onClick={onExit}>Catálogo</button><button onClick={onFullscreen}>Pantalla completa</button></div></header>
    <section className="stage" aria-label="Juego de guitarra"><canvas ref={canvas} tabIndex={0} aria-label={`Cinco carriles: ${settings.keys.map(keyLabel).join(', ')}. Espacio activa boost. Escape pausa.`} /><div className="stage-status" aria-live="polite">{status}</div>
      {paused && <div className="start-overlay pause-overlay" role="dialog" aria-modal="true" aria-label="Partida en pausa"><h1>En pausa</h1><p>ESC para continuar · Tu progreso está guardado</p><button className="primary" onClick={() => void engine.current?.togglePause()}>Continuar · ESC</button><button onClick={restart}>Reiniciar canción</button><button onClick={onExit}>Volver al catálogo</button><small>Si pausaste una nota larga, mantén su tecla antes de continuar.</small></div>}
      {!running && <div className="start-overlay"><img src={song.artwork} alt={`Portada de ${song.album}`} /><h1>{song.title}</h1><p>{difficultyLabels[difficulty]} · {status}</p>{error && <p role="alert">{error}</p>}<button className="primary" disabled={loading} onClick={restart}>{loading ? 'Cargando audio…' : 'Volver a tocar'}</button><button disabled={loading} onClick={onExit}>Volver al catálogo</button></div>}
    </section>
    <footer className="game-footer"><div><button disabled={loading} onClick={restart}>Reiniciar</button><button disabled={!running} onClick={() => void engine.current?.togglePause()}>{paused ? 'Continuar · ESC' : 'Pausa · ESC'}</button></div><label>Volumen <input type="range" min="0" max="100" value={settings.volume} onChange={event => onSettings({ ...settings, volume: Number(event.target.value) })} />{settings.volume}%</label><span>Pista {settings.speed.toFixed(1)}×</span></footer>
  </main>
}
