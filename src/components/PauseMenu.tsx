import { useEffect, useRef } from 'react'
import { useMenuKeyboard } from './useMenuKeyboard'
import type { Song } from '../songs/types'
export function PauseMenu({ song, onResume, onRestart, onExit }: { song: Song; onResume: () => void; onRestart: () => void; onExit: () => void }) {
  const actions = useRef<HTMLDivElement>(null)
  useEffect(() => { actions.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true }) }, [])
  useMenuKeyboard(event => {
    if (!['ArrowDown', 'ArrowUp'].includes(event.key) || !(event.target instanceof HTMLElement) || !actions.current?.contains(event.target)) return
    event.preventDefault()
    const buttons = [...(actions.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
    const index = buttons.findIndex(button => button === document.activeElement)
    buttons[(index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length]?.focus()
  })
  return <div className="start-overlay pause-overlay" role="dialog" aria-labelledby="pause-title"><div className="pause-card"><h1 id="pause-title" className="pause-title">En pausa</h1><div className="pause-track"><img src={song.artwork} alt="" /><div><strong>{song.title}</strong><p>{song.artist}</p></div></div><div className="pause-actions" ref={actions}><button className="game-primary" onClick={onResume}><span>Continuar</span><kbd>ESC</kbd></button><button onClick={onRestart}><span>Reintentar</span><b>↻</b></button><button onClick={onExit}><span>Salir</span><b>←</b></button></div><small>Si mantenías una nota larga, mantén su tecla antes de continuar.</small></div></div>
}
