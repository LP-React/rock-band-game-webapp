import type { Song } from './types'

export async function loadSongAudio(audio: AudioContext, song: Song): Promise<AudioBuffer[]> {
  // Fetch/decode sequentially to reduce simultaneous compressed-data allocations.
  const buffers: AudioBuffer[] = []
  for (const url of song.stems?.map(stem => stem.url) ?? [song.backing, song.guitar].filter((url): url is string => Boolean(url))) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`No se pudo cargar el audio (${response.status}).`)
    try { buffers.push(await audio.decodeAudioData(await response.arrayBuffer())) }
    catch { throw new Error('Este navegador no pudo decodificar un archivo de audio de la canción.') }
  }
  if (!buffers.length) throw new Error('La canción no tiene audio disponible.')
  return buffers
}
