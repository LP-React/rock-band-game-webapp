import manifest from '../generated/songs/manifest.json'
import type { Song, Difficulty } from './types'
import type { ChartNote } from '../game/chart'
import { presentations, fallbackTheme } from './presentation'
const asset = (id: string, path: string) => `/songs/${id}/media/${encodeURIComponent(path.split('/').at(-1)!)}`
export const songs = manifest.songs.map(entry => ({
  ...entry, artwork: entry.artwork ? asset(entry.id, entry.artwork) : '/favicon.svg',
  ...presentations[entry.id]?.metadata,
  theme: presentations[entry.id]?.theme ?? fallbackTheme,
  background: presentations[entry.id]?.background ?? (entry.artwork ? asset(entry.id, entry.artwork) : '/favicon.svg'),
  description: presentations[entry.id]?.description,
  preview: asset(entry.id, entry.preview),
  stems: entry.stems.map(stem => ({ url: asset(entry.id, stem.path), guitar: stem.guitar })),
  difficulties: entry.difficulties as Difficulty[], charts: {}, beats: [],
}))
export const importErrors = manifest.errors as { folder: string; message: string }[]
export async function loadSong(id: string): Promise<Song> {
  const song = songs.find(song => song.id === id)
  if (!song) throw new Error('La canción no existe en el catálogo.')
  const response = await fetch(`/songs/${id}/chart.json`)
  if (!response.ok) throw new Error('No se pudo cargar el mapa de la canción.')
  const data = await response.json()
  if (data.schemaVersion !== 1 || !data.charts || !Array.isArray(data.beats)) throw new Error('Formato de mapa no compatible.')
  const playable = Object.fromEntries(song.difficulties.map(key => [key, (data.charts[key] as ChartNote[]).filter(note => !note.open)]))
  return { ...song, charts: playable, beats: data.beats, boostPhrases: data.boostPhrases ?? [], boostByDifficulty: data.boostByDifficulty }
}
export const difficultyLabels = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil', expert: 'Experto' }
