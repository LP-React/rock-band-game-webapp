import { useEffect, useRef, useState } from 'react'
import type { GameResult } from '../game/results'
import type { Song, Difficulty } from '../songs/types'
import { difficultyLabels } from '../songs/catalog'
import { useMenuKeyboard } from './useMenuKeyboard'
export function ResultsScreen({ song, difficulty, result, saved, onRestart, onExit }: { song: Song; difficulty: Difficulty; result: GameResult; saved: boolean; onRestart: () => void; onExit: () => void }) {
  const [reveal, setReveal] = useState(0)
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const start = performance.now()
    const finish = () => { cancelAnimationFrame(frame); setReveal(1) }
    const tick = (now: number) => {
      const elapsed = Math.min(1, (now - start) / 1500)
      setReveal(1 - Math.pow(1 - elapsed, 3))
      if (elapsed < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(motion.matches ? finish : tick)
    motion.addEventListener('change', finish)
    return () => { cancelAnimationFrame(frame); motion.removeEventListener('change', finish) }
  }, [])
  const actions = useRef<HTMLDivElement>(null)
  useEffect(() => { actions.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true }) }, [])
  useMenuKeyboard(event => {
    if (event.key === 'Escape') { event.preventDefault(); onExit() }
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault()
      const buttons = [...(actions.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
      const index = buttons.findIndex(button => button === document.activeElement)
      buttons[index === 0 ? 1 : 0]?.focus({ preventScroll: true })
    }
  })
  const date = new Intl.DateTimeFormat('es', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(result.endedAt))
  return <div className="start-overlay results-overlay"><section className="results-card" aria-labelledby="results-title">
    <div className="results-track"><img src={song.artwork} alt="" /><div><span className="game-eyebrow">{result.completed ? 'CANCIÓN TERMINADA' : 'PARTIDA NO COMPLETADA'}</span><h1 id="results-title">{song.title}</h1><p>{song.artist} <span>· {difficultyLabels[difficulty]}</span></p><time className="results-date" dateTime={result.endedAt}>{date}</time></div></div>
    <div className="results-body"><div className="results-statistics"><div className="results-score-tab"><span className="game-eyebrow">PUNTUACIÓN FINAL</span><strong className="results-score"><span aria-hidden="true">{Math.round(result.score * reveal).toLocaleString('es')}</span><span className="results-sr">{result.score.toLocaleString('es')}</span></strong></div><div className="results-highlight"><div><span>ACIERTO</span><strong><span aria-hidden="true">{(result.accuracy * reveal).toFixed(2)}</span><span className="results-sr">{result.accuracy.toFixed(2)}</span><small>%</small></strong></div><div><span>COMBO MÁXIMO</span><strong><span aria-hidden="true">{Math.round(result.maxCombo * reveal)}</span><span className="results-sr">{result.maxCombo}</span><small>×</small></strong></div></div>
      <dl className="results-counts"><div><dt>Aciertos</dt><dd>{result.hits}<small> / {result.total}</small></dd></div><div><dt>Errores</dt><dd>{result.errors}</dd></div></dl>
    </div><div className="results-rating"><div className="results-ring" data-revealed={reveal > .99} aria-label={`Calificación ${result.grade}`}>
      <svg viewBox="0 0 200 200" aria-hidden="true"><circle className="results-ring-track" cx="100" cy="100" r="92" /><circle className="results-ring-fill" cx="100" cy="100" r="92" pathLength="100" strokeDasharray="100" strokeDashoffset={100 - result.accuracy * reveal} /></svg>
      <div><span>CALIFICACIÓN</span><strong>{result.grade}</strong><span>{result.completed ? 'RESULTADO FINAL' : 'SIGUE INTENTANDO'}</span></div>
    </div></div></div>
    <div className="results-bottom"><div><span>{saved ? 'Guardado en este navegador' : 'No se pudo guardar en este navegador'}</span></div><div className="results-actions" ref={actions}><button className="game-primary" onClick={onRestart}>Volver a tocar ↻</button><button onClick={onExit}>← Catálogo</button></div></div>
  </section></div>
}
