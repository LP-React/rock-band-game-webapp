import info from './dragonforce-info.json'
import chartUrl from './dragonforce.json?url'
import artwork from '../musics/Dragonforce - Through The Fire & Flames (Neversoft)/album.jpg?url'
import backing from '../musics/Dragonforce - Through The Fire & Flames (Neversoft)/song.opus?url'
import guitar from '../musics/Dragonforce - Through The Fire & Flames (Neversoft)/guitar.opus?url'
import type { Song } from './types'

export const dragonforce: Song = { ...info, charts: {}, beats: [], artwork, backing, guitar }
export async function loadDragonforce(): Promise<Song> {
  const response = await fetch(chartUrl)
  if (!response.ok) throw new Error('No se pudo cargar el chart de la canción.')
  const data = await response.json()
  if (data.schemaVersion !== 1 || !data.charts || !Array.isArray(data.beats)) throw new Error('Formato de chart no compatible.')
  return { ...dragonforce, charts: data.charts, beats: data.beats, boostPhrases: data.boostPhrases ?? [] }
}
export const difficultyLabels = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil', expert: 'Experto' }
