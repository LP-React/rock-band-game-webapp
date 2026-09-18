import customizations from './presentation.json'
import type { Song } from './types'

export interface SongTheme { accent: string; selection: string; panel: string; onAccent: string }
interface Presentation {
  label: string
  theme?: SongTheme
  background?: string
  description?: string
  metadata?: Partial<Pick<Song, 'title' | 'artist' | 'album' | 'charter' | 'genre' | 'year'>>
}
export const presentations: Record<string, Presentation> = customizations
export const fallbackTheme: SongTheme = { accent: '#c5bedc', selection: '#eee9f8', panel: '#353046', onAccent: '#231c30' }
export function themeStyle(theme: SongTheme = fallbackTheme) {
  for (const value of Object.values(theme)) if (!/^#[a-f\d]{6}$/i.test(value)) throw new Error('Song palette colors must use six-digit hex values')
  return { '--accent': theme.accent, '--secondary': theme.selection, '--panel': theme.panel, '--on-accent': theme.onAccent }
}
