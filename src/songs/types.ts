import type { ChartNote } from '../game/chart'
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert'
export interface Song {
  id: string
  title: string
  artist: string
  album: string
  charter: string
  duration: number
  charts: Partial<Record<Difficulty, ChartNote[]>>
  beats: number[]
  boostPhrases?: { start: number; end: number }[]
  boostByDifficulty?: Partial<Record<Difficulty, { start: number; end: number }[]>>
  artwork: string
  backing?: string
  guitar?: string
  stems?: { url: string; guitar: boolean }[]
  reactiveGuitar?: boolean
  warnings?: string[]
  openNotes?: number
}
