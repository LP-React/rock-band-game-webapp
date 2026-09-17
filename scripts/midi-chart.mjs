import { parseMidi } from 'midi-file'

export function convertMidi(bytes, { delayMs = 0, sustainCutoff = 0 } = {}) {
  const midi = parseMidi(bytes)
  const resolution = midi.header.ticksPerBeat
  if (!resolution || midi.header.format !== 1) throw new Error('Expected format-1 MIDI with ticks per beat')
  const tracks = midi.tracks.map(track => {
    let tick = 0
    return track.map(event => ({ ...event, tick: tick += event.deltaTime }))
  })
  const tempos = tracks.flat().filter(e => e.type === 'setTempo').sort((a, b) => a.tick - b.tick)
  const segments = [{ tick: 0, time: 0, micros: 500000 }]
  for (const event of tempos) {
    const previous = segments.at(-1)
    const time = previous.time + (event.tick - previous.tick) / resolution * previous.micros / 1e6
    segments.push({ tick: event.tick, time, micros: event.microsecondsPerBeat })
  }
  function seconds(tick) {
    let low = 0, high = segments.length
    while (low + 1 < high) { const middle = (low + high) >> 1; if (segments[middle].tick <= tick) low = middle; else high = middle }
    const segment = segments[low]
    return segment.time + (tick - segment.tick) / resolution * segment.micros / 1e6 + delayMs / 1000
  }
  const guitar = tracks.find(track => track.some(e => e.type === 'trackName' && ['PART GUITAR', 'T1 GEMS'].includes(e.text)))
  if (!guitar) throw new Error('No five-fret lead guitar track')
  const raw = [], active = new Map()
  for (const event of guitar) {
    if (!['noteOn', 'noteOff'].includes(event.type)) continue
    const key = `${event.channel}:${event.noteNumber}`
    if (event.type === 'noteOn' && event.velocity > 0) {
      if (active.has(key)) throw new Error(`Overlapping MIDI note ${key}`)
      active.set(key, event)
    } else if (active.has(key)) {
      const start = active.get(key)
      raw.push({ pitch: start.noteNumber, tick: start.tick, end: event.tick })
      active.delete(key)
    }
  }
  if (active.size) throw new Error('Unterminated MIDI notes')
  const charts = {}
  for (const [difficulty, base] of Object.entries({ easy: 60, medium: 72, hard: 84, expert: 96 })) {
    const groups = new Map()
    for (const note of raw.filter(note => note.pitch >= base && note.pitch <= base + 4).sort((a, b) => a.tick - b.tick)) {
      const group = groups.get(note.tick) ?? { time: seconds(note.tick), lanes: [], durations: [] }
      group.lanes.push(note.pitch - base)
      group.durations.push(note.end - note.tick > sustainCutoff ? Math.max(0, seconds(note.end) - seconds(note.tick)) : 0)
      groups.set(note.tick, group)
    }
    if (groups.size) charts[difficulty] = [...groups.values()]
  }
  if (!Object.keys(charts).length) throw new Error('No playable five-fret notes')
  const endTick = Math.max(...tracks.map(track => track.at(-1)?.tick ?? 0))
  const beats = []
  for (let tick = 0; tick <= endTick; tick += resolution) beats.push(seconds(tick))
  const boostPhrases = raw.filter(note => note.pitch === 116).map(note => ({ start: seconds(note.tick), end: seconds(note.end) })).sort((a, b) => a.start - b.start)
  return { schemaVersion: 1, resolution, charts, beats, boostPhrases, tempoChanges: tempos.length }
}
