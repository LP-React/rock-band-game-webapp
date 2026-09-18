export function chartSections(text) {
  return Object.fromEntries([...text.replace(/^\uFEFF/, '').matchAll(/\[([^\]]+)\]\s*\{([^}]*?)\}/g)].map(m => [m[1], m[2]]))
}
export function chartMetadata(section = '') {
  return Object.fromEntries(section.split(/\r?\n/).map(line => line.match(/^\s*(\w+)\s*=\s*(.*?)\s*$/)).filter(Boolean).map(m => [m[1], m[2].replace(/^"|"$/g, '')]))
}
export function convertChart(text, { delayMs = 0 } = {}) {
  const sections = chartSections(text), metadata = chartMetadata(sections.Song)
  const resolution = Number(metadata.Resolution)
  if (!Number.isInteger(resolution) || resolution <= 0) throw new Error('Invalid .chart resolution')
  const events = section => (section ?? '').split(/\r?\n/).filter(line => line.trim() && !/^\s*\/\//.test(line)).map(line => {
    const match = line.match(/^\s*(\d+)\s*=\s*([A-Z]+)\s+(.*)$/)
    if (!match) throw new Error(`Malformed chart event: ${line.trim()}`)
    const tick = Number(match[1])
    if (!Number.isSafeInteger(tick)) throw new Error('Invalid chart tick')
    return { tick, type: match[2], args: match[3].trim().split(/\s+/) }
  })
  const sync = events(sections.SyncTrack), offset = Number(metadata.Offset ?? 0) + delayMs / 1000
  if (!Number.isFinite(offset)) throw new Error('Invalid chart offset')
  if (sync.some(e => e.type === 'A')) throw new Error('Tempo anchors are not supported yet')
  const tempos = sync.filter(e => e.type === 'B').sort((a, b) => a.tick - b.tick)
  const segments = [{ tick: 0, time: offset, bpm: 120 }]
  for (const event of tempos) {
    const previous = segments.at(-1), bpm = Number(event.args[0]) / 1000
    if (!Number.isFinite(bpm) || bpm <= 0) throw new Error('Invalid chart tempo')
    segments.push({ tick: event.tick, time: previous.time + (event.tick - previous.tick) / resolution * 60 / previous.bpm, bpm })
  }
  const seconds = tick => { const segment = segments.findLast(s => s.tick <= tick); return segment.time + (tick - segment.tick) / resolution * 60 / segment.bpm }
  const charts = {}, boostByDifficulty = {}, warnings = new Set()
  let endTick = 0
  for (const difficulty of ['easy', 'medium', 'hard', 'expert']) {
    const name = difficulty[0].toUpperCase() + difficulty.slice(1) + 'Single'
    const track = events(sections[name]).sort((a, b) => a.tick - b.tick), groups = new Map(), phrases = []
    for (const event of track) {
      if (!['N', 'S'].includes(event.type)) continue
      const [kind, length] = event.args.map(Number)
      if (!Number.isInteger(kind) || !Number.isSafeInteger(length) || length < 0 || !Number.isSafeInteger(event.tick + length)) throw new Error(`Invalid event in ${name}`)
      endTick = Math.max(endTick, event.tick + length)
      if (event.type === 'S') { if (kind === 2) phrases.push({ start: seconds(event.tick), end: seconds(event.tick + length) }); continue }
      if (kind === 5 || kind === 6) { warnings.add('HOPO/tap modifiers use direct-key controls'); continue }
      if (kind > 4 && kind !== 7) throw new Error(`Unsupported guitar note ${kind}`)
      const group = groups.get(event.tick) ?? { time: seconds(event.tick), lanes: [], durations: [] }
      if (kind === 7) { if (group.lanes.length) throw new Error('Open/color chord is not supported'); group.open = true; group.openDuration = seconds(event.tick + length) - group.time }
      else { if (group.open || group.lanes.includes(kind)) throw new Error('Invalid guitar chord'); group.lanes.push(kind); group.durations.push(seconds(event.tick + length) - group.time) }
      groups.set(event.tick, group)
    }
    if (groups.size) { charts[difficulty] = [...groups.values()]; boostByDifficulty[difficulty] = phrases }
  }
  if (!Object.keys(charts).length) throw new Error('No playable five-fret lead guitar chart')
  const beats = []
  for (let tick = 0; tick <= endTick; tick += resolution) beats.push(seconds(tick))
  return { schemaVersion: 1, resolution, charts, beats, boostByDifficulty, tempoChanges: tempos.length, warnings: [...warnings] }
}
