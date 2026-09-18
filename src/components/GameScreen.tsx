import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { themeStyle } from '../songs/presentation'
import { ResultsScreen } from './ResultsScreen'
import { saveResult } from '../game/results'
import type { GameResult } from '../game/results'
import { useMenuKeyboard } from './useMenuKeyboard'
import { GameLoader } from './GameLoader'
import { prepareImage, countdown, wait } from '../game/preparation'
import { PauseMenu } from './PauseMenu'
import { Prototype } from '../game/prototype'
import { keyLabel } from '../game/settings'
import type { Settings } from '../game/settings'
import type { Difficulty, Song } from '../songs/types'
import { difficultyLabels } from '../songs/catalog'

export function GameScreen({ song, difficulty, settings, onConfig, onExit, onFullscreen }: { song: Song; difficulty: Difficulty; settings: Settings; onConfig: () => void; onExit: () => void; onFullscreen: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null), engine = useRef<Prototype | null>(null), initial = useRef(settings)
  const preparation = useRef<AbortController | null>(null)
  const [result, setResult] = useState<GameResult | null>(null)
  const [saved, setSaved] = useState(false)
  const [step, setStep] = useState<number | null>(null)
  const [leavingLoader, setLeavingLoader] = useState(false)
  const [phase, setPhase] = useState('Descargando audio…')
  const [status, setStatus] = useState('Cargando audio…'), [running, setRunning] = useState(false), [paused, setPaused] = useState(false), [loading, setLoading] = useState(true), [error, setError] = useState('')
  useMenuKeyboard(event => {
    if (loading && step !== null && event.key === 'Escape') { event.preventDefault(); onExit() }
  })
  useEffect(() => {
    let cancelled = false
    const controller = new AbortController(); preparation.current = controller
    const loadingStarted = performance.now()
    const background = prepareImage(song.background ?? song.artwork, controller.signal).catch(() => undefined)
    let lastStatus = 0
    const game = new Prototype(canvas.current!, (message, active, paused = false) => { if (!cancelled) { const now = performance.now(); if (!active || paused || now - lastStatus >= 200) { setStatus(message); lastStatus = now } setRunning(active); setPaused(paused) } }, value => { if (!cancelled) { setResult(value); setSaved(saveResult(song.id, difficulty, value)) } })
    engine.current = game
    game.setSettings(initial.current); game.configure(song, difficulty)
    void game.start(initial.current.volume / 100, song, difficulty, { onProgress: message => { if (!cancelled) setPhase(message) }, beforeStart: async () => { await background; await wait(Math.max(0, 3000 - (performance.now() - loadingStarted)), controller.signal); if (cancelled) return; setLeavingLoader(true); game.prepareStage(); await wait(400, controller.signal); await countdown(controller.signal, value => { if (!cancelled) setStep(value) }) } }).catch(error => { if (!cancelled) setError(error.message) }).finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true; controller.abort(); preparation.current?.abort(); game.destroy(); engine.current = null }
  }, [song, difficulty])
  useEffect(() => { engine.current?.setSettings(settings) }, [settings])
  async function restart() {
    setPaused(false); setRunning(false);
    setResult(null); setError(''); setLoading(true); setStep(null); setLeavingLoader(false)
    preparation.current?.abort()
    const controller = new AbortController(); preparation.current = controller
    const loadingStarted = performance.now()
    try { await engine.current?.start(settings.volume / 100, song, difficulty, { onProgress: setPhase, beforeStart: async () => { await wait(Math.max(0, 3000 - (performance.now() - loadingStarted)), controller.signal); setLeavingLoader(true); engine.current?.prepareStage(); await wait(400, controller.signal); await countdown(controller.signal, setStep) } }) }
    catch (error) { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'No se pudo cargar el audio.') }
    finally { if (!controller.signal.aborted) setLoading(false) }
  }
  return <main className="game-shell" style={themeStyle(song.theme) as CSSProperties}>
    <img className="game-backdrop" src={song.background ?? song.artwork} alt="" aria-hidden="true" />
    <div className="stage-lines" aria-hidden="true" />
    <header className="menu-header game-header" inert={paused}><button onClick={onExit}>← Catálogo</button><span className="brand">RIFF<span> / LAB</span></span><div className="header-actions"><button className="fullscreen-icon" disabled={!running} onClick={() => void engine.current?.togglePause()} aria-label="Pausar partida" title="Pausar · ESC">Ⅱ</button><button disabled={loading} onClick={() => { if (running && !paused) void engine.current?.togglePause(); onConfig() }}>Configuración</button><button className="fullscreen-icon" onClick={onFullscreen} aria-label="Alternar pantalla completa" title="Pantalla completa"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /></svg></button></div></header>
    <section className={loading && leavingLoader ? 'stage stage-preparing' : 'stage'} aria-label="Juego de guitarra"><canvas ref={canvas} tabIndex={paused ? -1 : 0} aria-label={`Cinco carriles: ${settings.keys.map(keyLabel).join(', ')}. Espacio activa boost. Escape pausa.`} />
      <div className="stage-track"><img src={song.artwork} alt="" /><div><strong>{song.title}</strong><span>{song.artist}</span></div></div>
      {paused && !loading && <PauseMenu song={song} onResume={() => void engine.current?.togglePause()} onRestart={() => void restart()} onExit={onExit} />}
      {loading && step === null && <GameLoader song={song} difficulty={difficulty} message={phase} leaving={leavingLoader} onBack={onExit} />}
      {loading && step !== null && <div className="stage-countdown" role="status" aria-label={`Prepárate. ${step}`}><span>PREPÁRATE</span><strong key={step}>{step}</strong></div>}
      {result && !loading && <ResultsScreen song={song} difficulty={difficulty} result={result} saved={saved} onRestart={() => void restart()} onExit={onExit} />}
      {!running && !loading && !result && <div className="start-overlay"><img src={song.artwork} alt={`Portada de ${song.album}`} /><h1>{song.title}</h1><p>{difficultyLabels[difficulty]} · {status}</p>{error && <p role="alert">{error}</p>}<button className="game-primary" disabled={loading} onClick={restart}>{loading ? 'Cargando audio…' : 'Volver a tocar'}</button><button disabled={loading} onClick={onExit}>Volver al catálogo</button></div>}
    </section>
  </main>
}
