// Offline amplitude envelope: silent autoplay can animate without a running AudioContext.
export async function menuLevels(url: string, signal: AbortSignal): Promise<Float32Array> {
  const response = await fetch(url, { signal })
  if (!response.ok) throw new Error('Menu audio could not be loaded')
  const buffer = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(await response.arrayBuffer())
  if (signal.aborted) return new Float32Array()
  const samples = buffer.getChannelData(0), stride = Math.floor(buffer.sampleRate / 20)
  const levels = new Float32Array(Math.ceil(samples.length / stride))
  let peak = 0
  for (let block = 0; block < levels.length; block++) {
    let sum = 0, count = 0
    for (let i = block * stride; i < Math.min(samples.length, (block + 1) * stride); i += 16) { sum += samples[i] ** 2; count++ }
    levels[block] = Math.sqrt(sum / Math.max(1, count)); peak = Math.max(peak, levels[block])
  }
  if (peak) for (let i = 0; i < levels.length; i++) levels[i] /= peak
  return levels
}
