import type { Song } from './types'

export async function loadSongAudio(audio: AudioContext, song: Song, signal?: AbortSignal, onProgress?: (message: string) => void): Promise<AudioBuffer[]> {
  // Fetch/decode sequentially to reduce simultaneous compressed-data allocations.
  const buffers: AudioBuffer[] = []
  const urls = song.stems?.map(stem => stem.url) ?? [song.backing, song.guitar].filter((url): url is string => Boolean(url))
  for (const [index, url] of urls.entries()) {
    signal?.throwIfAborted()
    onProgress?.(`Descargando audio ${index + 1}/${urls.length}…`)
    const response = await fetch(url, { signal })
    if (!response.ok) throw new Error(`No se pudo cargar el audio (${response.status}).`)
    const compressed = await response.arrayBuffer()
    signal?.throwIfAborted()
    onProgress?.(`Preparando audio ${index + 1}/${urls.length}…`)
    try { buffers.push(await audio.decodeAudioData(compressed)) }
    catch { throw new Error('Este navegador no pudo decodificar un archivo de audio de la canción.') }
  }
  signal?.throwIfAborted()
  if (!buffers.length) throw new Error('La canción no tiene audio disponible.')
  return buffers
}
