import manifest from '../generated/songs/manifest.json'
import type { Song, Difficulty } from './types'
import type { ChartNote } from '../game/chart'
const media = import.meta.glob('../musics/**/*.{opus,ogg,mp3,wav,flac,jpg,jpeg,png,webp}', { query: '?url', import: 'default', eager: true }) as Record<string, string>
const charts = import.meta.glob('../generated/songs/*.json', { query: '?url', import: 'default', eager: true }) as Record<string, string>
function asset(path: string) {
  const url = media[`../musics/${path}`]
  if (!url) throw new Error(`Recurso ausente: ${path}. Ejecuta pnpm import:songs.`)
  return url
}
export const songs = manifest.songs.map(entry => ({
  ...entry, artwork: entry.artwork ? asset(entry.artwork) : '/favicon.svg',
  stems: entry.stems.map(stem => ({ url: asset(stem.path), guitar: stem.guitar })),
  difficulties: entry.difficulties as Difficulty[], charts: {}, beats: [],
}))
export const importErrors = manifest.errors as { folder: string; message: string }[]
export async function loadSong(id: string): Promise<Song> {
  const song = songs.find(song => song.id === id)
  if (!song) throw new Error('La canción no existe en el catálogo.')
  const response = await fetch(charts[`../generated/songs/${id}.json`])
  if (!response.ok) throw new Error('No se pudo cargar el mapa de la canción.')
  const data = await response.json()
  if (data.schemaVersion !== 1 || !data.charts || !Array.isArray(data.beats)) throw new Error('Formato de mapa no compatible.')
  const playable = Object.fromEntries(song.difficulties.map(key => [key, (data.charts[key] as ChartNote[]).filter(note => !note.open)]))
  return { ...song, charts: playable, beats: data.beats, boostPhrases: data.boostPhrases ?? [], boostByDifficulty: data.boostByDifficulty }
}
export const difficultyLabels = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil', expert: 'Experto' }
