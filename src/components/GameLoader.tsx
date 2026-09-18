'use client'
import { useMenuKeyboard } from './useMenuKeyboard'
import type { CSSProperties } from 'react'
import { themeStyle } from '../songs/presentation'
import type { SongTheme } from '../songs/presentation'
import { difficultyLabels } from '../songs/catalog'
import type { Difficulty } from '../songs/types'
interface LoadingSong { title: string; artist: string; artwork: string; background?: string; album?: string; charter?: string; theme?: SongTheme }
export function GameLoader({ song, difficulty, message = 'Cargando…', error, onRetry, onBack }: { song?: LoadingSong; difficulty?: Difficulty; message?: string; error?: string; onRetry?: () => void; onBack?: () => void }) {
  useMenuKeyboard(event => { if (event.key === 'Escape' && onBack) { event.preventDefault(); onBack() } })
  return <div className="game-loader" style={themeStyle(song?.theme) as CSSProperties} aria-busy={!error}>
    {song && <img className="loader-backdrop" src={song.background ?? song.artwork} alt="" aria-hidden="true" />}
    <div className="loader-content"><span className="loader-brand">RIFF <em>/ LAB</em></span>{song && <div className="loader-track"><img className="loader-artwork" src={song.artwork} alt={`Portada de ${song.album || song.title}`} /><div><h1>{song.title}</h1><p className="loader-artist">{song.artist}</p><div className="loader-details">{difficulty && <span className="loader-difficulty">{difficultyLabels[difficulty]}</span>}<span className="loader-charter">Mapa por {song.charter || 'la comunidad'}</span></div></div></div>}
      <div className="loader-state" role="status">{error ? <p role="alert">{error}</p> : <><span className="loader-spinner" aria-hidden="true" /><span>{message}</span></>}</div>
      {(error || onBack) && <div className="loader-actions">{error && onRetry && <button onClick={onRetry}>Reintentar</button>}{onBack && <button onClick={onBack}>← Catálogo</button>}</div>}
    </div>
  </div>
}
