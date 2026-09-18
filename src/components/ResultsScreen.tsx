import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { GameResult } from '../game/results'
import type { Song, Difficulty } from '../songs/types'
import { difficultyLabels } from '../songs/catalog'
import { useMenuKeyboard } from './useMenuKeyboard'
export function ResultsScreen({ song, difficulty, result, saved, onRestart, onExit }: { song: Song; difficulty: Difficulty; result: GameResult; saved: boolean; onRestart: () => void; onExit: () => void }) {
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
    <div className="results-track"><img src={song.artwork} alt="" /><div><span className="game-eyebrow">{result.completed ? 'CANCIÓN TERMINADA' : 'PARTIDA NO COMPLETADA'}</span><h1 id="results-title">{song.title}</h1><p>{song.artist} <span>· {difficultyLabels[difficulty]}</span></p></div></div>
    <div className="results-body"><div className="results-statistics"><span className="game-eyebrow">PUNTUACIÓN FINAL</span><strong className="results-score">{result.score.toLocaleString('es')}</strong><div className="results-highlight"><div><span>ACIERTO</span><strong>{result.accuracy.toFixed(2)}<small>%</small></strong></div><div><span>COMBO MÁXIMO</span><strong>{result.maxCombo}<small>×</small></strong></div></div>
      <dl className="results-counts"><div><dt>Aciertos</dt><dd>{result.hits}<small> / {result.total}</small></dd></div><div><dt>Errores</dt><dd>{result.errors}</dd></div></dl>
      <div className="results-error-details"><span>{result.missed} notas perdidas</span><span>{result.wrongPresses} pulsaciones incorrectas</span><span>{result.sustainBreaks} sostenidos cortados</span>{result.remaining > 0 && <span>{result.remaining} grupos sin resolver</span>}</div>
    </div><div className="results-rating"><div className="results-ring" style={{ '--accuracy': `${result.accuracy}%` } as CSSProperties}><div><strong>{result.grade}</strong><span>CALIFICACIÓN</span></div></div><p>{result.grade === 'SS' ? '¡Una ejecución perfecta!' : result.completed ? 'Cada riff cuenta. Sigue superándote.' : 'Un nuevo intento, un nuevo ritmo.'}</p></div></div>
    <div className="results-bottom"><div><time dateTime={result.endedAt}>{date}</time><span>{saved ? 'Guardado en este navegador' : 'No se pudo guardar en este navegador'}</span></div><div className="results-actions" ref={actions}><button className="game-primary" onClick={onRestart}>Volver a tocar ↻</button><button onClick={onExit}>← Catálogo</button></div></div>
    <p className="results-note">Un acorde cuenta como un grupo. Acierto = grupos acertados / total del mapa.</p>
  </section></div>
}
