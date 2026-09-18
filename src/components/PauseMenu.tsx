import { useEffect, useRef } from 'react'
import { useMenuKeyboard } from './useMenuKeyboard'
import type { Song } from '../songs/types'
export function PauseMenu({ song, onResume, onRestart, onConfig, onExit }: { song: Song; onResume: () => void; onRestart: () => void; onConfig: () => void; onExit: () => void }) {
  const actions = useRef<HTMLDivElement>(null)
  useEffect(() => { actions.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true }) }, [])
  useMenuKeyboard(event => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return
    event.preventDefault()
    const buttons = [...(actions.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
    const index = buttons.findIndex(button => button === document.activeElement)
    buttons[(index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus()
  })
  return <div className="start-overlay pause-overlay" role="dialog" aria-modal="true" aria-labelledby="pause-title"><div className="pause-card"><span className="game-eyebrow">DESCANSO ENTRE RIFFS</span><div className="pause-track"><img src={song.artwork} alt="" /><div><h1 id="pause-title">En pausa</h1><strong>{song.title}</strong><p>{song.artist}</p></div></div><p className="pause-caption">Tu partida continúa justo donde la dejaste.</p><div className="pause-actions" ref={actions} onKeyDown={event => {
    if (event.key !== 'Tab') return
    const buttons = [...(actions.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
    const index = buttons.findIndex(button => button === document.activeElement)
    if ((!event.shiftKey && index === buttons.length - 1) || (event.shiftKey && index === 0)) { event.preventDefault(); buttons[event.shiftKey ? buttons.length - 1 : 0]?.focus() }
  }}><button className="game-primary" onClick={onResume}><span>Continuar</span><kbd>ESC</kbd></button><button onClick={onRestart}><span>Reiniciar canción</span><b>↻</b></button><button onClick={onConfig}><span>Configuración</span><b>⚙</b></button><button onClick={onExit}><span>Volver al catálogo</span><b>←</b></button></div><small>Si mantenías una nota larga, mantén su tecla antes de continuar.</small></div></div>
}
