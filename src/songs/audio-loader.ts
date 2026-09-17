import type { Song } from './types'

export async function loadSongAudio(audio: AudioContext, song: Song): Promise<AudioBuffer[]> {
  // Fetch/decode sequentially to reduce simultaneous compressed-data allocations.
  const buffers: AudioBuffer[] = []
  for (const url of [song.backing, song.guitar]) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`No se pudo cargar el audio (${response.status}).`)
    try { buffers.push(await audio.decodeAudioData(await response.arrayBuffer())) }
    catch { throw new Error('Este navegador no pudo decodificar el audio Opus de la canción.') }
  }
  if (Math.abs(buffers[0].duration - buffers[1].duration) > .1) throw new Error('Las pistas de audio tienen duraciones distintas.')
  return buffers
}
